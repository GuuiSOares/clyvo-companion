import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { THEME_MODE_KEY } from '../constants/storage';
import { darkColors, lightColors, type AppColors } from './colors';
import { createCommonStyles, type CommonStyles } from './commonStyles';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  scheme: 'light' | 'dark';
  colors: AppColors;
  commonStyles: CommonStyles;
  navigationTheme: Theme;
  statusBarStyle: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(THEME_MODE_KEY)
      .then((stored) => {
        if (!active) return;
        if (isThemeMode(stored)) setMode(stored);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    AsyncStorage.setItem(THEME_MODE_KEY, mode).catch(() => undefined);

    try {
      Appearance.setColorScheme(mode === 'system' ? null : mode);
    } catch {
      // Na web o esquema nativo pode não existir.
    }
  }, [hydrated, mode]);

  const scheme: 'light' | 'dark' =
    mode === 'system' ? (systemScheme === 'light' ? 'light' : 'dark') : mode;

  const value = useMemo<ThemeContextValue>(() => {
    const colors = scheme === 'light' ? lightColors : darkColors;
    const base = scheme === 'light' ? DefaultTheme : DarkTheme;

    return {
      mode,
      scheme,
      colors,
      commonStyles: createCommonStyles(colors),
      statusBarStyle: scheme === 'light' ? 'dark' : 'light',
      setMode,
      navigationTheme: {
        ...base,
        dark: scheme === 'dark',
        colors: {
          ...base.colors,
          primary: colors.accent,
          background: colors.background,
          card: colors.background,
          text: colors.text,
          border: colors.border,
          notification: colors.accent,
        },
      },
    };
  }, [mode, scheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme deve ser usado dentro de ThemeProvider');
  }
  return value;
}
