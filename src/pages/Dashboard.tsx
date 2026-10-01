import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useHabits } from '../hooks/useHabits';
import { useAuth } from '../context/AuthContext';
import { getGreeting, getTodayFormattedLong } from '../lib/dates';
import { DailyProgress } from '../components/dashboard/DailyProgress';
import { HabitSection } from '../components/dashboard/HabitSection';
import type { HabitWithStats, HabitFormData } from '../types/habit';
import { Modal } from '../components/ui/Modal';
import { HabitForm } from '../components/habits/HabitForm';
import { Button } from '../components/ui/Button';
import { DashboardSkeleton } from '../components/ui/Skeleton';
import { Plus, Target, AlertTriangle } from 'lucide-react';

interface LayoutContext {
  onOpenAddModal: (type?: 'good' | 'bad') => void;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    habits,
    loading,
    markTodayStatus,
    updateHabit,
    archiveHabit,
  } = useHabits();

  const { onOpenAddModal } = useOutletContext<LayoutContext>();

  // Edit Habit State
  const [editingHabit, setEditingHabit] = useState<HabitWithStats | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Archive / Delete Confirmation State
  const [habitToArchive, setHabitToArchive] = useState<HabitWithStats | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const goodHabits = habits.filter((h) => h.type === 'good');
  const badHabits = habits.filter((h) => h.type === 'bad');

  // Overall daily progress calculation
  const totalHabitsCount = habits.length;
  const completedTodayCount = habits.filter((h) => h.stats.todayStatus === 'success').length;
  const progressPercentage =
    totalHabitsCount > 0 ? Math.round((completedTodayCount / totalHabitsCount) * 100) : 0;

  const handleEditSubmit = async (data: HabitFormData) => {
    if (!editingHabit) return;
    try {
      setIsUpdating(true);
      await updateHabit(editingHabit.id, data);
      setEditingHabit(null);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmArchive = async () => {
    if (!habitToArchive) return;
    try {
      setIsArchiving(true);
      await archiveHabit(habitToArchive.id);
      setHabitToArchive(null);
    } finally {
      setIsArchiving(false);
    }
  };

  if (loading && habits.length === 0) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Greeting & Date Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{getGreeting()}</span>
            {user?.name && <span className="font-medium text-slate-500 dark:text-slate-400">, {user.name}</span>}
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            {getTodayFormattedLong()} · Your daily progress
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => onOpenAddModal('good')}
          leftIcon={<Plus className="w-4 h-4" />}
          className="self-start sm:self-auto shadow-md shadow-indigo-500/20"
        >
          Add Habit
        </Button>
      </div>

      {/* Empty State if No Habits Exist */}
      {habits.length === 0 ? (
        <div className="py-16 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm max-w-lg mx-auto space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Start building your routine
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
              Create your first habit and begin tracking your 30-day consistency.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => onOpenAddModal('good')}
              leftIcon={<Plus className="w-5 h-5" />}
              className="w-full sm:w-auto shadow-md shadow-indigo-500/25"
            >
              + Add your first habit
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Today's Progress Card */}
          <DailyProgress
            completedCount={completedTodayCount}
            totalCount={totalHabitsCount}
            percentage={progressPercentage}
          />

          {/* Habit Lists: GOOD HABITS and BAD HABITS */}
          <div className="space-y-8">
            {/* Good Habits Section */}
            <HabitSection
              title="Good Habits"
              type="good"
              habits={goodHabits}
              onMarkStatus={markTodayStatus}
              onEditHabit={(h) => setEditingHabit(h)}
              onArchiveHabit={(id) => {
                const target = habits.find((h) => h.id === id);
                if (target) setHabitToArchive(target);
              }}
              onAddHabitOfType={(t) => onOpenAddModal(t)}
            />

            {/* Bad Habits Section */}
            <HabitSection
              title="Bad Habits"
              type="bad"
              habits={badHabits}
              onMarkStatus={markTodayStatus}
              onEditHabit={(h) => setEditingHabit(h)}
              onArchiveHabit={(id) => {
                const target = habits.find((h) => h.id === id);
                if (target) setHabitToArchive(target);
              }}
              onAddHabitOfType={(t) => onOpenAddModal(t)}
            />
          </div>
        </>
      )}

      {/* Edit Habit Modal */}
      {editingHabit && (
        <Modal
          isOpen={Boolean(editingHabit)}
          onClose={() => setEditingHabit(null)}
          title="Edit Habit"
          description="Update habit details. Historical logs will remain unchanged."
        >
          <HabitForm
            initialData={{
              name: editingHabit.name,
              type: editingHabit.type,
              icon: editingHabit.icon,
              color: editingHabit.color,
            }}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingHabit(null)}
            isSubmitting={isUpdating}
            isEditing
          />
        </Modal>
      )}

      {/* Confirmation Modal for Archiving / Soft Delete */}
      {habitToArchive && (
        <Modal
          isOpen={Boolean(habitToArchive)}
          onClose={() => setHabitToArchive(null)}
          title={`Archive "${habitToArchive.name}"?`}
          description="This will remove the habit from your active dashboard. Historical logs will be preserved."
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>
                You can restore archived habits anytime from your Profile page.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setHabitToArchive(null)}
                disabled={isArchiving}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleConfirmArchive}
                isLoading={isArchiving}
              >
                Archive Habit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
