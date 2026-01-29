// OpenRouter API Client for AI Summaries

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

// Structured summary response
export interface ArticleSummary {
  summary: string;
  studyType: string;
  keyFindings: string[];
  clinicalImplications: string;
  tags: string[];
  themes: string[];
}

// Generate AI summary for a single article - returns structured JSON
export async function generateSummary(
  abstract: string,
  title: string,
  apiKey: string
): Promise<ArticleSummary> {
  if (!abstract || abstract.length < 50) {
    return {
      summary: 'Abstract not available for summarization.',
      studyType: 'Unknown',
      keyFindings: [],
      clinicalImplications: '',
      tags: [],
      themes: [],
    };
  }

  const prompt = `Analyze this medical research paper and extract structured information for a healthcare professional.

Title: ${title}

Abstract: ${abstract}

Respond ONLY with valid JSON in this exact format:
{
  "summary": "2-3 sentence summary of the paper focusing on what was studied and what was found",
  "studyType": "e.g., Randomized Controlled Trial, Meta-Analysis, Cohort Study, Case Report, Review, etc.",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "clinicalImplications": "1-2 sentences on practical implications for clinicians",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "themes": ["broader theme 1", "broader theme 2", "broader theme 3"]
}

JSON:`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://cogora.com',
      'X-Title': 'Cogora PubMed Search',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-haiku',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenRouter error:', error);
    throw new Error(`OpenRouter API failed: ${response.statusText}`);
  }

  const data: OpenRouterResponse = await response.json();
  const content = data.choices[0]?.message?.content?.trim() || '';

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || 'Summary unavailable.',
        studyType: parsed.studyType || 'Unknown',
        keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
        clinicalImplications: parsed.clinicalImplications || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
        themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 3) : [],
      };
    }
  } catch (e) {
    console.error('Failed to parse summary JSON:', e);
  }

  return {
    summary: content.slice(0, 300) || 'Summary unavailable.',
    studyType: 'Unknown',
    keyFindings: [],
    clinicalImplications: '',
    tags: [],
    themes: [],
  };
}

// Legacy string-only summary for backwards compatibility
export async function generateSummaryString(
  abstract: string,
  title: string,
  apiKey: string
): Promise<string> {
  const result = await generateSummary(abstract, title, apiKey);
  return result.summary;
}

// Generate insights for search results
export async function generateInsights(
  articles: { title: string; abstract: string; pubDate: string }[],
  query: string,
  apiKey: string
): Promise<{
  summary: string;
  themes: string[];
  suggestedQueries: string[];
}> {
  if (articles.length === 0) {
    return {
      summary: 'No results to analyze.',
      themes: [],
      suggestedQueries: [],
    };
  }

  // Take first 5 articles for analysis
  const sampleArticles = articles.slice(0, 5);
  const articlesText = sampleArticles
    .map((a, i) => `${i + 1}. ${a.title}\nDate: ${a.pubDate}\nAbstract: ${a.abstract?.slice(0, 300) || 'N/A'}...`)
    .join('\n\n');

  const prompt = `Analyze these PubMed search results for the query "${query}" and provide insights.

Articles:
${articlesText}

Respond in this exact JSON format:
{
  "summary": "A 2-3 sentence overview of what these results cover and their relevance",
  "themes": ["theme1", "theme2", "theme3", "theme4"],
  "suggestedQueries": ["related search 1", "related search 2", "related search 3"]
}

JSON response:`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://cogora.com',
      'X-Title': 'Cogora PubMed Search',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3.5-haiku',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    console.error('OpenRouter insights error:', await response.text());
    return {
      summary: 'Unable to generate insights at this time.',
      themes: [],
      suggestedQueries: [],
    };
  }

  const data: OpenRouterResponse = await response.json();
  const content = data.choices[0]?.message?.content?.trim() || '';

  try {
    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        summary: parsed.summary || 'Analysis complete.',
        themes: Array.isArray(parsed.themes) ? parsed.themes.slice(0, 4) : [],
        suggestedQueries: Array.isArray(parsed.suggestedQueries) ? parsed.suggestedQueries.slice(0, 3) : [],
      };
    }
  } catch (e) {
    console.error('Failed to parse insights JSON:', e);
  }

  return {
    summary: content.slice(0, 300) || 'Analysis complete.',
    themes: [],
    suggestedQueries: [],
  };
}

// Calculate relevance score based on query match
export function calculateRelevance(
  article: { title: string; abstract: string; meshTerms: string[] },
  query: string
): number {
  const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  const titleLower = article.title.toLowerCase();
  const abstractLower = article.abstract.toLowerCase();
  const meshLower = article.meshTerms.join(' ').toLowerCase();

  let score = 50; // Base score

  for (const term of queryTerms) {
    // Title match (most important)
    if (titleLower.includes(term)) {
      score += 15;
    }
    // Abstract match
    if (abstractLower.includes(term)) {
      score += 10;
    }
    // MeSH term match
    if (meshLower.includes(term)) {
      score += 5;
    }
  }

  // Cap at 100
  return Math.min(100, Math.max(10, score));
}
