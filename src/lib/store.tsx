import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AppState,
  Completions,
  DEFAULT_SETTINGS,
  Habit,
  Settings,
} from './types';
import { loadState, saveState } from './storage';
import { toggleCompletion as toggleCompletionLogic } from './habits';
import { dateKey, startOfToday } from './dates';

interface StoreValue {
  ready: boolean;
  habits: Habit[];
  completions: Completions;
  settings: Settings;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (id: string, patch: Partial<Omit<Habit, 'id'>>) => void;
  removeHabit: (id: string) => void;
  setArchived: (id: string, archived: boolean) => void;
  moveHabit: (id: string, dir: -1 | 1) => void;
  toggle: (habit: Habit, day: Date) => void;
  updateSettings: (patch: Partial<Settings>) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>({
    habits: [],
    completions: {},
    settings: DEFAULT_SETTINGS,
  });
  const [ready, setReady] = useState(false);

  // Load persisted state once on mount.
  useEffect(() => {
    let active = true;
    loadState().then((loaded) => {
      if (active) {
        setState(loaded);
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Persist on every change once we've finished loading.
  useEffect(() => {
    if (ready) saveState(state);
  }, [state, ready]);

  const addHabit = useCallback((habit: Omit<Habit, 'id' | 'createdAt'>) => {
    setState((prev) => ({
      ...prev,
      habits: [
        ...prev.habits,
        { ...habit, id: makeId(), createdAt: dateKey(startOfToday()) },
      ],
    }));
  }, []);

  const updateHabit = useCallback(
    (id: string, patch: Partial<Omit<Habit, 'id'>>) => {
      setState((prev) => ({
        ...prev,
        habits: prev.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
      }));
    },
    [],
  );

  const removeHabit = useCallback((id: string) => {
    setState((prev) => {
      const completions = { ...prev.completions };
      delete completions[id];
      return {
        ...prev,
        habits: prev.habits.filter((h) => h.id !== id),
        completions,
      };
    });
  }, []);

  const setArchived = useCallback((id: string, archived: boolean) => {
    setState((prev) => ({
      ...prev,
      habits: prev.habits.map((h) => (h.id === id ? { ...h, archived } : h)),
    }));
  }, []);

  // Reorder within the active (non-archived) habits, preserving the overall list.
  const moveHabit = useCallback((id: string, dir: -1 | 1) => {
    setState((prev) => {
      const habits = [...prev.habits];
      const from = habits.findIndex((h) => h.id === id);
      if (from === -1) return prev;
      const to = from + dir;
      if (to < 0 || to >= habits.length) return prev;
      [habits[from], habits[to]] = [habits[to], habits[from]];
      return { ...prev, habits };
    });
  }, []);

  const toggle = useCallback((habit: Habit, day: Date) => {
    setState((prev) => ({
      ...prev,
      completions: toggleCompletionLogic(prev.completions, habit, day),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...patch },
    }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      habits: state.habits,
      completions: state.completions,
      settings: state.settings,
      addHabit,
      updateHabit,
      removeHabit,
      setArchived,
      moveHabit,
      toggle,
      updateSettings,
    }),
    [
      ready,
      state,
      addHabit,
      updateHabit,
      removeHabit,
      setArchived,
      moveHabit,
      toggle,
      updateSettings,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
