/**
 * Date utility functions for HabitFlow
 * Ensures local calendar dates are used consistently without UTC timezone shift bugs.
 */

/**
 * Format a Date object into 'YYYY-MM-DD' using local calendar parts.
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns today's local date string in 'YYYY-MM-DD' format.
 */
export function getToday(): string {
  return formatLocalDate(new Date());
}

/**
 * Parses a 'YYYY-MM-DD' string into a local Date object.
 */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Returns an array of the last 30 calendar dates up to and including today.
 * The order is chronological:
 * Index 0 = 29 days ago (oldest / LEFT)
 * Index 29 = today (most recent / RIGHT)
 */
export function getLast30Days(): string[] {
  const dates: string[] = [];
  const today = new Date();

  // 29 days ago up to 0 days ago (today) -> 30 days total
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    dates.push(formatLocalDate(d));
  }

  return dates;
}

/**
 * Formats a 'YYYY-MM-DD' string into full human-readable format.
 * Example: "Thursday, October 2"
 */
export function formatFullDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a 'YYYY-MM-DD' string into medium format.
 * Example: "Oct 2"
 */
export function formatShortDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Returns the short weekday name for a date string.
 * Example: "Thu"
 */
export function getWeekday(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

/**
 * Returns today's full formatted date.
 * Example: "Thursday, 2 October"
 */
export function getTodayFormattedLong(): string {
  const today = new Date();
  const weekday = today.toLocaleDateString(undefined, { weekday: 'long' });
  const day = today.getDate();
  const month = today.toLocaleDateString(undefined, { month: 'long' });
  return `${weekday}, ${day} ${month}`;
}

/**
 * Returns a contextual time-of-day greeting.
 * Example: "Good morning 👋", "Good afternoon 👋", "Good evening 👋"
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning 👋';
  } else if (hour < 18) {
    return 'Good afternoon 👋';
  } else {
    return 'Good evening 👋';
  }
}
