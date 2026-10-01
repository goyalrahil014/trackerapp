import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
};

export const HabitCardSkeleton: React.FC = () => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="w-32 h-5 rounded-md" />
            <Skeleton className="w-20 h-3 rounded-md" />
          </div>
        </div>
        <Skeleton className="w-16 h-7 rounded-lg" />
      </div>

      <div className="pt-2">
        <Skeleton className="w-full h-8 rounded-lg" />
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <Skeleton className="w-24 h-4 rounded-md" />
        <Skeleton className="w-32 h-9 rounded-xl" />
      </div>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="w-48 h-8 rounded-lg" />
        <Skeleton className="w-36 h-4 rounded-md" />
      </div>

      {/* Daily progress skeleton */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="w-32 h-5 rounded-md" />
          <Skeleton className="w-16 h-6 rounded-md" />
        </div>
        <Skeleton className="w-full h-3 rounded-full" />
        <Skeleton className="w-28 h-4 rounded-md" />
      </div>

      {/* Habits list skeleton */}
      <div className="space-y-4">
        <Skeleton className="w-32 h-6 rounded-md" />
        <HabitCardSkeleton />
        <HabitCardSkeleton />
      </div>
    </div>
  );
};
