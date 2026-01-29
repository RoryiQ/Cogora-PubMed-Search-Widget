export interface Author {
  name: string;
  affiliation?: string;
}

export interface Article {
  pmid: string;
  title: string;
  authors: Author[];
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

export interface FilterState {
  dateRange: 'all' | 'week' | 'month' | 'year' | '5years' | 'custom';
  customDateFrom?: string;
  customDateTo?: string;
  articleTypes: string[];
  sortBy: 'relevance' | 'date_desc' | 'date_asc';
  freeFullTextOnly: boolean;
  language: 'all' | 'english';
  countries: string[]; // Country codes array
}

export interface AIInsights {
  summary: string;
  themes: string[];
  suggestedQueries?: string[];
}

export interface SearchResults {
  success: boolean;
  totalResults: number;
  page: number;
  pageSize: number;
  results: Article[];
  aiInsights?: AIInsights;
}

export type TagType = 'mesh' | 'keyword' | 'pubType' | 'fullText';

export interface Tag {
  label: string;
  type: TagType;
}
