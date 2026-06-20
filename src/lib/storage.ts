import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, DEFAULT_SETTINGS } from './types';

const STORAGE_KEY = 'habit-tracker/state/v1';

const EMPTY: AppState = {
  habits: [],
  completions: {},
  settings: DEFAULT_SETTINGS,
};

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      habits: Array.isArray(parsed.habits) ? parsed.habits : [],
      completions: parsed.completions ?? {},
      // merge so older saves (no settings) and any future fields stay valid
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return EMPTY;
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Best-effort persistence; ignore write failures (e.g. private mode).
  }
}
