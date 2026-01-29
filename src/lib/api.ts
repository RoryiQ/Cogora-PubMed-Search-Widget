// Frontend API client

import type { Article, FilterState, AIInsights } from '@/types';

interface SearchResponse {
  success: boolean;
  totalResults: number;
  page: number;
  pageSize: number;
  results: Article[];
  aiInsights: AIInsights | null;
  avgRelevancy: number;
  error?: string;
}

interface SummaryResponse {
  success: boolean;
  pmid: string;
  summary: string;
  studyType: string;
  keyFindings: string[];
  clinicalImplications: string;
  tags: string[];
  themes: string[];
  error?: string;
}

interface WebhookResponse {
  success: boolean;
  message: string;
  pmid: string;
  error?: string;
}

// Search PubMed
export async function searchPubMed(
  query: string,
  page: number = 1,
  pageSize: number = 10,
  filters: Partial<FilterState> = {}
): Promise<SearchResponse> {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      page,
      pageSize,
      filters,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Search failed');
  }

  return response.json();
}

// Get AI summary for an article - returns structured data
export async function getAISummary(
  pmid: string,
  title: string,
  abstract: string
): Promise<SummaryResponse> {
  const response = await fetch('/api/summary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pmid,
      title,
      abstract,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Summary generation failed');
  }

  return response.json();
}

// Save article via webhook
export async function saveArticle(article: Article): Promise<WebhookResponse> {
  const response = await fetch('/api/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      article,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Save failed');
  }

  return response.json();
}
