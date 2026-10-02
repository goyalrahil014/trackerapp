import type { Habit, HabitFormData, HabitLog, LogStatus } from '../types/habit';
import { isSupabaseConfigured, supabase } from './supabase';
import { getLast30Days } from './dates';

const LOCAL_HABITS_KEY = 'habitflow_local_habits';
const LOCAL_LOGS_KEY = 'habitflow_local_logs';

/**
 * Check if the user ID corresponds to a local demo session
 */
export function isDemoUserId(userId: string): boolean {
  return !userId || userId.startsWith('demo-') || userId.startsWith('local-');
}

/**
 * Helper to get local data from localStorage
 */
function getLocalHabits(userId: string): Habit[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_HABITS_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse local habits', e);
  }
  return [];
}

function saveLocalHabits(userId: string, habits: Habit[]): void {
  localStorage.setItem(`${LOCAL_HABITS_KEY}_${userId}`, JSON.stringify(habits));
}

function getLocalLogs(userId: string): HabitLog[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_LOGS_KEY}_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse local logs', e);
  }
  return [];
}

function saveLocalLogs(userId: string, logs: HabitLog[]): void {
  localStorage.setItem(`${LOCAL_LOGS_KEY}_${userId}`, JSON.stringify(logs));
}

/**
 * Initializes realistic sample habits and logs for local testing if the user has none
 */
export function seedSampleDataIfEmpty(userId: string): { habits: Habit[]; logs: HabitLog[] } {
  let habits = getLocalHabits(userId);
  let logs = getLocalLogs(userId);

  if (habits.length === 0) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString();

    const sampleHabits: Habit[] = [
      {
        id: 'sample-habit-1',
        user_id: userId,
        name: 'Morning Workout',
        type: 'good',
        icon: 'dumbbell',
        color: 'emerald',
        active: true,
        created_at: thirtyDaysAgo,
      },
      {
        id: 'sample-habit-2',
        user_id: userId,
        name: 'Read 20 pages',
        type: 'good',
        icon: 'book-open',
        color: 'indigo',
        active: true,
        created_at: thirtyDaysAgo,
      },
      {
        id: 'sample-habit-3',
        user_id: userId,
        name: 'No junk food',
        type: 'bad',
        icon: 'utensils',
        color: 'rose',
        active: true,
        created_at: thirtyDaysAgo,
      },
      {
        id: 'sample-habit-4',
        user_id: userId,
        name: 'Drink 3L water',
        type: 'good',
        icon: 'droplets',
        color: 'sky',
        active: true,
        created_at: thirtyDaysAgo,
      },
    ];

    // Generate realistic logs for the last 30 days
    const dates = getLast30Days();
    const sampleLogs: HabitLog[] = [];

    dates.forEach((dateStr, idx) => {
      const isToday = idx === 29;

      if (!isToday) {
        sampleLogs.push({
          id: `log-w-${idx}`,
          habit_id: 'sample-habit-1',
          user_id: userId,
          date: dateStr,
          status: [2, 7, 12, 18, 25].includes(idx) ? 'failure' : 'success',
          created_at: new Date().toISOString(),
        });

        sampleLogs.push({
          id: `log-r-${idx}`,
          habit_id: 'sample-habit-2',
          user_id: userId,
          date: dateStr,
          status: [3, 8, 14, 20, 24, 27].includes(idx) ? 'failure' : 'success',
          created_at: new Date().toISOString(),
        });

        sampleLogs.push({
          id: `log-j-${idx}`,
          habit_id: 'sample-habit-3',
          user_id: userId,
          date: dateStr,
          status: [5, 16, 26].includes(idx) ? 'failure' : 'success',
          created_at: new Date().toISOString(),
        });

        sampleLogs.push({
          id: `log-wat-${idx}`,
          habit_id: 'sample-habit-4',
          user_id: userId,
          date: dateStr,
          status: [4, 11, 21, 28].includes(idx) ? 'failure' : 'success',
          created_at: new Date().toISOString(),
        });
      }
    });

    saveLocalHabits(userId, sampleHabits);
    saveLocalLogs(userId, sampleLogs);
    return { habits: sampleHabits, logs: sampleLogs };
  }

  return { habits, logs };
}

/**
 * Fetch active habits for user
 */
export async function fetchHabits(userId: string): Promise<Habit[]> {
  if (isSupabaseConfigured() && supabase && !isDemoUserId(userId)) {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase fetchHabits error:', error);
      throw new Error(error.message || 'Failed to fetch habits');
    }
    return data || [];
  } else {
    const { habits } = seedSampleDataIfEmpty(userId);
    return habits.filter((h) => h.active);
  }
}

/**
 * Fetch archived (soft-deleted) habits
 */
export async function fetchArchivedHabits(userId: string): Promise<Habit[]> {
  if (isSupabaseConfigured() && supabase && !isDemoUserId(userId)) {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('active', false)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Supabase fetchArchivedHabits error:', error);
      throw new Error(error.message || 'Failed to fetch archived habits');
    }
    return data || [];
  } else {
    const habits = getLocalHabits(userId);
    return habits.filter((h) => !h.active);
  }
}

/**
 * Fetch habit logs for the last 30 days
 */
export async function fetchHabitLogs(userId: string, startDate: string): Promise<HabitLog[]> {
  if (isSupabaseConfigured() && supabase && !isDemoUserId(userId)) {
    const { data, error } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate);

    if (error) {
      console.error('Supabase fetchHabitLogs error:', error);
      throw new Error(error.message || 'Failed to fetch habit logs');
    }
    return data || [];
  } else {
    const { logs } = seedSampleDataIfEmpty(userId);
    return logs.filter((log) => log.date >= startDate);
  }
}

