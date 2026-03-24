import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEMES, THEME_META, type ThemeName, type ColorScheme } from '@/constants/themes';

const THEME_STORAGE_KEY = '@livescores/theme';
const VALID_THEMES = new Set<string>(Object.keys(THEMES));

interface ThemeContextValue {
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  C: ColorScheme;
  ready: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeName: 'carbon',
  setTheme: () => {},
  C: THEMES.carbon,
  ready: false,
});

export { THEME_META };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeState] = useState<ThemeName>('carbon');
  const [ready, setReady] = useState(false);

  // Load persisted theme on mount
  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY).then(stored => {
      if (stored && VALID_THEMES.has(stored)) {
        setThemeState(stored as ThemeName);
      }
      setReady(true);
    });
  }, []);

  const setTheme = useCallback((name: ThemeName) => {
    setThemeState(name);
    AsyncStorage.setItem(THEME_STORAGE_KEY, name);
  }, []);

  const value = useMemo(() => ({
    themeName,
    setTheme,
    C: THEMES[themeName],
    ready,
  }), [themeName, setTheme, ready]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
