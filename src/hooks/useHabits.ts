import { useState, useEffect, useCallback } from 'react';
import type { Habit, HabitFormData, HabitLog, HabitWithStats, LogStatus } from '../types/habit';
import {
  archiveHabit,
  createHabit,
  deleteHabitLog,
  fetchHabitLogs,
  fetchHabits,
  restoreHabit,
  setHabitLog,
  updateHabit,
} from '../lib/habits';
import { calculateHabitStats, calculateOverallAnalytics } from '../lib/analytics';
import type { OverallAnalytics } from '../lib/analytics';
import { getLast30Days, getToday } from '../lib/dates';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import confetti from 'canvas-confetti';

export function useHabits() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load habits and last 30-day logs
  const loadData = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const last30 = getLast30Days();
      const startDate = last30[0]; // 29 days ago

      const [userHabits, userLogs] = await Promise.all([
        fetchHabits(user.id),
        fetchHabitLogs(user.id, startDate),
      ]);

      setHabits(userHabits);
      setLogs(userLogs);
    } catch (err: any) {
      console.error('Failed to load habits data:', err);
      setError(err?.message || 'Failed to load habits data');
      toast.error('Could not load habits. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Combine habits with calculated 30-day statistics
  const habitsWithStats: HabitWithStats[] = habits.map((habit) => {
    const stats = calculateHabitStats(habit, logs);
    return {
      ...habit,
      stats,
    };
  });

  // Calculate overall metrics
  const overallAnalytics: OverallAnalytics = calculateOverallAnalytics(habits, logs);

  // Optimistic toggle / update for today's status
  const markTodayStatus = async (
    habitId: string,
    targetStatus: LogStatus | 'unrecorded'
  ) => {
    if (!user) return;

    const today = getToday();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    // Snapshot previous logs for rollback if network fails
    const previousLogs = [...logs];

    // Optimistic update
    if (targetStatus === 'unrecorded') {
      setLogs((prev) => prev.filter((l) => !(l.habit_id === habitId && l.date === today)));
    } else {
      setLogs((prev) => {
        const filtered = prev.filter((l) => !(l.habit_id === habitId && l.date === today));
        return [
          ...filtered,
          {
            id: `temp-${Date.now()}`,
            habit_id: habitId,
            user_id: user.id,
            date: today,
            status: targetStatus,
            created_at: new Date().toISOString(),
          },
        ];
      });

      if (targetStatus === 'success') {
        try {
          confetti({
            particleCount: 30,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#10b981', '#6366f1', '#3b82f6', '#ec4899'],
            disableForReducedMotion: true,
          });
        } catch {
          // ignore reduced-motion or canvas failure
        }
      }
    }

    try {
      if (targetStatus === 'unrecorded') {
        await deleteHabitLog(user.id, habitId, today);
        toast.info(`Removed status for "${habit.name}"`);
      } else {
        await setHabitLog(user.id, habitId, today, targetStatus);
        const label =
          targetStatus === 'success'
            ? habit.type === 'good'
              ? `Completed "${habit.name}"`
              : `Successfully avoided "${habit.name}"`
            : `Marked "${habit.name}" as not followed`;
        toast.success(label);
      }
    } catch (err: any) {
      console.error('Failed to update habit status:', err);
      setLogs(previousLogs);
      toast.error('Failed to save status. Reverted changes.');
    }
  };

  // Add a new habit
  const handleAddHabit = async (data: HabitFormData) => {
    if (!user) return;
    try {
      const newHabit = await createHabit(user.id, data);
      setHabits((prev) => [...prev, newHabit]);
      toast.success(`Habit "${newHabit.name}" created!`);
      return newHabit;
    } catch (err: any) {
      console.error('Failed to add habit:', err);
      toast.error(err.message || 'Failed to create habit');
      throw err;
    }
  };

  // Edit an existing habit
  const handleUpdateHabit = async (habitId: string, data: Partial<HabitFormData>) => {
    if (!user) return;
    try {
      const updated = await updateHabit(user.id, habitId, data);
      setHabits((prev) => prev.map((h) => (h.id === habitId ? updated : h)));
      toast.success('Habit updated successfully');
      return updated;
    } catch (err: any) {
      console.error('Failed to update habit:', err);
      toast.error(err.message || 'Failed to update habit');
      throw err;
    }
  };

  // Archive (soft delete)
  const handleArchiveHabit = async (habitId: string) => {
    if (!user) return;
    const habit = habits.find((h) => h.id === habitId);
    try {
      await archiveHabit(user.id, habitId);
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      toast.info(`"${habit?.name || 'Habit'}" moved to archived habits`);
    } catch (err: any) {
      console.error('Failed to archive habit:', err);
      toast.error('Failed to remove habit');
      throw err;
    }
  };

  // Restore archived habit
  const handleRestoreHabit = async (habitId: string) => {
    if (!user) return;
    try {
      await restoreHabit(user.id, habitId);
      await loadData();
      toast.success('Habit restored to your dashboard');
    } catch (err: any) {
      console.error('Failed to restore habit:', err);
      toast.error('Failed to restore habit');
      throw err;
    }
  };

  return {
    habits: habitsWithStats,
    rawHabits: habits,
    logs,
    loading,
    error,
    overallAnalytics,
    refresh: loadData,
    markTodayStatus,
    addHabit: handleAddHabit,
    updateHabit: handleUpdateHabit,
    archiveHabit: handleArchiveHabit,
    restoreHabit: handleRestoreHabit,
  };
}
