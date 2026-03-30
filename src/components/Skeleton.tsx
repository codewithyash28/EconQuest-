import React from 'react';

interface SkeletonProps {
  className?: string;
  key?: any;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div className={`bg-white/5 animate-pulse rounded-2xl ${className}`} />
  );
};

export const QuestSkeleton = () => (
  <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 h-80 flex flex-col space-y-4">
    <div className="flex justify-between">
      <Skeleton className="w-24 h-6" />
      <Skeleton className="w-16 h-6" />
    </div>
    <Skeleton className="w-full h-8" />
    <Skeleton className="w-3/4 h-8" />
    <Skeleton className="w-full h-20 flex-1" />
    <div className="flex justify-between pt-4 border-t border-white/5">
      <Skeleton className="w-20 h-6" />
      <Skeleton className="w-10 h-10 rounded-2xl" />
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-12 animate-pulse">
    <div className="flex flex-col md:flex-row justify-between gap-6">
      <div className="space-y-4">
        <Skeleton className="w-32 h-6" />
        <Skeleton className="w-64 h-16" />
      </div>
      <Skeleton className="w-48 h-20" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-48 rounded-[40px]" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Skeleton className="lg:col-span-2 h-96 rounded-[40px]" />
      <Skeleton className="h-96 rounded-[40px]" />
    </div>
  </div>
);

export const ReviewSkeleton = () => (
  <div className="max-w-3xl mx-auto space-y-12 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-48 h-10" />
      </div>
      <Skeleton className="w-24 h-10 rounded-full" />
    </div>
    <Skeleton className="h-[500px] rounded-[40px]" />
  </div>
);

export const GroupSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="flex flex-col md:flex-row justify-between gap-6">
      <div className="flex items-center space-x-6">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="w-32 h-4" />
          <Skeleton className="w-64 h-12" />
        </div>
      </div>
      <Skeleton className="w-48 h-20 rounded-3xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Skeleton className="lg:col-span-2 h-[600px] rounded-[40px]" />
      <div className="space-y-8">
        <Skeleton className="h-64 rounded-[40px]" />
        <Skeleton className="h-96 rounded-[40px]" />
      </div>
    </div>
  </div>
);
