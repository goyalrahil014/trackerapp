export type HabitType = 'good' | 'bad';

export type LogStatus = 'success' | 'failure';

export type DayStatus = 'success' | 'failure' | 'unrecorded';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  type: HabitType;
  icon?: string;
  color?: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  status: LogStatus;
  created_at: string;
  updated_at?: string;
}

export interface DayHistoryItem {
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g., "Oct 2" or "Thursday, Oct 2"
  shortDate: string; // e.g., "10/02"
  weekday: string; // e.g., "Thu"
  status: DayStatus;
  isToday: boolean;
  isBeforeCreation: boolean;
}

export interface HabitStats {
  adherencePercentage: number | null; // null if no recorded days yet (--%)
  currentStreak: number;
  longestStreak: number;
  successfulDays: number;
  recordedDays: number;
  totalDays: number; // 30
  todayStatus: DayStatus;
  history: DayHistoryItem[];
}

export interface HabitWithStats extends Habit {
  stats: HabitStats;
}

export interface HabitFormData {
  name: string;
  type: HabitType;
  icon: string;
  color: string;
}
