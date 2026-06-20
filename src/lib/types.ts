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
  /** Archived habits keep their history but are no longer scheduled/shown. */
  archived?: boolean;
}

export type ThemePref = 'system' | 'light' | 'dark';

/** 0 = weeks start on Sunday, 1 = weeks start on Monday. */
export type WeekStart = 0 | 1;

export interface Settings {
  theme: ThemePref;
  weekStart: WeekStart;
  /** Use a colourblind-safe (blue→yellow) calendar scale instead of red→green. */
  colorblind: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  weekStart: 0,
  colorblind: false,
};

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
  settings: Settings;
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
