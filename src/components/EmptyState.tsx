'use client';

import { Search, FileQuestion, AlertCircle, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  type: 'initial' | 'no-results' | 'error';
  message?: string;
  onRetry?: () => void;
}

const STATES = {
  initial: {
    icon: Search,
    title: 'Search PubMed',
    description: 'Enter keywords to search millions of medical publications from the world\'s largest biomedical database.',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  'no-results': {
    icon: FileQuestion,
    title: 'No Results Found',
    description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
  error: {
    icon: AlertCircle,
    title: 'Something Went Wrong',
    description: 'We couldn\'t complete your search. Please try again.',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
};

export function EmptyState({ type, message, onRetry }: EmptyStateProps) {
  const state = STATES[type];
  const Icon = state.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className={`p-4 rounded-full ${state.iconBg} mb-4`}>
        <Icon className={`w-8 h-8 ${state.iconColor}`} />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {state.title}
      </h3>

      <p className="text-gray-600 max-w-md mb-4">
        {message || state.description}
      </p>

      {type === 'initial' && (
        <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
          <span className="px-3 py-1 bg-gray-100 rounded-full">diabetes treatment</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full">covid vaccine efficacy</span>
          <span className="px-3 py-1 bg-gray-100 rounded-full">CRISPR gene therapy</span>
        </div>
      )}

      {type === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
