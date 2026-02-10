import { NextRequest, NextResponse } from 'next/server';

const PMC_BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

// Fetch full article text from PubMed Central
async function fetchFullText(pmcId: string): Promise<string> {
  try {
    const url = `${PMC_BASE_URL}/efetch.fcgi?db=pmc&id=${pmcId}&retmode=xml`;
    const response = await fetch(url);
    if (!response.ok) return '';

    const xml = await response.text();

    // Extract body text from PMC XML
    const bodyMatch = xml.match(/<body>([\s\S]*?)<\/body>/);
    if (!bodyMatch) return '';

    // Strip XML tags and clean up whitespace
    const text = bodyMatch[1]
      .replace(/<title>([^<]*)<\/title>/g, '\n\n## $1\n\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\n {2,}/g, '\n')
      .trim();

    return text;
  } catch (error) {
    console.error('Failed to fetch full text for', pmcId, error);
    return '';
  }
}

// Calculate freshness score based on publication date
function calculateFreshness(dateStr: string): number {
  try {
    const pubDate = new Date(dateStr);
    const now = new Date();
    const daysSincePublished = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSincePublished <= 30) return 100;
    if (daysSincePublished <= 365) return Math.max(70, 100 - Math.floor(daysSincePublished / 12));
    if (daysSincePublished <= 1095) return Math.max(40, 70 - Math.floor((daysSincePublished - 365) / 25));
    return Math.max(10, 40 - Math.floor((daysSincePublished - 1095) / 100));
  } catch {
    return 50;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { article, webhookUrl } = body;

    if (!article || !article.pmid) {
      return NextResponse.json(
        { error: 'Article data is required' },
        { status: 400 }
      );
    }

    // Fetch full article text from PMC if available
    const fullText = article.pmcId ? await fetchFullText(article.pmcId) : '';

    // Prepare payload for webhook (e.g., Airtable)
    const payload = {
      pmid: article.pmid,
      title: article.title,
      authors: article.authors?.map((a: { name: string }) => a.name).join(', ') || '',
      journal: article.journal,
      pubDate: article.pubDate,
      doi: article.doi || '',
      abstract: article.abstract || '',
      aiSummary: article.aiSummary || '',
      pubmedUrl: `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
      fullArticleUrl: article.pmcId
        ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${article.pmcId}/`
        : article.doi
          ? `https://doi.org/${article.doi}`
          : `https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`,
      doiUrl: article.doi ? `https://doi.org/${article.doi}` : '',
      pmcUrl: article.pmcId ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${article.pmcId}/` : '',
      meshTerms: article.meshTerms?.join(', ') || '',
      keywords: article.keywords?.join(', ') || '',
      pubTypes: article.pubTypes?.join(', ') || '',
      hasFullText: article.hasFullText || false,
      relevanceScore: article.relevanceScore || 0,
      freshnessScore: calculateFreshness(article.pubDate || ''),
      fullText: fullText,
      hasFullTextContent: fullText.length > 0,
      savedAt: new Date().toISOString(),
    };

    // Use provided webhook URL or default from env
    const targetUrl = webhookUrl || process.env.DEFAULT_WEBHOOK_URL;

    if (!targetUrl) {
      // STUB: Log to console instead of sending to webhook
      console.log('\n========== ARTICLE SAVED (STUB) ==========');
      console.log('PMID:', payload.pmid);
      console.log('Title:', payload.title);
      console.log('Authors:', payload.authors);
      console.log('Journal:', payload.journal);
      console.log('Date:', payload.pubDate);
      console.log('DOI:', payload.doi);
      console.log('Full Article URL:', payload.fullArticleUrl);
      console.log('PubMed URL:', payload.pubmedUrl);
      console.log('MeSH Terms:', payload.meshTerms);
      console.log('Saved At:', payload.savedAt);
      console.log('==========================================\n');

      return NextResponse.json({
        success: true,
        message: 'Article saved (logged to console)',
        pmid: article.pmid,
      });
    }

    // Send to webhook if URL is configured
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Webhook error:', error);
      return NextResponse.json(
        { error: 'Webhook delivery failed', details: error },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Article saved successfully',
      pmid: article.pmid,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Failed to save article', details: String(error) },
      { status: 500 }
    );
  }
}
