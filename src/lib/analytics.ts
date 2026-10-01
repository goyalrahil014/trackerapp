import type { DayHistoryItem, DayStatus, Habit, HabitLog, HabitStats } from '../types/habit';
import {
  formatFullDate,
  formatLocalDate,
  formatShortDate,
  getLast30Days,
  getToday,
  getWeekday,
} from './dates';

/**
 * Calculates complete 30-day statistics and day-by-day history for a single habit.
 */
export function calculateHabitStats(
  habit: Habit,
  logs: HabitLog[] // logs for this habit
): HabitStats {
  const last30Days = getLast30Days(); // 30 dates in chronological order (left: oldest -> right: today)
  const today = getToday();

  // Map logs by date for fast O(1) lookup
  const logMap = new Map<string, 'success' | 'failure'>();
  for (const log of logs) {
    if (log.habit_id === habit.id) {
      logMap.set(log.date, log.status);
    }
  }

  // Habit creation date in YYYY-MM-DD
  const habitCreationDate = formatLocalDate(new Date(habit.created_at));

  let successfulDays = 0;
  let recordedDays = 0;

  const history: DayHistoryItem[] = last30Days.map((dateStr) => {
    const isToday = dateStr === today;
    const isBeforeCreation = dateStr < habitCreationDate;
    const logStatus = logMap.get(dateStr);

    let status: DayStatus = 'unrecorded';

    if (logStatus === 'success') {
      status = 'success';
      successfulDays++;
      recordedDays++;
    } else if (logStatus === 'failure') {
      status = 'failure';
      recordedDays++;
    } else {
      status = 'unrecorded';
    }

    return {
      date: dateStr,
      displayDate: formatFullDate(dateStr),
      shortDate: formatShortDate(dateStr),
      weekday: getWeekday(dateStr),
      status,
      isToday,
      isBeforeCreation,
    };
  });

  // Calculate adherence percentage
  // successful_days / recorded_days * 100
  // If no records yet, display null (--%)
  const adherencePercentage =
    recordedDays > 0 ? Math.round((successfulDays / recordedDays) * 100) : null;

  // Today's status
  const todayLog = logMap.get(today);
  const todayStatus: DayStatus =
    todayLog === 'success' ? 'success' : todayLog === 'failure' ? 'failure' : 'unrecorded';

  // Calculate streaks
  const { currentStreak, longestStreak } = calculateStreaks(history, today);

  return {
    adherencePercentage,
    currentStreak,
    longestStreak,
    successfulDays,
    recordedDays,
    totalDays: 30,
    todayStatus,
    history,
  };
}

/**
 * Calculates current streak and longest streak from the 30-day history.
 * History is chronological (index 0 is oldest, index 29 is today).
 */
export function calculateStreaks(
  history: DayHistoryItem[],
  todayStr: string
): { currentStreak: number; longestStreak: number } {
  let longestStreak = 0;
  let tempStreak = 0;

  // 1. Longest streak in this window
  for (const item of history) {
    if (item.status === 'success') {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // 2. Current streak
  let currentStreak = 0;
  const todayIndex = history.findIndex((h) => h.date === todayStr);

  if (todayIndex >= 0) {
    const todayItem = history[todayIndex];

    if (todayItem.status === 'success') {
      // Count backwards from today
      for (let i = todayIndex; i >= 0; i--) {
        if (history[i].status === 'success') {
          currentStreak++;
        } else {
          break;
        }
      }
    } else if (todayItem.status === 'unrecorded') {
      // If today is not yet recorded, check consecutive successes ending yesterday
      for (let i = todayIndex - 1; i >= 0; i--) {
        if (history[i].status === 'success') {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      currentStreak = 0;
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Overall consistency metric across all habits.
 */
export interface OverallAnalytics {
  consistencyScore: number | null;
  totalSuccessfulDays: number;
  bestCurrentStreak: number;
  bestLongestStreak: number;
  totalActiveHabits: number;
  goodHabitsCount: number;
  badHabitsCount: number;
  todayCompletedCount: number;
  todayTotalCount: number;
  todayPercentage: number;
}

export function calculateOverallAnalytics(
  habits: Habit[],
  logs: HabitLog[]
): OverallAnalytics {
  if (habits.length === 0) {
    return {
      consistencyScore: null,
      totalSuccessfulDays: 0,
      bestCurrentStreak: 0,
      bestLongestStreak: 0,
      totalActiveHabits: 0,
      goodHabitsCount: 0,
      badHabitsCount: 0,
      todayCompletedCount: 0,
      todayTotalCount: 0,
      todayPercentage: 0,
    };
  }

  let totalSuccessful = 0;
  let totalRecorded = 0;
  let bestCurrentStreak = 0;
  let bestLongestStreak = 0;
  let todayCompleted = 0;

  const goodHabitsCount = habits.filter((h) => h.type === 'good').length;
  const badHabitsCount = habits.filter((h) => h.type === 'bad').length;

  for (const habit of habits) {
    const stats = calculateHabitStats(habit, logs);
    totalSuccessful += stats.successfulDays;
    totalRecorded += stats.recordedDays;

    if (stats.currentStreak > bestCurrentStreak) {
      bestCurrentStreak = stats.currentStreak;
    }
    if (stats.longestStreak > bestLongestStreak) {
      bestLongestStreak = stats.longestStreak;
    }

    if (stats.todayStatus === 'success') {
      todayCompleted++;
    }
  }

  const consistencyScore =
    totalRecorded > 0 ? Math.round((totalSuccessful / totalRecorded) * 100) : null;

  const todayPercentage =
    habits.length > 0 ? Math.round((todayCompleted / habits.length) * 100) : 0;

  return {
    consistencyScore,
    totalSuccessfulDays: totalSuccessful,
    bestCurrentStreak,
    bestLongestStreak,
    totalActiveHabits: habits.length,
    goodHabitsCount,
    badHabitsCount,
    todayCompletedCount: todayCompleted,
    todayTotalCount: habits.length,
    todayPercentage,
  };
}
