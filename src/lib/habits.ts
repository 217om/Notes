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
  if (habit.archived) return false;
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

// ---------------------------------------------------------------------------
// Stats: occurrences, streaks, completion rate
// ---------------------------------------------------------------------------

/** Hard cap so a far-past createdAt can never produce an unbounded loop. */
const MAX_OCCURRENCES = 1000;

/**
 * Ascending list of the dates this habit was scheduled on, from `createdAt`
 * up to and including `until` (one entry per period). Ignores `archived`
 * so history/stats remain available for paused habits.
 */
export function scheduledOccurrences(habit: Habit, until: Date): Date[] {
  const created = parseDateKey(habit.createdAt);
  const out: Date[] = [];
  if (until < created) return out;

  if (habit.frequency === 'daily') {
    const d = new Date(created);
    while (d <= until && out.length < MAX_OCCURRENCES) {
      out.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
  } else if (habit.frequency === 'weekly') {
    const weekday = habit.weekday ?? 1;
    const d = new Date(created);
    // advance to the first scheduled weekday on/after createdAt
    while (d.getDay() !== weekday) d.setDate(d.getDate() + 1);
    while (d <= until && out.length < MAX_OCCURRENCES) {
      out.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
  } else {
    const wanted = habit.monthDay ?? 1;
    // start from createdAt's month
    const cur = new Date(created.getFullYear(), created.getMonth(), 1);
    while (out.length < MAX_OCCURRENCES) {
      const lastDay = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
      const day = new Date(cur.getFullYear(), cur.getMonth(), Math.min(wanted, lastDay));
      if (day > until) break;
      if (day >= created) out.push(day);
      cur.setMonth(cur.getMonth() + 1);
    }
  }
  return out;
}

export interface HabitStats {
  current: number;
  best: number;
  /** completed / elapsed periods, in [0, 1]; null when nothing has elapsed. */
  rate: number | null;
}

/**
 * Streaks and completion rate for a habit as of `today`. The current period
 * (today / this week / this month) being unticked does NOT break the current
 * streak — it's still in progress.
 */
export function habitStats(
  completions: Completions,
  habit: Habit,
  today: Date,
): HabitStats {
  const occ = scheduledOccurrences(habit, today);
  const done = (d: Date) => isCompleted(completions, habit, d);

  // best streak across all history
  let best = 0;
  let run = 0;
  for (const d of occ) {
    if (done(d)) {
      run += 1;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }

  // current streak, counting back from the most recent occurrence
  let i = occ.length - 1;
  const currentPeriod = periodKeyFor(habit, today);
  if (i >= 0 && periodKeyFor(habit, occ[i]) === currentPeriod && !done(occ[i])) {
    i -= 1; // current period not ticked yet — grace, don't break
  }
  let current = 0;
  while (i >= 0 && done(occ[i])) {
    current += 1;
    i -= 1;
  }

  // completion rate over elapsed periods (exclude the in-progress current one)
  const elapsed = occ.filter(
    (d) => periodKeyFor(habit, d) !== currentPeriod,
  );
  const completedCount = elapsed.filter(done).length;
  const rate = elapsed.length === 0 ? null : completedCount / elapsed.length;

  return { current, best, rate };
}

/**
 * The most recent `count` occurrences with their completion state, oldest
 * first — used to draw a per-habit heatmap.
 */
export function recentHistory(
  completions: Completions,
  habit: Habit,
  today: Date,
  count: number,
): { key: string; done: boolean }[] {
  const occ = scheduledOccurrences(habit, today);
  return occ.slice(-count).map((d) => ({
    key: periodKeyFor(habit, d),
    done: isCompleted(completions, habit, d),
  }));
}
