'use client';

import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Brain,
  Leaf,
  Target,
  Loader2,
  User,
  FlaskConical,
  Lightbulb,
} from 'lucide-react';
import { useState } from 'react';
import type { Article } from '@/types';

// Brand colors for tags with text color
const BRAND_COLORS: { bg: string; text: string }[] = [
  { bg: '#8dc85b', text: '#1a1a1a' },
  { bg: '#bed747', text: '#1a1a1a' },
  { bg: '#cadb41', text: '#1a1a1a' },
  { bg: '#00b4d7', text: '#ffffff' },
  { bg: '#85d2df', text: '#1a1a1a' },
  { bg: '#0097c4', text: '#ffffff' },
  { bg: '#0ebff1', text: '#1a1a1a' },
  { bg: '#9bd6f5', text: '#1a1a1a' },
];

function getTagColor(str: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BRAND_COLORS[Math.abs(hash) % BRAND_COLORS.length];
}

interface SummaryData {
  summary: string;
  studyType: string;
  keyFindings: string[];
  clinicalImplications: string;
  tags: string[];
  themes: string[];
}

interface ResultCardProps {
  article: Article;
  onSave?: (pmid: string) => void;
  onGetSummary?: (pmid: string) => Promise<SummaryData>;
  isSaved?: boolean;
}

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

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatAuthors(authors: Article['authors']): { name: string; affiliation?: string } | null {
  if (!authors || authors.length === 0) return null;
  return authors[0]; // Return first author with affiliation
}

export function ResultCard({ article, onSave, onGetSummary, isSaved = false }: ResultCardProps) {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  const freshnessScore = calculateFreshness(article.pubDate);
  const firstAuthor = formatAuthors(article.authors);

  const handleGetSummary = async () => {
    if (isLoadingSummary || summaryData) return;
    setIsLoadingSummary(true);

    if (onGetSummary) {
      try {
        const result = await onGetSummary(article.pmid);
        setSummaryData(result);
      } catch (e) {
        setSummaryData({
          summary: 'Unable to generate summary.',
          studyType: 'Unknown',
          keyFindings: [],
          clinicalImplications: '',
          tags: [],
          themes: [],
        });
      }
    }

    setIsLoadingSummary(false);
  };

  // Use AI-generated tags if available, otherwise fall back to MeSH/keywords
  const displayTags = summaryData?.tags?.length
    ? summaryData.tags
    : [...article.meshTerms.slice(0, 2), ...article.keywords.slice(0, 2)];

  return (
    <article className="bg-white/80 backdrop-blur-md border border-white/50 rounded-xl p-4 hover:shadow-lg transition-all">
      {/* Top Row - Scores Left, Save Right */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-lg" title="Relevancy Score">
            <Target className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">{article.relevanceScore}%</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg" title="Freshness Score">
            <Leaf className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">{freshnessScore}%</span>
          </div>
          {summaryData?.studyType && summaryData.studyType !== 'Unknown' && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 rounded-lg" title="Study Type">
              <FlaskConical className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">{summaryData.studyType}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => onSave?.(article.pmid)}
          disabled={isSaved}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0
                     ${isSaved
                       ? 'bg-green-600 text-white cursor-default'
                       : 'bg-gray-900 text-white hover:bg-gray-800'}`}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              Save
            </>
          )}
        </button>
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 leading-snug line-clamp-2 mb-1">
        {article.title}
      </h3>

      {/* Author + Affiliation */}
      {firstAuthor && (
        <div className="flex items-start gap-1.5 text-sm text-gray-600 mb-2">
          <User className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            <span className="font-medium">{firstAuthor.name}</span>
            {firstAuthor.affiliation && (
              <span className="text-gray-500"> · {firstAuthor.affiliation}</span>
            )}
            {article.authors.length > 1 && (
              <span className="text-gray-400"> +{article.authors.length - 1} more</span>
            )}
          </span>
        </div>
      )}

      {/* Abstract Preview - only show if no summary */}
      {!summaryData && article.abstract && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {article.abstract}
        </p>
      )}

      {/* Meta Row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mb-2">
        <span>{formatDate(article.pubDate)}</span>
        <span>{article.journalAbbrev || article.journal}</span>
      </div>

      {article.doi && (
        <a
          href={`https://doi.org/${article.doi}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
        >
          <ExternalLink className="w-3 h-3" />
          DOI: {article.doi}
        </a>
      )}

      {/* AI Summary Section */}
      {summaryData && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          {/* Summary */}
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            <span className="text-blue-600 font-medium">Summary: </span>
            {summaryData.summary}
          </p>

          {/* Key Findings */}
          {summaryData.keyFindings.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Key Findings:</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {summaryData.keyFindings.map((finding, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Clinical Implications */}
          {summaryData.clinicalImplications && (
            <div className="mb-3 p-2 bg-amber-50 rounded-lg">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-sm text-amber-800">
                  <span className="font-medium">Clinical Implications: </span>
                  {summaryData.clinicalImplications}
                </p>
              </div>
            </div>
          )}

          {/* AI-generated Themes */}
          {summaryData.themes.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Themes:</p>
              <div className="flex flex-wrap gap-1">
                {summaryData.themes.map((theme, i) => (
                  <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer - Tags and Get Summary */}
      <div className="mt-3 pt-3 border-t border-gray-300">
        <div className="flex items-center justify-between gap-2">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {displayTags.slice(0, 4).map((tag, i) => {
              const colors = getTagColor(tag);
              return (
                <span
                  key={i}
                  className="px-3 py-1 text-xs font-medium rounded-full"
                  style={{ backgroundColor: colors.bg, color: colors.text }}
                >
                  {tag}
                </span>
              );
            })}
            {article.hasFullText && (
              <span
                className="px-3 py-1 text-white text-xs font-medium rounded-full"
                style={{ backgroundColor: '#0097c4' }}
              >
                Free Full Text
              </span>
            )}
          </div>

          {/* Get Summary Button - only show if no summary yet */}
          {!summaryData && (
            <button
              onClick={handleGetSummary}
              disabled={isLoadingSummary}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all shrink-0
                         bg-gradient-to-r from-gray-900 to-blue-900 text-white hover:from-gray-800 hover:to-blue-800 disabled:opacity-50"
            >
              {isLoadingSummary ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Get Summary
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
