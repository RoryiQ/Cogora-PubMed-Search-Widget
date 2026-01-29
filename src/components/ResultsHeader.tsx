'use client';

interface ResultsHeaderProps {
  totalResults: number;
}

export function ResultsHeader({ totalResults }: ResultsHeaderProps) {
  return (
    <div className="py-3">
      <p className="text-sm text-white">
        Found <span className="font-semibold">{totalResults.toLocaleString()}</span> results
      </p>
    </div>
  );
}
