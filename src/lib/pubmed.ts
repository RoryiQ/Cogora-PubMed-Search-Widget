// PubMed E-utilities API Client

import { buildCountriesQuery } from './countries';

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

interface PubMedSearchParams {
  query: string;
  page?: number;
  pageSize?: number;
  dateRange?: 'all' | 'week' | 'month' | 'year' | '5years';
  articleTypes?: string[];
  sortBy?: 'relevance' | 'date_desc' | 'date_asc';
  freeFullTextOnly?: boolean;
  countries?: string[];
}

interface ESearchResult {
  esearchresult: {
    count: string;
    idlist: string[];
    querytranslation?: string;
  };
}

interface ESummaryResult {
  result: {
    uids: string[];
    [pmid: string]: {
      uid: string;
      pubdate: string;
      title: string;
      authors: { name: string; authtype: string }[];
      source: string;
      fulljournalname: string;
      sortfirstauthor: string;
      elocationid?: string;
      articleids: { idtype: string; value: string }[];
      pubtype: string[];
    } | string[];
  };
}

// Build search query with filters
function buildSearchQuery(params: PubMedSearchParams): string {
  let query = params.query;

  // Date filter
  if (params.dateRange && params.dateRange !== 'all') {
    const dateMap: Record<string, string> = {
      week: '7',
      month: '30',
      year: '365',
      '5years': '1825',
    };
    const days = dateMap[params.dateRange];
    if (days) {
      query += ` AND ("last ${days} days"[dp])`;
    }
  }

  // Article type filter
  if (params.articleTypes && params.articleTypes.length > 0) {
    const typeQuery = params.articleTypes.map(t => `"${t}"[pt]`).join(' OR ');
    query += ` AND (${typeQuery})`;
  }

  // Free full text filter
  if (params.freeFullTextOnly) {
    query += ' AND free full text[sb]';
  }

  // Countries filter
  if (params.countries && params.countries.length > 0) {
    const countriesQuery = buildCountriesQuery(params.countries);
    if (countriesQuery) {
      query += ` AND ${countriesQuery}`;
    }
  }

  return query;
}

// Get sort parameter
function getSortParam(sortBy?: string): string {
  switch (sortBy) {
    case 'date_desc':
      return 'pub_date';
    case 'date_asc':
      return 'pub_date';
    default:
      return 'relevance';
  }
}

// Search PubMed and get PMIDs
export async function searchPubMed(params: PubMedSearchParams): Promise<{ pmids: string[]; total: number }> {
  const query = buildSearchQuery(params);
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const retstart = (page - 1) * pageSize;
  const sort = getSortParam(params.sortBy);

  const searchUrl = new URL(`${BASE_URL}/esearch.fcgi`);
  searchUrl.searchParams.set('db', 'pubmed');
  searchUrl.searchParams.set('term', query);
  searchUrl.searchParams.set('retmode', 'json');
  searchUrl.searchParams.set('retmax', pageSize.toString());
  searchUrl.searchParams.set('retstart', retstart.toString());
  searchUrl.searchParams.set('sort', sort);
  searchUrl.searchParams.set('usehistory', 'n');

  const response = await fetch(searchUrl.toString());
  if (!response.ok) {
    throw new Error(`PubMed search failed: ${response.statusText}`);
  }

  const data: ESearchResult = await response.json();

  return {
    pmids: data.esearchresult.idlist || [],
    total: parseInt(data.esearchresult.count, 10) || 0,
  };
}

// Fetch article details by PMIDs
export async function fetchArticles(pmids: string[]): Promise<Article[]> {
  if (pmids.length === 0) return [];

  const summaryUrl = new URL(`${BASE_URL}/esummary.fcgi`);
  summaryUrl.searchParams.set('db', 'pubmed');
  summaryUrl.searchParams.set('id', pmids.join(','));
  summaryUrl.searchParams.set('retmode', 'json');
  summaryUrl.searchParams.set('version', '2.0');

  const response = await fetch(summaryUrl.toString());
  if (!response.ok) {
    throw new Error(`PubMed fetch failed: ${response.statusText}`);
  }

  const data: ESummaryResult = await response.json();
  const articles: Article[] = [];

  for (const pmid of pmids) {
    const article = data.result[pmid];
    if (!article || Array.isArray(article)) continue;

    // Extract DOI and PMC ID
    let doi: string | undefined;
    let pmcId: string | undefined;
    for (const id of article.articleids || []) {
      if (id.idtype === 'doi') doi = id.value;
      if (id.idtype === 'pmc') pmcId = id.value;
    }

    articles.push({
      pmid: article.uid,
      title: article.title || 'Untitled',
      authors: (article.authors || []).map(a => ({ name: a.name })),
      journal: article.fulljournalname || article.source || 'Unknown',
      journalAbbrev: article.source || '',
      pubDate: article.pubdate || '',
      abstract: '', // ESummary doesn't include abstracts - need EFetch for that
      doi,
      pmcId,
      hasFullText: !!pmcId,
      meshTerms: [],
      keywords: [],
      pubTypes: article.pubtype || [],
      relevanceScore: 0, // Will be calculated
      url: `https://pubmed.ncbi.nlm.nih.gov/${article.uid}/`,
    });
  }

  return articles;
}

