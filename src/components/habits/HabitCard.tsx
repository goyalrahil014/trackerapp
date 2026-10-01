import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  Circle,
  Flame,
  MoreVertical,
  Pencil,
  RotateCcw,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import type { HabitWithStats, LogStatus } from '../../types/habit';
import { renderHabitIcon } from '../../lib/icons';
import { HabitHistory } from './HabitHistory';
import { Card } from '../ui/Card';

interface HabitCardProps {
  habit: HabitWithStats;
  onMarkStatus: (habitId: string, status: LogStatus | 'unrecorded') => void;
  onEdit?: (habit: HabitWithStats) => void;
  onArchive?: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onMarkStatus,
  onEdit,
  onArchive,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { stats, type, name, icon, color } = habit;
  const isGood = type === 'good';
  const todayStatus = stats.todayStatus;

  const handlePrimaryClick = () => {
    if (todayStatus === 'success') {
      onMarkStatus(habit.id, 'unrecorded');
    } else {
      onMarkStatus(habit.id, 'success');
    }
  };

  const handleFailureClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (todayStatus === 'failure') {
      onMarkStatus(habit.id, 'unrecorded');
    } else {
      onMarkStatus(habit.id, 'failure');
    }
  };

  const handleUndoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onMarkStatus(habit.id, 'unrecorded');
  };

  const colorMap: Record<string, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400',
    sky: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-400',
  };

  const iconColorClass = colorMap[color || 'indigo'] || colorMap.indigo;

  const getPercentageColor = (pct: number | null) => {
    if (pct === null) return 'text-slate-400 dark:text-slate-500';
    if (pct >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (pct >= 50) return 'text-indigo-600 dark:text-indigo-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  return (
    <Card
      className="p-5 relative transition-all duration-200 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-sm"
      hoverEffect
    >
      <div className="flex flex-col gap-4">
        {/* Top Header: Circular toggle, Title, Type badge, Percentage */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {/* Circular Checkbox */}
            <button
              onClick={handlePrimaryClick}
              className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                todayStatus === 'success'
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 hover:bg-emerald-600 scale-105'
                  : todayStatus === 'failure'
                  ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/30 hover:bg-rose-600 scale-105'
                  : 'border-2 border-slate-300 dark:border-slate-600 text-transparent hover:border-indigo-500 dark:hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30'
              }`}
              title={
                todayStatus === 'success'
                  ? 'Completed today (click to undo)'
                  : todayStatus === 'failure'
                  ? 'Failed today (click to mark success)'
                  : 'Click to mark as completed/followed today'
              }
              aria-label={`Toggle status for ${name}`}
            >
              {todayStatus === 'success' && <Check className="w-4 h-4 stroke-[3]" />}
              {todayStatus === 'failure' && <X className="w-4 h-4 stroke-[3]" />}
              {todayStatus === 'unrecorded' && <Circle className="w-3.5 h-3.5 stroke-[2] opacity-0 hover:opacity-40" />}
            </button>

            {/* Habit Icon & Name */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${iconColorClass} shrink-0`}>
                  {renderHabitIcon(icon, 'w-4 h-4')}
                </div>
                <h3 className="font-semibold text-base text-slate-900 dark:text-white truncate">
                  {name}
                </h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    isGood
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                  }`}
                >
                  {isGood ? 'Good Habit' : 'Bad Habit (Avoid)'}
                </span>

                {stats.currentStreak > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                    {stats.currentStreak}d streak
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Adherence Percentage & Dropdown Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <div className={`text-xl font-bold tracking-tight ${getPercentageColor(stats.adherencePercentage)}`}>
                {stats.adherencePercentage !== null ? `${stats.adherencePercentage}%` : '--%'}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Last 30 days
              </div>
            </div>

            {/* Options Menu Toggle */}
            {(onEdit || onArchive) && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Habit options"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-1.5 animate-in fade-in zoom-in-95 duration-100">
                      {onEdit && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onEdit(habit);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit Habit
                        </button>
                      )}

                      <button
                        onClick={handleFailureClick}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {todayStatus === 'failure' ? 'Undo Failure' : 'Mark as Failed / Slipped'}
                      </button>

                      {todayStatus !== 'unrecorded' && (
                        <button
                          onClick={handleUndoClick}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Clear Today's Status
                        </button>
                      )}

                      {onArchive && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            onArchive(habit.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors border-t border-slate-100 dark:border-slate-800 mt-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Archive Habit
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 30-Day Tick History */}
        <div className="pt-1">
          <HabitHistory history={stats.history} habitType={type} />
        </div>

        {/* Action Button Section */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {todayStatus === 'success' && (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isGood ? 'Completed today' : 'Avoided today'}
              </span>
            )}
            {todayStatus === 'failure' && (
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-medium">
                <XCircle className="w-3.5 h-3.5" />
                {isGood ? 'Missed today' : 'Slipped today'}
              </span>
            )}
            {todayStatus === 'unrecorded' && (
              <span className="text-slate-400 dark:text-slate-500">Not recorded today</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {todayStatus === 'unrecorded' ? (
              <>
                <button
                  onClick={handleFailureClick}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  Didn't follow
                </button>
                <button
                  onClick={handlePrimaryClick}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  {isGood ? 'Mark as done' : 'Mark as avoided'}
                </button>
              </>
            ) : todayStatus === 'success' ? (
              <button
                onClick={handleUndoClick}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 transition-colors"
                title="Click to undo"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                {isGood ? 'Done today (Undo)' : 'Avoided today (Undo)'}
              </button>
            ) : (
              <button
                onClick={handleUndoClick}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/70 dark:hover:bg-rose-900/80 text-rose-800 dark:text-rose-200 transition-colors"
                title="Click to undo"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                Failed today (Undo)
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