/**
 * Create a new habit
 */
export async function createHabit(userId: string, data: HabitFormData): Promise<Habit> {
  const trimmedName = data.name.trim();

  if (isSupabaseConfigured() && supabase && !isDemoUserId(userId)) {
    const { data: existing } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', userId)
      .eq('active', true)
      .ilike('name', trimmedName)
      .maybeSingle();

    if (existing) {
      throw new Error('An active habit with this name already exists.');
    }

    const { data: created, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name: trimmedName,
        type: data.type,
        icon: data.icon || 'target',
        color: data.color || 'indigo',
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase createHabit error:', error);
      throw new Error(error.message || 'Failed to create habit');
    }

    return created;
  } else {
    const habits = getLocalHabits(userId);
    const duplicate = habits.find(
      (h) => h.active && h.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      throw new Error('An active habit with this name already exists.');
    }

    const newHabit: Habit = {
      id: `local-habit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      user_id: userId,
      name: trimmedName,
      type: data.type,
      icon: data.icon || 'target',
      color: data.color || 'indigo',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    habits.push(newHabit);
    saveLocalHabits(userId, habits);
    return newHabit;
  }
}

/**
 * Update an existing habit
 */
export async function updateHabit(
  userId: string,
  habitId: string,
  data: Partial<HabitFormData>
): Promise<Habit> {
  if (isSupabaseConfigured() && supabase && !isDemoUserId(userId)) {
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (data.name !== undefined) updatePayload.name = data.name.trim();
    if (data.type !== undefined) updatePayload.type = data.type;
    if (data.icon !== undefined) updatePayload.icon = data.icon;
    if (data.color !== undefined) updatePayload.color = data.color;

    const { data: updated, error } = await supabase
      .from('habits')
      .update(updatePayload)
      .eq('id', habitId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Supabase updateHabit error:', error);
      throw new Error(error.message || 'Failed to update habit');
    }

    return updated;
  } else {
    const habits = getLocalHabits(userId);
    const index = habits.findIndex((h) => h.id === habitId);
    if (index === -1) {
      throw new Error('Habit not found');
    }

    const updated: Habit = {
      ...habits[index],
      name: data.name !== undefined ? data.name.trim() : habits[index].name,
      type: data.type ?? habits[index].type,
      icon: data.icon ?? habits[index].icon,
      color: data.color ?? habits[index].color,
      updated_at: new Date().toISOString(),
    };

    habits[index] = updated;
    saveLocalHabits(userId, habits);
    return updated;
  }
}

/**
 * Soft delete (archive) habit
 */
export async function archiveHabit(userId: string, habitId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase && !isDemoUserId(userId)) {
    const { error } = await supabase
      .from('habits')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', habitId)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase archiveHabit error:', error);
      throw new Error(error.message || 'Failed to archive habit');
    }
  } else {
    const habits = getLocalHabits(userId);
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      habit.active = false;
      habit.updated_at = new Date().toISOString();
      saveLocalHabits(userId, habits);
    }
  }
}

/**
 * Restore archived habit
 */
export async function restoreHabit(userId: string, habitId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase && !isDemoUserId(userId)) {
    const { error } = await supabase
      .from('habits')
      .update({ active: true, updated_at: new Date().toISOString() })
      .eq('id', habitId)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase restoreHabit error:', error);
      throw new Error(error.message || 'Failed to restore habit');
    }
  } else {
    const habits = getLocalHabits(userId);
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      habit.active = true;
      habit.updated_at = new Date().toISOString();
      saveLocalHabits(userId, habits);
    }
  }
}

/**
 * Mark or update a habit log for a given date
 */
export async function setHabitLog(
  userId: string,
  habitId: string,
  date: string,
  status: LogStatus
): Promise<HabitLog> {
  if (isSupabaseConfigured() && supabase && !isDemoUserId(userId)) {
    const { data, error } = await supabase
      .from('habit_logs')
      .upsert(
        {
          user_id: userId,
          habit_id: habitId,
          date,
          status,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'habit_id,date' }
      )
      .select()
      .single();

    if (error) {
      console.error('Supabase setHabitLog error:', error);
      throw new Error(error.message || 'Failed to save habit status');
    }

    return data;
  } else {
    const logs = getLocalLogs(userId);
    const existingIndex = logs.findIndex((l) => l.habit_id === habitId && l.date === date);

    if (existingIndex >= 0) {
      logs[existingIndex].status = status;
      logs[existingIndex].updated_at = new Date().toISOString();
      saveLocalLogs(userId, logs);
      return logs[existingIndex];
    } else {
      const newLog: HabitLog = {
        id: `local-log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        habit_id: habitId,
        user_id: userId,
        date,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      logs.push(newLog);
      saveLocalLogs(userId, logs);
      return newLog;
    }
  }
}

/**
 * Delete a habit log (undoes status back to unrecorded)
 */
export async function deleteHabitLog(
  userId: string,
  habitId: string,
  date: string
): Promise<void> {
  if (isSupabaseConfigured() && supabase && !isDemoUserId(userId)) {
    const { error } = await supabase
      .from('habit_logs')
      .delete()
      .eq('habit_id', habitId)
      .eq('date', date)
      .eq('user_id', userId);

    if (error) {
      console.error('Supabase deleteHabitLog error:', error);
      throw new Error(error.message || 'Failed to remove habit log');
    }
  } else {
    let logs = getLocalLogs(userId);
    logs = logs.filter((l) => !(l.habit_id === habitId && l.date === date));
    saveLocalLogs(userId, logs);
  }
}
