'use client';

export function CardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
      {/* Header Row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 bg-gray-200 rounded-lg shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-12 h-5 bg-gray-200 rounded-md" />
            <div className="w-20 h-5 bg-gray-200 rounded-full" />
          </div>

          {/* Title skeleton */}
          <div className="space-y-1.5 mb-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>

          {/* Meta row skeleton */}
          <div className="flex items-center gap-3">
            <div className="h-3 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>

      {/* Abstract skeleton */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>

      {/* Footer skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          <div className="w-16 h-5 bg-gray-200 rounded-full" />
          <div className="w-20 h-5 bg-gray-200 rounded-full" />
          <div className="w-14 h-5 bg-gray-200 rounded-full" />
        </div>
        <div className="w-16 h-8 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}

interface LoadingSkeletonsProps {
  count?: number;
}

export function LoadingSkeletons({ count = 3 }: LoadingSkeletonsProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
