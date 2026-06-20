import {
  Completions,
  DayStatus,
  Frequency,
  Habit,
} from './types';
import { dateKey, isoWeekKey, monthKey, parseDateKey } from './dates';

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

/** A palette users can pick from when creating a habit. */
export const HABIT_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16',
  '#22c55e', '#14b8a6', '#3b82f6', '#6366f1',
  '#a855f7', '#ec4899',
];

/**
 * The period key that a habit's completion is recorded under for a given date.
 * Daily habits are tracked per day, weekly per ISO week, monthly per month.
 */
export function periodKeyFor(habit: Habit, day: Date): string {
  switch (habit.frequency) {
    case 'daily':
      return dateKey(day);
    case 'weekly':
      return isoWeekKey(day);
    case 'monthly':
      return monthKey(day);
  }
}

/**
 * Whether a habit is "scheduled" on the given calendar day — i.e. whether it
 * should occupy a slot on that day in the calendar view.
 *
 *  - daily   : every day
 *  - weekly  : once per week, on habit.weekday (default Monday)
 *  - monthly : once per month, on habit.monthDay (default the 1st, clamped to
 *              the last day of short months)
 *
 * A habit is never scheduled before the day it was created.
 */
export function isScheduledOn(habit: Habit, day: Date): boolean {
  const created = parseDateKey(habit.createdAt);
  if (day < created) return false;

  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'weekly': {
      const weekday = habit.weekday ?? 1;
      return day.getDay() === weekday;
    }
    case 'monthly': {
      const wanted = habit.monthDay ?? 1;
      const lastDay = new Date(
        day.getFullYear(),
        day.getMonth() + 1,
        0,
      ).getDate();
      const target = Math.min(wanted, lastDay);
      return day.getDate() === target;
    }
  }
}

/** Is the habit completed for the period that contains `day`? */
export function isCompleted(
  completions: Completions,
  habit: Habit,
  day: Date,
): boolean {
  return Boolean(completions[habit.id]?.[periodKeyFor(habit, day)]);
}

/** Toggle a habit's completion for the period containing `day`. */
export function toggleCompletion(
  completions: Completions,
  habit: Habit,
  day: Date,
): Completions {
  const key = periodKeyFor(habit, day);
  const forHabit = { ...(completions[habit.id] ?? {}) };
  if (forHabit[key]) {
    delete forHabit[key];
  } else {
    forHabit[key] = true;
  }
  return { ...completions, [habit.id]: forHabit };
}

/**
 * Aggregate the completion status of every habit scheduled on `day`.
 * Used to colour calendar cells.
 */
export function dayStatus(
  habits: Habit[],
  completions: Completions,
  day: Date,
): DayStatus {
  const due = habits.filter((h) => isScheduledOn(h, day));
  const completed = due.filter((h) => isCompleted(completions, h, day)).length;
  const total = due.length;
  return {
    due,
    completed,
    total,
    ratio: total === 0 ? null : completed / total,
  };
}

/** A short, human description of when a habit recurs. */
export function scheduleDescription(habit: Habit): string {
  switch (habit.frequency) {
    case 'daily':
      return 'Every day';
    case 'weekly': {
      const labels = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
      return `Weekly · ${labels[habit.weekday ?? 1]}`;
    }
    case 'monthly': {
      const d = habit.monthDay ?? 1;
      const suffix =
        d % 10 === 1 && d !== 11 ? 'st' :
        d % 10 === 2 && d !== 12 ? 'nd' :
        d % 10 === 3 && d !== 13 ? 'rd' : 'th';
      return `Monthly · ${d}${suffix}`;
    }
  }
}
