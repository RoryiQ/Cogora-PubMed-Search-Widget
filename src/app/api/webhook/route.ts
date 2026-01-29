import { NextRequest, NextResponse } from 'next/server';

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
      doiUrl: article.doi ? `https://doi.org/${article.doi}` : '',
      pmcUrl: article.pmcId ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${article.pmcId}/` : '',
      meshTerms: article.meshTerms?.join(', ') || '',
      keywords: article.keywords?.join(', ') || '',
      pubTypes: article.pubTypes?.join(', ') || '',
      hasFullText: article.hasFullText || false,
      relevanceScore: article.relevanceScore || 0,
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
      console.log('URL:', payload.url);
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
