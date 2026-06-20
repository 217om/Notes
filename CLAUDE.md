# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A habit-tracking app built with **React Native + Expo (SDK 52)**, deployed as a **web app to GitHub Pages**. Despite the repo name (`Notes`), the entire repository *is* the habit tracker. Two screens: a **Calendar** (month grid, days color-coded by completion) and a **Habits** list (create/edit/tick habits). State is local-only (AsyncStorage / `localStorage` on web); there is no backend.

## Commands

```bash
npm install            # install deps
npm run web            # dev server in the browser (primary dev target)
npm run ios            # native via simulator / Expo Go
npm run android
npm run typecheck      # tsc --noEmit  (the only "test" — there is no test suite)
npm run build:web      # static export -> ./dist
```

There are **no unit tests and no linter configured**. `npm run typecheck` is the check to run before pushing.

## Deployment

- Pushing to `claude/habit-tracker-react-native-ohk2r3` (the repo's default branch) triggers `.github/workflows/deploy-pages.yml`, which runs the web export and publishes `dist/` to GitHub Pages at **https://217om.github.io/Notes/**.
- `app.json` sets `experiments.baseUrl: "/Notes"` so assets resolve under the project Pages sub-path. **If the repo name or hosting path changes, this baseUrl must change too**, or the deployed app loads a blank page (assets 404).
- Pages must be enabled manually in repo Settings (Source = "GitHub Actions"); the Actions token cannot auto-create the Pages site.

## Architecture

**No expo-router.** The app is a single `App.tsx` that holds the active-tab in `useState` and swaps between `CalendarScreen` and `HabitsScreen`. The bottom nav is a custom **frosted "liquid-glass" floating tab bar** (`expo-blur` `BlurView` + a spring-animated sliding pill and per-tab press scaling). Public Sans is loaded via `@expo-google-fonts/public-sans` in `App.tsx`, which gates render until fonts are ready. Everything is wrapped in `StoreProvider`.

**State** lives in one React context: `src/lib/store.tsx` (`useStore()`). It loads/persists the whole `{ habits, completions }` blob via `src/lib/storage.ts` (AsyncStorage). Mutations go through `addHabit`/`updateHabit`/`removeHabit`/`toggle`.

**All scheduling/coloring logic is UI-agnostic and lives in `src/lib/` — read these first:**

- `src/lib/types.ts` — `Habit`, `Completions`, `DayStatus`. The key idea: completions are keyed by habit id → **period key**, and the period key depends on frequency:
  - `daily` → `YYYY-MM-DD`, `weekly` → ISO week `YYYY-Www`, `monthly` → `YYYY-MM`.
  This is why a weekly/monthly habit is ticked once per period rather than per day.
- `src/lib/dates.ts` — date-key formatting, ISO-week computation, and `monthMatrix()` (always renders 6 weeks).
- `src/lib/habits.ts` — the core: `isScheduledOn()` (which habits appear on a given day), `periodKeyFor()`, `toggleCompletion()`, and `dayStatus()` (aggregates a day's completion ratio). A habit is never scheduled before its `createdAt`.
- `src/lib/theme.ts` — the **monochrome theme**: `useTheme()` returns a black/white palette that flips with the OS color scheme (`useColorScheme`), the `Theme` type, and `font` (Public Sans family names). Components build styles via a local `makeStyles(theme)` memoized on the theme. `ratioColor()` maps a completion ratio to the red→orange→yellow→green scale used by calendar cells — kept colourful on purpose (it's the calendar's whole point), independent of the monochrome chrome. Per-habit colours (`HABIT_COLORS`) are user data and also stay colourful.

`src/components/` is presentation only (`CalendarScreen`, `HabitsScreen`, `HabitFormModal`, `DayDetailModal`, `Legend`) and should defer all date/scheduling math to `src/lib`.

## Critical dependency constraint

`expo-font` **must stay pinned to the SDK 52 line (`~13.0.4`)**. `@expo/vector-icons` will otherwise pull a newer major (56.x), whose web module registers as a factory function that the SDK 52 `expo-modules-core` (2.2.3) rejects with `"Module implementation must be a class"` — this crashes the entire web app into a blank page at startup. When changing Expo deps, use `npx expo install <pkg>` (not bare npm) so versions stay aligned to the SDK, and re-verify the web build actually renders, not just that it bundles.
