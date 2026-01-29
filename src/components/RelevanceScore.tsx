'use client';

interface RelevanceScoreProps {
  score: number;
  size?: 'sm' | 'md';
}

function getScoreColor(score: number): { bg: string; text: string; label: string } {
  if (score >= 90) {
    return { bg: 'bg-green-100', text: 'text-green-700', label: 'Excellent' };
  } else if (score >= 70) {
    return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Good' };
  } else if (score >= 50) {
    return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Partial' };
  } else {
    return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Low' };
  }
}

export function RelevanceScore({ score, size = 'md' }: RelevanceScoreProps) {
  const { bg, text } = getScoreColor(score);

  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 text-xs'
    : 'px-2 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-md ${bg} ${text} ${sizeClasses}`}
      title={`${score}% relevance score`}
    >
      {score}%
    </span>
  );
}
