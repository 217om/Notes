import { useColorScheme } from 'react-native';

/** Public Sans family names (loaded in App via @expo-google-fonts/public-sans). */
export const font = {
  regular: 'PublicSans_400Regular',
  medium: 'PublicSans_500Medium',
  semibold: 'PublicSans_600SemiBold',
  bold: 'PublicSans_700Bold',
};

export interface Theme {
  dark: boolean;
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  hairline: string;
  text: string;
  textMuted: string;
  /** Accent — black in light mode, white in dark mode. */
  primary: string;
  /** Text/icon colour that sits on top of `primary`. */
  onPrimary: string;
  danger: string;
  /** Tint for the frosted glass tab bar. */
  glassTint: 'light' | 'dark';
  glassBg: string;
  glassBorder: string;
  /** Background of the active tab "pill". */
  pill: string;
}

const light: Theme = {
  dark: false,
  bg: '#ffffff',
  surface: '#f4f4f5',
  surfaceAlt: '#e9e9eb',
  border: '#e4e4e7',
  hairline: '#d4d4d8',
  text: '#000000',
  textMuted: '#6b7280',
  primary: '#000000',
  onPrimary: '#ffffff',
  danger: '#ef4444',
  glassTint: 'light',
  glassBg: 'rgba(255,255,255,0.55)',
  glassBorder: 'rgba(0,0,0,0.08)',
  pill: 'rgba(0,0,0,0.08)',
};

const dark: Theme = {
  dark: true,
  bg: '#000000',
  surface: '#111113',
  surfaceAlt: '#1c1c1f',
  border: '#27272a',
  hairline: '#3f3f46',
  text: '#ffffff',
  textMuted: '#a1a1aa',
  primary: '#ffffff',
  onPrimary: '#000000',
  danger: '#f87171',
  glassTint: 'dark',
  glassBg: 'rgba(20,20,22,0.55)',
  glassBorder: 'rgba(255,255,255,0.12)',
  pill: 'rgba(255,255,255,0.14)',
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

/** Linear interpolation between two hex colours. t in [0, 1]. */
function lerpColor(a: string, b: string, t: number): string {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * t));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

// Semantic completion scale (kept colourful on purpose — it's the calendar's whole point).
const SCALE = {
  none: '#ef4444', // red
  low: '#f97316', // orange
  high: '#eab308', // yellow
  done: '#22c55e', // green
};

/**
 * Maps a completion ratio to a colour:
 *   null -> transparent (nothing scheduled)
 *   0    -> red, ~0.5 -> orange, ~0.9 -> yellow, 1 -> green
 */
export function ratioColor(ratio: number | null): string {
  if (ratio === null) return 'transparent';
  if (ratio <= 0) return SCALE.none;
  if (ratio >= 1) return SCALE.done;
  if (ratio < 0.5) return lerpColor(SCALE.none, SCALE.low, ratio / 0.5);
  if (ratio < 0.8) return lerpColor(SCALE.low, SCALE.high, (ratio - 0.5) / 0.3);
  return lerpColor(SCALE.high, SCALE.done, (ratio - 0.8) / 0.2);
}
