# Habit Tracker

A cross-platform habit-tracking app built with **React Native + Expo** (runs on
web, iOS and Android from one codebase). It has two main pages:

| Page | What it does |
| --- | --- |
| **Calendar** | A month grid where each day is colour-coded by how many of that day's habits you completed — **green** when everything is done, fading through **yellow → orange → red** for partial, and **red** when nothing scheduled was done. Tap any day to tick its habits. |
| **Habits** | Create, edit and delete habits, and tick off the current day/week/month. Each habit has a name, colour and a frequency. |

## Daily, weekly & monthly habits

Not every habit is a daily one. Each habit has a **frequency**:

- **Daily** — appears every day and is tracked per day.
- **Weekly** — appears once a week on a chosen weekday and is tracked per ISO
  week, so you only tick it once for the whole week.
- **Monthly** — appears once a month on a chosen day-of-month and is tracked per
  month, so you only tick it once for the whole month. (Days past the end of a
  short month fall on that month's last day.)

On the calendar a day's colour reflects only the habits actually **scheduled**
for that day, so a weekly/monthly habit doesn't drag a day to "red" on days it
isn't due. Future days stay neutral with a small dot when something is due.

## Tech & data

- **Expo SDK 52**, React Native 0.76, React Native Web.
- State lives in a small React context (`src/lib/store.tsx`) and is persisted
  locally with `@react-native-async-storage/async-storage` (backed by
  `localStorage` on web). No backend required.
- Core scheduling/colour logic is isolated in `src/lib/` and is UI-agnostic.

## Getting started

```bash
npm install

# Web (opens in the browser)
npm run web

# Native (requires Expo Go or a simulator)
npm run ios
npm run android

# Type-check
npm run typecheck

# Static web build -> ./dist
npm run build:web
```

## Project structure

```
App.tsx                      # Root: store provider + bottom tab navigation
src/
  lib/
    types.ts                 # Habit / Completions / DayStatus types
    dates.ts                 # Date keys, ISO weeks, month grid
    habits.ts                # Scheduling, completion & day-status logic
    theme.ts                 # Colours + ratio→colour scale
    storage.ts               # AsyncStorage persistence
    store.tsx                # React context store
  components/
    CalendarScreen.tsx       # Month grid + navigation
    DayDetailModal.tsx       # Per-day habit ticking
    HabitsScreen.tsx         # Habit list + current-period ticking
    HabitFormModal.tsx       # Add / edit habit form
    Legend.tsx               # Colour legend
```
