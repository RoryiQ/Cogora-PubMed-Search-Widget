import { NextRequest, NextResponse } from 'next/server';
import { search } from '@/lib/pubmed';
import { generateInsights, calculateRelevance } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      page = 1,
      pageSize = 10,
      filters = {},
    } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Search PubMed
    const { articles, total } = await search({
      query,
      page,
      pageSize,
      dateRange: filters.dateRange || 'all',
      articleTypes: filters.articleTypes || [],
      sortBy: filters.sortBy || 'relevance',
      freeFullTextOnly: filters.freeFullTextOnly || false,
      countries: filters.countries || [],
    });

    // Calculate relevance scores
    for (const article of articles) {
      article.relevanceScore = calculateRelevance(article, query);
    }

    // Generate AI insights if we have results and an API key
    let aiInsights = null;
    const openRouterKey = process.env.OPEN_ROUTER_DEV_API_KEY;

    if (articles.length > 0 && openRouterKey) {
      try {
        aiInsights = await generateInsights(articles, query, openRouterKey);
      } catch (e) {
        console.error('Failed to generate insights:', e);
      }
    }

    // Calculate average scores for insights
    const avgRelevancy = articles.length > 0
      ? Math.round(articles.reduce((sum, a) => sum + a.relevanceScore, 0) / articles.length)
      : 0;

    return NextResponse.json({
      success: true,
      totalResults: total,
      page,
      pageSize,
      results: articles,
      aiInsights,
      avgRelevancy,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: String(error) },
      { status: 500 }
    );
  }
}
