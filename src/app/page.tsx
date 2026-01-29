'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import {
  SearchBar,
  FilterBar,
  AIInsightsPanel,
  ResultCard,
  ResultsHeader,
  Pagination,
  EmptyState,
  LoadingSkeletons,
} from '@/components';
import type { FilterState, Article, AIInsights } from '@/types';
import { searchPubMed, saveArticle, getAISummary } from '@/lib/api';
import { ArrowLeft } from 'lucide-react';

type ViewState = 'landing' | 'loading' | 'results' | 'no-results' | 'error';

const DEFAULT_FILTERS: FilterState = {
  dateRange: 'all',
  articleTypes: [],
  sortBy: 'relevance',
  freeFullTextOnly: false,
  language: 'english',
  countries: [],
};

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('landing');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [results, setResults] = useState<Article[]>([]);
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [avgRelevancy, setAvgRelevancy] = useState(0);
  const [avgFreshness, setAvgFreshness] = useState(0);

  const pageSize = 10;

  // Calculate freshness score based on publication date
  const calculateFreshness = (dateStr: string): number => {
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
  };

  const handleSearch = useCallback(async (query: string, page: number = 1) => {
    setSearchQuery(query);
    setViewState('loading');
    setCurrentPage(page);
    setIsLoadingAI(true);
    setInsights(null);

    try {
      const response = await searchPubMed(query, page, pageSize, filters);

      if (response.results.length === 0) {
        setResults([]);
        setTotalResults(0);
        setViewState('no-results');
        setInsights(null);
        setIsLoadingAI(false);
        return;
      }

      setResults(response.results);
      setTotalResults(response.totalResults);
      setViewState('results');

      // Calculate average scores
      const avgRel = response.avgRelevancy ||
        Math.round(response.results.reduce((sum, a) => sum + a.relevanceScore, 0) / response.results.length);
      setAvgRelevancy(avgRel);

      const avgFresh = Math.round(
        response.results.reduce((sum, a) => sum + calculateFreshness(a.pubDate), 0) / response.results.length
      );
      setAvgFreshness(avgFresh);

      // Set AI insights if available
      if (response.aiInsights) {
        setInsights(response.aiInsights);
      }

      setIsLoadingAI(false);
    } catch (error) {
      console.error('Search failed:', error);
      setViewState('error');
      setIsLoadingAI(false);
    }
  }, [filters, pageSize]);

  const handleFilterChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
    // Don't auto-search - user must click "Go" to apply new filters
  }, []);

  const handlePageChange = useCallback((page: number) => {
    handleSearch(searchQuery, page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchQuery, handleSearch]);

  const handleSaveArticle = useCallback(async (pmid: string) => {
    const article = results.find(a => a.pmid === pmid);
    if (!article) return;

    try {
      await saveArticle(article);
      setSavedArticles(prev => {
        const next = new Set(prev);
        next.add(pmid);
        return next;
      });
    } catch (error) {
      console.error('Failed to save article:', error);
      // Still mark as saved locally for UX
      setSavedArticles(prev => {
        const next = new Set(prev);
        next.add(pmid);
        return next;
      });
    }
  }, [results]);

  const handleGetSummary = useCallback(async (pmid: string) => {
    const article = results.find(a => a.pmid === pmid);
    if (!article) {
      return {
        summary: 'Article not found.',
        studyType: 'Unknown',
        keyFindings: [],
        clinicalImplications: '',
        tags: [],
        themes: [],
      };
    }

    try {
      const summaryData = await getAISummary(pmid, article.title, article.abstract);
      return summaryData;
    } catch (error) {
      console.error('Failed to get summary:', error);
      return {
        summary: 'Unable to generate summary at this time.',
        studyType: 'Unknown',
        keyFindings: [],
        clinicalImplications: '',
        tags: [],
        themes: [],
      };
    }
  }, [results]);

  const handleRetry = useCallback(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, handleSearch]);

  const handleBackToLanding = useCallback(() => {
    setViewState('landing');
    setSearchQuery('');
    setResults([]);
    setInsights(null);
  }, []);

  const totalPages = Math.ceil(totalResults / pageSize);

  // Landing View - Google style
  if (viewState === 'landing') {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 relative"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          {/* Cogora Logo */}
          <div className="mb-8">
            <Image
              src="/Cogora_logo_White.svg"
              alt="Cogora"
              width={280}
              height={80}
              priority
            />
          </div>

          {/* Tagline */}
          <div className="flex items-center justify-center gap-2 text-white/90 text-lg mb-8">
            <span>AI-Powered</span>
            <Image
              src="/PubMed-Logo-300x107.webp"
              alt="PubMed"
              width={100}
              height={36}
              className="inline-block"
            />
            <span>Search</span>
          </div>

          {/* Search Bar */}
          <div className="w-full">
            <SearchBar
              onSearch={handleSearch}
              isLoading={false}
              placeholder="Search millions of medical publications..."
              value={searchQuery}
            />
          </div>

          {/* Example searches */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-white/60 text-sm">Try:</span>
            <button
              onClick={() => handleSearch('diabetes treatment')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition-colors"
            >
              diabetes treatment
            </button>
            <button
              onClick={() => handleSearch('covid vaccine efficacy')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition-colors"
            >
              covid vaccine efficacy
            </button>
            <button
              onClick={() => handleSearch('CRISPR gene therapy')}
              className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-sm rounded-full transition-colors"
            >
              CRISPR gene therapy
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Results View
  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >

      {/* Compact header with back button and search */}
      <div className="bg-black/40 backdrop-blur-md sticky top-0 z-40 relative">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToLanding}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors shrink-0"
              aria-label="Back to search"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>

            <Image
              src="/Cogora_logo_White.svg"
              alt="Cogora"
              width={100}
              height={28}
              className="shrink-0"
            />

            <div className="flex-1">
              <SearchBar
                onSearch={(q) => handleSearch(q, 1)}
                isLoading={viewState === 'loading'}
                placeholder="Search PubMed..."
                value={searchQuery}
              />
            </div>
          </div>
        </div>

        {/* Filters - sticky below header */}
        {viewState !== 'loading' && (
          <div className="max-w-5xl mx-auto">
            <FilterBar
              filters={filters}
              onFilterChange={handleFilterChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        )}
      </div>

      <main className="max-w-5xl mx-auto px-4 py-4 relative z-10">

        {/* AI Insights */}
        {(viewState === 'results' || isLoadingAI) && (
          <div className="mb-4">
            <AIInsightsPanel
              insights={insights}
              isLoading={isLoadingAI && !insights}
              avgRelevancy={avgRelevancy}
              avgFreshness={avgFreshness}
            />
          </div>
        )}

        {/* Loading State */}
        {viewState === 'loading' && (
          <div className="mt-4">
            <LoadingSkeletons count={3} />
          </div>
        )}

        {/* No Results */}
        {viewState === 'no-results' && (
          <EmptyState type="no-results" />
        )}

        {/* Error */}
        {viewState === 'error' && (
          <EmptyState type="error" onRetry={handleRetry} />
        )}

        {/* Results */}
        {viewState === 'results' && results.length > 0 && (
          <>
            <ResultsHeader
              totalResults={totalResults}
            />

            <div className={viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
              : 'space-y-4'
            }>
              {results.map((article) => (
                <ResultCard
                  key={article.pmid}
                  article={article}
                  onSave={handleSaveArticle}
                  onGetSummary={handleGetSummary}
                  isSaved={savedArticles.has(article.pmid)}
                />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalResults={totalResults}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </main>
    </div>
  );
}
