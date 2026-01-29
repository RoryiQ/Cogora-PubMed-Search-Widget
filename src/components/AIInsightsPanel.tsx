'use client';

import { Lightbulb, Brain, Target, Leaf, TrendingUp } from 'lucide-react';
import type { AIInsights } from '@/types';

interface AIInsightsPanelProps {
  insights: AIInsights | null;
  isLoading?: boolean;
  avgRelevancy?: number;
  avgFreshness?: number;
}

export function AIInsightsPanel({ insights, isLoading = false, avgRelevancy = 85, avgFreshness = 72 }: AIInsightsPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-white animate-pulse" />
          <span className="text-sm font-semibold text-white">AI Insights</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
          <div className="h-3 bg-white/10 rounded animate-pulse w-3/4" />
        </div>
      </div>
    );
  }

  if (!insights) {
    return null;
  }

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-xl p-4">
      {/* Header Row */}
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-white" />
        <h3 className="text-sm font-semibold text-white">AI Insights</h3>
      </div>

      {/* Metrics Row */}
      <div className="flex flex-wrap gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-white/70">Avg Relevancy:</span>
          <span className="text-sm font-semibold text-white">{avgRelevancy}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-green-400" />
          <span className="text-xs text-white/70">Avg Freshness:</span>
          <span className="text-sm font-semibold text-white">{avgFreshness}%</span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-white/90 leading-relaxed mb-3">{insights.summary}</p>

      {/* Themes */}
      {insights.themes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-white/70 font-medium">Key themes:</span>
          {insights.themes.map((theme, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-white/10 text-white text-xs rounded-full"
            >
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Suggested Searches */}
      {insights.suggestedQueries && insights.suggestedQueries.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/70 font-medium">Suggested:</span>
          {insights.suggestedQueries.map((query, index) => (
            <button
              key={index}
              className="px-2 py-1 bg-white/10 text-white text-xs rounded-lg
                         hover:bg-white/20 transition-colors"
            >
              {query}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
