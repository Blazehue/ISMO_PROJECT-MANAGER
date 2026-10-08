import { colors, type BadgeTone } from '@ismo/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

/** Same tokens as the web app (packages/shared/src/design.ts). */
const build = (mode: 'light' | 'dark') => {
  const base = mode === 'dark' ? colors.dark : colors.light;
  const dark = mode === 'dark';
  return {
    mode,
    dark,
    bg: base.background,
    surface: base.surface,
    subtle: base.subtle,
    muted: base.muted,
    border: base.border,
    text: base.text,
    textMuted: base.textMuted,
    // Ink primary actions: black on light, near-white on dark.
    primary: dark ? '#EDEDF0' : colors.ink,
    onPrimary: dark ? colors.ink : '#FFFFFF',
    brand: dark ? colors.brand[400] : colors.brand[500],
    brandStrong: dark ? colors.brand[400] : colors.brand[600],
    brandSoft: dark ? '#1B1830' : colors.brand[50],
    brandTrack: dark ? '#241F45' : colors.brand[100],
    brandTick: dark ? colors.brand[500] : colors.brand[400],
    success: dark ? '#4ADE80' : colors.success,
    danger: dark ? '#F87171' : colors.danger,
    dangerSoft: dark ? 'rgba(239,68,68,0.12)' : '#FEF2F2',
    warningSoft: dark ? 'rgba(245,158,11,0.12)' : '#FFFBEB',
    warningText: dark ? '#FCD34D' : '#92400E',
    /** The loud accent (CTA arrow tiles, today, active states). Same in both themes. */
    lime: colors.lime,
    limeInk: colors.limeInk,
    canvas: base.canvas,
    hues: {
      lime: dark
        ? { bg: 'rgba(217,255,92,0.14)', fg: '#D9FF5C' }
        : { bg: colors.hues.lime.bg, fg: colors.hues.lime.fg },
      lavender: dark
        ? { bg: 'rgba(169,155,250,0.16)', fg: '#C6BEFC' }
        : { bg: colors.hues.lavender.bg, fg: colors.hues.lavender.fg },
      peach: dark
        ? { bg: 'rgba(255,179,138,0.15)', fg: '#FFC4A3' }
        : { bg: colors.hues.peach.bg, fg: colors.hues.peach.fg },
      sky: dark ? { bg: 'rgba(124,196,255,0.15)', fg: '#A3D5FF' } : { bg: colors.hues.sky.bg, fg: colors.hues.sky.fg },
      mint: dark
        ? { bg: 'rgba(110,231,183,0.14)', fg: '#86EFC6' }
        : { bg: colors.hues.mint.bg, fg: colors.hues.mint.fg },
      rose: dark
        ? { bg: 'rgba(255,143,177,0.15)', fg: '#FFADC6' }
        : { bg: colors.hues.rose.bg, fg: colors.hues.rose.fg },
    },
  };
};

export type AppTheme = ReturnType<typeof build>;
export type Hue = keyof AppTheme['hues'];
export type ThemePreference = 'light' | 'dark' | 'system';

export const toneColors = (tone: BadgeTone, theme: AppTheme) => (theme.dark ? tone.dark : tone.light);

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  /** Labels, tags and numbers (same as the web app's Geist Mono). */
  mono: 'GeistMono_400Regular',
  monoMedium: 'GeistMono_500Medium',
  /** Accent words (Instrument Serif italic, as on the web). */
  serifItalic: 'InstrumentSerif_400Regular_Italic',
};

const STORAGE_KEY = 'ismo-theme';

interface ThemeContextValue {
  theme: AppTheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (value === 'light' || value === 'dark' || value === 'system') setPreferenceState(value);
      })
      .catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const mode = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
    return {
      theme: build(mode),
      preference,
      setPreference: (next) => {
        setPreferenceState(next);
        AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      },
    };
  }, [preference, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>');
  return context;
}
