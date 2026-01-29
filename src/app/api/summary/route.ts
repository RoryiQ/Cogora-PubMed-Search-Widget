import { NextRequest, NextResponse } from 'next/server';
import { generateSummary, ArticleSummary } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, abstract, pmid } = body;

    if (!abstract || !title) {
      return NextResponse.json(
        { error: 'Title and abstract are required' },
        { status: 400 }
      );
    }

    const openRouterKey = process.env.OPEN_ROUTER_DEV_API_KEY;

    if (!openRouterKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const summaryData: ArticleSummary = await generateSummary(abstract, title, openRouterKey);

    return NextResponse.json({
      success: true,
      pmid,
      ...summaryData,
    });
  } catch (error) {
    console.error('Summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary', details: String(error) },
      { status: 500 }
    );
  }
}
