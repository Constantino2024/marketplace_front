import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="bg-white border border-gray-100 rounded-2xl p-3 h-full">
    <Skeleton className="w-full aspect-[3/4] rounded-xl mb-4" />
    <Skeleton className="h-4 w-3/4 mb-2" />
    <Skeleton className="h-3 w-1/2 mb-3" />
    <div className="flex gap-1 mb-3">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="w-3 h-3 rounded-full" />
      ))}
    </div>
    <div className="flex justify-between items-center">
      <Skeleton className="h-6 w-20" />
      <Skeleton className="w-10 h-10 rounded-xl" />
    </div>
  </div>
);

export const CategorySkeleton = () => (
  <div className="flex flex-col items-center gap-3 min-w-[120px]">
    <Skeleton className="w-20 h-20 rounded-full" />
    <Skeleton className="h-3 w-16" />
    <Skeleton className="h-2 w-12" />
  </div>
);