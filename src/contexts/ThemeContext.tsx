import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ActiveThemeScheme = 'light' | 'dark';

export interface ThemeColors {
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly textMuted: string;
  readonly subtext: string;
  readonly primary: string;
  readonly border: string;
  readonly card?: string;
  readonly input?: string;
  readonly placeholder?: string;
  readonly success?: string;
  readonly warning?: string;
  readonly error?: string;
  readonly danger?: string;
  readonly disabled?: string;
  readonly overlay?: string;
}

export interface Theme {
  readonly colors: ThemeColors;
  readonly scheme: ActiveThemeScheme;
  readonly isDark: boolean;
}

export interface ThemeContextType {
  readonly themeMode: ThemeMode;
  readonly activeScheme: ActiveThemeScheme;
  readonly colors: ThemeColors;
  readonly theme: Theme;
  readonly isDark: boolean;
  readonly setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const STORAGE_KEY = '@spleaz_theme_mode';
const FALLBACK_LIGHT = '#6B7280';
const FALLBACK_DARK = '#A1A1AA';

const lightColors: ThemeColors = {
  ...Colors.light,
  textMuted: typeof Colors.light.textMuted === 'string' ? Colors.light.textMuted : FALLBACK_LIGHT,
  subtext: typeof Colors.light.textMuted === 'string' ? Colors.light.textMuted : FALLBACK_LIGHT,
};

const darkColors: ThemeColors = {
  ...Colors.dark,
  textMuted: typeof Colors.dark.textMuted === 'string' ? Colors.dark.textMuted : FALLBACK_DARK,
  subtext: typeof Colors.dark.textMuted === 'string' ? Colors.dark.textMuted : FALLBACK_DARK,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps { children: ReactNode; }

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const deviceColorScheme = useDeviceColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (mounted && (saved === 'light' || saved === 'dark' || saved === 'system')) setThemeModeState(saved);
      } catch (error) { console.error('Failed to load theme preference:', error); }
    };
    void load();
    return () => { mounted = false; };
  }, []);

  const activeScheme: ActiveThemeScheme = useMemo(() => {
    if (themeMode === 'light') return 'light';
    if (themeMode === 'dark') return 'dark';
    return deviceColorScheme === 'dark' ? 'dark' : 'light';
  }, [themeMode, deviceColorScheme]);

  const isDark = activeScheme === 'dark';
  const colors = activeScheme === 'dark' ? darkColors : lightColors;
  const theme = useMemo(() => ({ colors, scheme: activeScheme, isDark }), [colors, activeScheme, isDark]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try { await AsyncStorage.setItem(STORAGE_KEY, mode); }
    catch (error) { console.error('Failed to save theme preference:', error); }
  }, []);

  const value = useMemo(() => ({ themeMode, activeScheme, colors, theme, isDark, setThemeMode }), [themeMode, activeScheme, colors, theme, isDark, setThemeMode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider.');
  return context;
};

export default ThemeContext;
