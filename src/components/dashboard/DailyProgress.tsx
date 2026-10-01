import React from 'react';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Trophy } from 'lucide-react';

interface DailyProgressProps {
  completedCount: number;
  totalCount: number;
  percentage: number;
}

export const DailyProgress: React.FC<DailyProgressProps> = ({
  completedCount,
  totalCount,
  percentage,
}) => {
  const isAllDone = totalCount > 0 && completedCount === totalCount;

  return (
    <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 border-indigo-100 dark:border-indigo-950/60 shadow-sm">
      {/* Background Accent Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today's Progress
            </span>
            {isAllDone && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                <Trophy className="w-3 h-3 text-emerald-500" />
                All Done!
              </span>
            )}
          </div>
          <span className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalCount > 0 ? `${percentage}%` : '0%'}
          </span>
        </div>

        {/* Progress Bar */}
        <ProgressBar
          value={percentage}
          color={isAllDone ? 'emerald' : 'indigo'}
          size="md"
        />

        {/* Counts & Subtext */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
          <span className="font-medium">
            {totalCount > 0
              ? `${completedCount} of ${totalCount} habits completed or followed`
              : 'No habits created yet'}
          </span>
          <span className="text-slate-400 dark:text-slate-500">
            {totalCount === 0
              ? 'Add your first habit below'
              : isAllDone
              ? 'Fantastic consistency today! 🎯'
              : `${totalCount - completedCount} remaining today`}
          </span>
        </div>
      </div>
    </Card>
  );
};
