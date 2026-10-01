import React from 'react';
import { useHabits } from '../hooks/useHabits';
import { Card } from '../components/ui/Card';
import { ProgressBar } from '../components/ui/ProgressBar';
import { renderHabitIcon } from '../lib/icons';
import { HabitHistory } from '../components/habits/HabitHistory';
import {
  Activity,
  CheckCircle2,
  Flame,
  Percent,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

export const Analytics: React.FC = () => {
  const { habits, overallAnalytics, loading } = useHabits();

  if (loading && habits.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-48 h-8 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const {
    consistencyScore,
    bestCurrentStreak,
    bestLongestStreak,
    totalSuccessfulDays,
    totalActiveHabits,
  } = overallAnalytics;

  const getConsistencyFeedback = (score: number | null) => {
    if (score === null) return 'Not enough data yet';
    if (score >= 85) return 'Exceptional consistency! Keep the momentum';
    if (score >= 70) return 'Solid consistency! You are building great habits';
    if (score >= 50) return 'Steady progress, stay committed';
    return 'Early stage. Every day is a fresh opportunity';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Consistency & Analytics
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          Review your 30-day adherence, streaks, and progress patterns.
        </p>
      </div>

      {habits.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-2 border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white">No analytics data yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create habits on your dashboard and check back as you log your daily progress.
          </p>
        </Card>
      ) : (
        <>
          {/* Top 4 Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {/* 1. Consistency Score */}
            <Card className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Consistency
                </span>
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {consistencyScore !== null ? `${consistencyScore}%` : '--%'}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Last 30-day average
                </div>
              </div>
            </Card>

            {/* 2. Best Current Streak */}
            <Card className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Active Streak
                </span>
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                  <Flame className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight flex items-baseline gap-1">
                  <span>{bestCurrentStreak}</span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">days</span>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Best current habit streak
                </div>
              </div>
            </Card>

            {/* 3. Longest Streak */}
            <Card className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Longest Streak
                </span>
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight flex items-baseline gap-1">
                  <span>{bestLongestStreak}</span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">days</span>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Best 30-day streak
                </div>
              </div>
            </Card>

            {/* 4. Total Successful Days */}
            <Card className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total Successes
                </span>
                <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-baseline gap-1">
                  <span>{totalSuccessfulDays}</span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">logs</span>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Across all {totalActiveHabits} habits
                </div>
              </div>
            </Card>
          </div>

          {/* Consistency Highlight Card */}
          <Card className="p-6 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-200/60 dark:border-indigo-900/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Overall Adherence
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Your consistency is {consistencyScore !== null ? `${consistencyScore}%` : 'calculating'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {getConsistencyFeedback(consistencyScore)}
                </p>
              </div>

              <div className="sm:w-64">
                <ProgressBar
                  value={consistencyScore || 0}
                  color="gradient"
                  size="md"
                  showLabel
                />
              </div>
            </div>
          </Card>

          {/* Habit-Level Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Habit-Level Adherence
              </h2>
              <span className="text-xs text-slate-400 font-medium">Last 30 Calendar Days</span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {habits.map((habit) => {
                const { stats, name, type, icon } = habit;
                const adherence = stats.adherencePercentage;
                const isGood = type === 'good';

                return (
                  <Card key={habit.id} className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {renderHabitIcon(icon, 'w-4 h-4')}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                            {name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                isGood
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {isGood ? 'Good' : 'Avoidance'}
                            </span>
                            <span className="text-xs text-slate-400">
                              {stats.successfulDays} of {stats.recordedDays} days completed
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Percentage & Streaks */}
                      <div className="text-right shrink-0">
                        <div className="text-xl font-bold text-slate-900 dark:text-white">
                          {adherence !== null ? `${adherence}%` : '--%'}
                        </div>
                        <div className="flex items-center justify-end gap-2 text-[11px] text-slate-400 font-medium mt-0.5">
                          <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400">
                            <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {stats.currentStreak}d streak
                          </span>
                          <span>·</span>
                          <span>Best: {stats.longestStreak}d</span>
                        </div>
                      </div>
                    </div>

                    {/* Mini Adherence Progress Bar */}
                    <ProgressBar
                      value={adherence || 0}
                      color={adherence && adherence >= 80 ? 'emerald' : adherence && adherence >= 50 ? 'indigo' : 'rose'}
                      size="sm"
                    />

                    {/* 30-Day Tick History */}
                    <div className="pt-1">
                      <HabitHistory history={stats.history} habitType={type} />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
