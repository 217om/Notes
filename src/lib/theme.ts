import { useColorScheme } from 'react-native';
import { useStore } from './store';

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
  const { settings } = useStore();
  const pref = settings.theme;
  const isDark = pref === 'system' ? scheme === 'dark' : pref === 'dark';
  return isDark ? dark : light;
}