// Fetch abstracts using EFetch (XML)
export async function fetchAbstracts(pmids: string[]): Promise<Map<string, string>> {
  if (pmids.length === 0) return new Map();

  const fetchUrl = new URL(`${BASE_URL}/efetch.fcgi`);
  fetchUrl.searchParams.set('db', 'pubmed');
  fetchUrl.searchParams.set('id', pmids.join(','));
  fetchUrl.searchParams.set('rettype', 'abstract');
  fetchUrl.searchParams.set('retmode', 'xml');

  const response = await fetch(fetchUrl.toString());
  if (!response.ok) {
    throw new Error(`PubMed abstract fetch failed: ${response.statusText}`);
  }

  const xml = await response.text();
  const abstracts = new Map<string, string>();

  // Parse XML to extract abstracts and MeSH terms
  // Simple regex parsing (for production, use proper XML parser)
  const articleRegex = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
  let match;

  while ((match = articleRegex.exec(xml)) !== null) {
    const articleXml = match[1];

    // Extract PMID
    const pmidMatch = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/);
    if (!pmidMatch) continue;
    const pmid = pmidMatch[1];

    // Extract Abstract
    const abstractMatch = articleXml.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g);
    if (abstractMatch) {
      const abstractText = abstractMatch
        .map(a => a.replace(/<[^>]+>/g, '').trim())
        .join(' ');
      abstracts.set(pmid, abstractText);
    }
  }

  return abstracts;
}

// Fetch MeSH terms
export async function fetchMeshTerms(pmids: string[]): Promise<Map<string, string[]>> {
  if (pmids.length === 0) return new Map();

  const fetchUrl = new URL(`${BASE_URL}/efetch.fcgi`);
  fetchUrl.searchParams.set('db', 'pubmed');
  fetchUrl.searchParams.set('id', pmids.join(','));
  fetchUrl.searchParams.set('retmode', 'xml');

  const response = await fetch(fetchUrl.toString());
  if (!response.ok) {
    return new Map();
  }

  const xml = await response.text();
  const meshMap = new Map<string, string[]>();

  const articleRegex = /<PubmedArticle>([\s\S]*?)<\/PubmedArticle>/g;
  let match;

  while ((match = articleRegex.exec(xml)) !== null) {
    const articleXml = match[1];

    const pmidMatch = articleXml.match(/<PMID[^>]*>(\d+)<\/PMID>/);
    if (!pmidMatch) continue;
    const pmid = pmidMatch[1];

    const meshTerms: string[] = [];
    const meshRegex = /<DescriptorName[^>]*>([^<]+)<\/DescriptorName>/g;
    let meshMatch;
    while ((meshMatch = meshRegex.exec(articleXml)) !== null) {
      meshTerms.push(meshMatch[1]);
    }

    // Also get keywords
    const keywordRegex = /<Keyword[^>]*>([^<]+)<\/Keyword>/g;
    while ((meshMatch = keywordRegex.exec(articleXml)) !== null) {
      meshTerms.push(meshMatch[1]);
    }

    meshMap.set(pmid, meshTerms);
  }

  return meshMap;
}

// Combined search function
export async function search(params: PubMedSearchParams) {
  // Step 1: Search for PMIDs
  const { pmids, total } = await searchPubMed(params);

  if (pmids.length === 0) {
    return { articles: [], total: 0 };
  }

  // Step 2: Fetch article summaries
  const articles = await fetchArticles(pmids);

  // Step 3: Fetch abstracts
  const abstracts = await fetchAbstracts(pmids);

  // Step 4: Fetch MeSH terms
  const meshTerms = await fetchMeshTerms(pmids);

  // Combine data
  for (const article of articles) {
    article.abstract = abstracts.get(article.pmid) || '';
    const terms = meshTerms.get(article.pmid) || [];
    article.meshTerms = terms.slice(0, 5);
    article.keywords = terms.slice(5, 10);
  }

  return { articles, total };
}

// Types
export interface Article {
  pmid: string;
  title: string;
  authors: { name: string; affiliation?: string }[];
  journal: string;
  journalAbbrev: string;
  pubDate: string;
  abstract: string;
  aiSummary?: string;
  doi?: string;
  pmcId?: string;
  hasFullText: boolean;
  meshTerms: string[];
  keywords: string[];
  pubTypes: string[];
  relevanceScore: number;
  url: string;
}
