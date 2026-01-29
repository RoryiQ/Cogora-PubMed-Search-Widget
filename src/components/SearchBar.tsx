'use client';

import { Search, X, Loader2 } from 'lucide-react';
import { useState, useCallback, useEffect, useRef } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  value?: string;
}

export function SearchBar({
  onSearch,
  isLoading = false,
  placeholder = "Search medical literature...",
  value = '',
}: SearchBarProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with external value when it changes (parse into tags)
  useEffect(() => {
    if (value) {
      // Split by common separators and filter empty strings
      const parsed = value.split(/\s+AND\s+|\s+OR\s+/i).map(t => t.trim()).filter(Boolean);
      if (parsed.length > 0) {
        setTags(parsed);
      }
    } else {
      setTags([]);
    }
  }, [value]);

  const addTag = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
      setInputValue('');
    }
  }, [inputValue, tags]);

  const removeTag = useCallback((tagToRemove: string) => {
    setTags(prev => prev.filter(t => t !== tagToRemove));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        // Add as tag
        addTag();
      } else if (tags.length > 0) {
        // No input but have tags - run search
        onSearch(tags.join(' AND '));
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      // Remove last tag when backspace on empty input
      setTags(prev => prev.slice(0, -1));
    }
  }, [inputValue, tags, addTag, onSearch]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    // Add any pending input as tag first
    const allTags = inputValue.trim()
      ? [...tags, inputValue.trim()]
      : tags;

    if (allTags.length > 0 && !isLoading) {
      setTags(allTags);
      setInputValue('');
      onSearch(allTags.join(' AND '));
    }
  }, [tags, inputValue, isLoading, onSearch]);

  const handleClearAll = useCallback(() => {
    setTags([]);
    setInputValue('');
    inputRef.current?.focus();
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const hasContent = tags.length > 0 || inputValue.trim();

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center">
        <div
          onClick={focusInput}
          className="w-full min-h-12 pl-12 pr-24 py-2 bg-white border border-gray-200 rounded-xl
                     flex flex-wrap items-center gap-2 cursor-text transition-all"
        >
          <div className="absolute left-4 text-gray-400">
            <Search className="w-5 h-5" />
          </div>

          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800
                         text-sm font-medium rounded-full"
            >
              {tag}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className="p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : "Add another term..."}
            disabled={isLoading}
            style={{ outline: 'none', boxShadow: 'none' }}
            className="flex-1 min-w-32 bg-transparent border-none ring-0 shadow-none
                       outline-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none
                       text-gray-900 placeholder-gray-400 disabled:cursor-not-allowed
                       [&:focus]:outline-none [&:focus]:ring-0 [&:focus]:shadow-none"
          />
        </div>

        {hasContent && !isLoading && (
          <button
            type="button"
            onClick={handleClearAll}
            className="absolute right-24 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Clear all"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={!hasContent || isLoading}
          className="absolute right-2 h-8 px-5 bg-blue-600 text-white text-sm font-medium rounded-lg
                     hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching</span>
            </>
          ) : (
            <span>Go</span>
          )}
        </button>
      </div>
    </form>
  );
}
