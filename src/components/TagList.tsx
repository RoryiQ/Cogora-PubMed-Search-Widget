'use client';

import type { TagType } from '@/types';

interface Tag {
  label: string;
  type: TagType;
}

interface TagListProps {
  tags: Tag[];
  maxVisible?: number;
  onTagClick?: (tag: string) => void;
}

const TAG_STYLES: Record<TagType, { bg: string; text: string }> = {
  mesh: { bg: 'bg-blue-50', text: 'text-blue-700' },
  keyword: { bg: 'bg-purple-50', text: 'text-purple-700' },
  pubType: { bg: 'bg-green-50', text: 'text-green-700' },
  fullText: { bg: 'bg-orange-50', text: 'text-orange-700' },
};

export function TagList({ tags, maxVisible = 4, onTagClick }: TagListProps) {
  const visibleTags = tags.slice(0, maxVisible);
  const hiddenCount = tags.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleTags.map((tag, index) => {
        const styles = TAG_STYLES[tag.type];
        return (
          <button
            key={`${tag.type}-${index}`}
            onClick={() => onTagClick?.(tag.label)}
            className={`px-2 py-0.5 text-xs font-medium rounded-full border border-transparent
                       ${styles.bg} ${styles.text}
                       hover:opacity-80 transition-opacity`}
          >
            {tag.label}
          </button>
        );
      })}
      {hiddenCount > 0 && (
        <span className="px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded-full">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
}
