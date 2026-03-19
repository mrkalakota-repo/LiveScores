import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { THEMES, THEME_META, type ThemeName, type ColorScheme } from '@/constants/themes';

interface ThemeContextValue {
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  C: ColorScheme;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeName: 'electric',
  setTheme: () => {},
  C: THEMES.electric,
});

export { THEME_META };

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeState] = useState<ThemeName>('electric');

  const setTheme = useCallback((name: ThemeName) => {
    setThemeState(name);
  }, []);

  const value = useMemo(() => ({
    themeName,
    setTheme,
    C: THEMES[themeName],
  }), [themeName, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
