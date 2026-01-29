'use client';

import { Calendar, FileText, ArrowUpDown, ChevronDown, Check, LayoutGrid, List, Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { FilterState } from '@/types';
import { COUNTRIES } from '@/lib/countries';

const DATE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: 'year', label: 'Last Year' },
  { value: '5years', label: 'Last 5 Years' },
] as const;

const ARTICLE_TYPES = [
  { value: 'clinical trial', label: 'Clinical Trial' },
  { value: 'review', label: 'Review' },
  { value: 'systematic review', label: 'Systematic Review' },
  { value: 'meta-analysis', label: 'Meta-Analysis' },
  { value: 'case reports', label: 'Case Report' },
  { value: 'journal article', label: 'Journal Article' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
] as const;

interface DropdownProps {
  label: string;
  icon: React.ReactNode;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}

function Dropdown({ label, icon, value, options, onChange }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-lg
                   text-sm text-white hover:bg-black/50 transition-colors"
      >
        {icon}
        <span>{selectedOption?.label || label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-black/80 backdrop-blur-md rounded-lg shadow-lg z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-white
                         hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg"
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="w-4 h-4 text-blue-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface MultiSelectDropdownProps {
  label: string;
  icon: React.ReactNode;
  values: string[];
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
}

function MultiSelectDropdown({ label, icon, values, options, onChange }: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleValue = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter(v => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  const displayLabel = values.length > 0
    ? `${values.length} selected`
    : label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-lg
                   text-sm text-white hover:bg-black/50 transition-colors"
      >
        {icon}
        <span>{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-black/80 backdrop-blur-md rounded-lg shadow-lg z-50">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleValue(option.value)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white
                         hover:bg-white/10 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className={`w-4 h-4 border rounded flex items-center justify-center
                              ${values.includes(option.value)
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-white/50'}`}>
                {values.includes(option.value) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface CountryMultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
}

function CountryMultiSelect({ values, onChange }: CountryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleValue = (code: string) => {
    if (values.includes(code)) {
      onChange(values.filter(v => v !== code));
    } else {
      onChange([...values, code]);
    }
  };

  const displayLabel = values.length > 0
    ? `${values.length} ${values.length === 1 ? 'country' : 'countries'}`
    : 'All Countries';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-lg
                   text-sm text-white hover:bg-black/50 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{displayLabel}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 max-h-64 overflow-y-auto bg-black/80 backdrop-blur-md rounded-lg shadow-lg z-50">
          {values.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-white
                         hover:bg-white/10 rounded-t-lg border-b border-white/10"
            >
              <span>Clear all</span>
            </button>
          )}
          {COUNTRIES.map((country, index) => (
            <button
              key={country.code}
              type="button"
              onClick={() => toggleValue(country.code)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-white
                         hover:bg-white/10 ${index === COUNTRIES.length - 1 ? 'rounded-b-lg' : ''}
                         ${values.length === 0 && index === 0 ? 'rounded-t-lg' : ''}`}
            >
              <div className={`w-4 h-4 border rounded flex items-center justify-center
                              ${values.includes(country.code)
                                ? 'bg-blue-500 border-blue-500'
                                : 'border-white/50'}`}>
                {values.includes(country.code) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span>{country.flag} {country.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export function FilterBar({ filters, onFilterChange, viewMode, onViewModeChange }: FilterBarProps) {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2">
      <span className="text-sm text-white/80 mr-1">Filters:</span>

      <Dropdown
        label="Date Range"
        icon={<Calendar className="w-4 h-4" />}
        value={filters.dateRange}
        options={DATE_OPTIONS}
        onChange={(value) => updateFilter('dateRange', value as FilterState['dateRange'])}
      />

      <MultiSelectDropdown
        label="Article Type"
        icon={<FileText className="w-4 h-4" />}
        values={filters.articleTypes}
        options={ARTICLE_TYPES}
        onChange={(values) => updateFilter('articleTypes', values)}
      />

      <Dropdown
        label="Sort By"
        icon={<ArrowUpDown className="w-4 h-4" />}
        value={filters.sortBy}
        options={SORT_OPTIONS}
        onChange={(value) => updateFilter('sortBy', value as FilterState['sortBy'])}
      />

      {/* Country Filter */}
      <CountryMultiSelect
        values={filters.countries}
        onChange={(values) => updateFilter('countries', values)}
      />

      <label className="flex items-center gap-2 px-3 py-2 bg-black/40 backdrop-blur-md rounded-lg text-sm text-white cursor-pointer hover:bg-black/50 transition-colors">
        <input
          type="checkbox"
          checked={filters.freeFullTextOnly}
          onChange={(e) => updateFilter('freeFullTextOnly', e.target.checked)}
          className="w-4 h-4 rounded border-white/50 bg-transparent text-blue-500 focus:ring-blue-500"
        />
        <span>Free Full Text</span>
      </label>

      {/* View Mode Toggle */}
      {viewMode && onViewModeChange && (
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-lg ml-auto">
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-md transition-colors
                       ${viewMode === 'list' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            aria-label="List view"
          >
            <List className={`w-4 h-4 ${viewMode === 'list' ? 'text-white' : 'text-white/60'}`} />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-md transition-colors
                       ${viewMode === 'grid' ? 'bg-white/20' : 'hover:bg-white/10'}`}
            aria-label="Grid view"
          >
            <LayoutGrid className={`w-4 h-4 ${viewMode === 'grid' ? 'text-white' : 'text-white/60'}`} />
          </button>
        </div>
      )}
    </div>
  );
}
