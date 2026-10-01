import React, { useState } from 'react';
import type { HabitFormData, HabitType } from '../../types/habit';
import { HABIT_COLORS, HABIT_ICONS } from '../../lib/icons';
import { Button } from '../ui/Button';
import { Check, Sparkles, ShieldBan } from 'lucide-react';

interface HabitFormProps {
  initialData?: Partial<HabitFormData>;
  onSubmit: (data: HabitFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEditing?: boolean;
}

export const HabitForm: React.FC<HabitFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEditing = false,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState<HabitType>(initialData?.type || 'good');
  const [icon, setIcon] = useState(initialData?.icon || (type === 'good' ? 'dumbbell' : 'shield-ban'));
  const [color, setColor] = useState(initialData?.color || (type === 'good' ? 'indigo' : 'rose'));
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();

    if (!trimmed) {
      setError('Habit name is required');
      return;
    }

    if (trimmed.length > 50) {
      setError('Habit name must be 50 characters or less');
      return;
    }

    setError(null);
    try {
      await onSubmit({
        name: trimmed,
        type,
        icon,
        color,
      });
    } catch (err: any) {
      setError(err?.message || 'Failed to save habit');
    }
  };

  const handleTypeChange = (newType: HabitType) => {
    setType(newType);
    if (!initialData?.icon) {
      setIcon(newType === 'good' ? 'dumbbell' : 'shield-ban');
    }
    if (!initialData?.color) {
      setColor(newType === 'good' ? 'indigo' : 'rose');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 text-xs rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Habit Name */}
      <div>
        <label
          htmlFor="habit-name"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5"
        >
          Habit Name
        </label>
        <div className="relative">
          <input
            id="habit-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder={type === 'good' ? 'e.g., Morning Workout, Read 20 pages' : 'e.g., No junk food, No late sleep'}
            maxLength={50}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            required
            autoFocus
          />
          <div className="absolute right-3 top-3 text-[11px] text-slate-400">
            {name.length}/50
          </div>
        </div>
      </div>

      {/* Habit Type Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
          Habit Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div
            onClick={() => handleTypeChange('good')}
            className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex flex-col gap-1.5 ${
              type === 'good'
                ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Good Habit
              </span>
              {type === 'good' && (
                <div className="w-4 h-4 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Action you want to perform consistently (✓ = you did it).
            </p>
          </div>

          <div
            onClick={() => handleTypeChange('bad')}
            className={`cursor-pointer p-3.5 rounded-xl border-2 transition-all flex flex-col gap-1.5 ${
              type === 'bad'
                ? 'border-rose-600 dark:border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <ShieldBan className="w-4 h-4 text-rose-500" />
                Bad Habit
              </span>
              {type === 'bad' && (
                <div className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-white">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              Behavior you want to avoid (✓ = successfully avoided).
            </p>
          </div>
        </div>
      </div>

      {/* Icon Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
          Select Icon
        </label>
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-xl">
          {HABIT_ICONS.map((item) => {
            const IconComponent = item.icon;
            const isSelected = icon === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setIcon(item.id)}
                className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={item.label}
              >
                <IconComponent className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
          Theme Color
        </label>
        <div className="flex items-center gap-2.5 flex-wrap">
          {HABIT_COLORS.map((c) => {
            const isSelected = color === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                className={`w-7 h-7 rounded-full ${c.bg} flex items-center justify-center transition-transform ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110 shadow-sm'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                }`}
                title={c.name}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="outline" size="md" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" isLoading={isSubmitting}>
          {isEditing ? 'Save Changes' : 'Create Habit'}
        </Button>
      </div>
    </form>
  );
};
