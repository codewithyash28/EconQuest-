import React from 'react';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-64" />
        </div>
        <Skeleton className="h-20 w-48 rounded-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Skeleton className="h-64 rounded-[40px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-[40px]" />
            <Skeleton className="h-48 rounded-[40px]" />
          </div>
        </div>
        <div className="space-y-8">
          <Skeleton className="h-80 rounded-[40px]" />
          <Skeleton className="h-64 rounded-[40px]" />
        </div>
      </div>
    </div>
  );
}

export function QuestSkeleton() {
  return (
    <div className="space-y-12 pb-20">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-16 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-80 rounded-[3rem]" />
        ))}
      </div>
    </div>
  );
}
