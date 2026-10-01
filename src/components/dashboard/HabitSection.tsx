import React from 'react';
import type { HabitWithStats, LogStatus } from '../../types/habit';
import { HabitCard } from '../habits/HabitCard';
import { Sparkles, ShieldBan, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface HabitSectionProps {
  title: string;
  type: 'good' | 'bad';
  habits: HabitWithStats[];
  onMarkStatus: (habitId: string, status: LogStatus | 'unrecorded') => void;
  onEditHabit: (habit: HabitWithStats) => void;
  onArchiveHabit: (habitId: string) => void;
  onAddHabitOfType: (type: 'good' | 'bad') => void;
}

export const HabitSection: React.FC<HabitSectionProps> = ({
  title,
  type,
  habits,
  onMarkStatus,
  onEditHabit,
  onArchiveHabit,
  onAddHabitOfType,
}) => {
  const isGood = type === 'good';

  return (
    <section className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg ${
              isGood
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
            }`}
          >
            {isGood ? <Sparkles className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {title}
          </h2>
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {habits.length}
          </span>
        </div>

        <button
          onClick={() => onAddHabitOfType(type)}
          className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 hover:underline p-1"
        >
          <Plus className="w-3.5 h-3.5" />
          Add {isGood ? 'Good Habit' : 'Bad Habit'}
        </button>
      </div>

      {/* Habit Cards or Category Empty State */}
      {habits.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/50 dark:bg-slate-900/50 space-y-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isGood
              ? 'No good habits added yet. Start tracking a positive daily routine.'
              : 'No bad habits added yet. Track behaviors you want to avoid.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddHabitOfType(type)}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            Create {isGood ? 'a Good Habit' : 'a Bad Habit to Avoid'}
          </Button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onMarkStatus={onMarkStatus}
              onEdit={onEditHabit}
              onArchive={onArchiveHabit}
            />
          ))}
        </div>
      )}
    </section>
  );
};
