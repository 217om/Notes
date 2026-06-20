export type Frequency = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  name: string;
  frequency: Frequency;
  color: string;
  /** ISO date string (YYYY-MM-DD) of when the habit was created. */
  createdAt: string;
  /**
   * For weekly habits: the weekday (0 = Sunday … 6 = Saturday) the habit is
   * scheduled on / shown for ticking. Defaults to 1 (Monday).
   */
  weekday?: number;
  /**
   * For monthly habits: the day of the month (1–31) the habit is scheduled on.
   * Defaults to 1.
   */
  monthDay?: number;
}

/**
 * Completion records, keyed by habit id and then by a "period key".
 * The period key depends on the habit frequency:
 *   - daily   -> "YYYY-MM-DD"
 *   - weekly  -> "YYYY-Www" (ISO week)
 *   - monthly -> "YYYY-MM"
 */
export type Completions = Record<string, Record<string, boolean>>;

export interface AppState {
  habits: Habit[];
  completions: Completions;
}

/** Aggregated completion status for a single calendar day. */
export interface DayStatus {
  /** Habits that are due/scheduled on this day. */
  due: Habit[];
  /** How many of the due habits are completed for their period. */
  completed: number;
  /** total === due.length, kept for convenience. */
  total: number;
  /** completed / total, or null when nothing is due. */
  ratio: number | null;
}
