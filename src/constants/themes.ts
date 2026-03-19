import { Colors } from './colors';

export type ThemeName = 'electric' | 'emerald' | 'sunset';

export type ColorScheme = typeof Colors;

export const THEMES: Record<ThemeName, ColorScheme> = {
  electric: Colors,
  emerald: {
    ...Colors,
    accent:              '#30d158',
    tabActive:           '#30d158',
    scheduled:           '#30d158',
    scheduledBackground: '#001a0d',
    scheduledBorder:     '#0d5c28',
    chipActive:          '#001a0d',
    chipActiveBorder:    '#30d158',
  },
  sunset: {
    ...Colors,
    accent:              '#ff9f0a',
    tabActive:           '#ff9f0a',
    scheduled:           '#ff9f0a',
    scheduledBackground: '#1a0e00',
    scheduledBorder:     '#7a4800',
    chipActive:          '#1a0e00',
    chipActiveBorder:    '#ff9f0a',
  },
};

export const THEME_META: Record<ThemeName, { label: string; description: string; preview: string }> = {
  electric: { label: 'Electric Blue', description: 'Crisp cyan — default', preview: '#00c8ff' },
  emerald:  { label: 'Emerald',       description: 'Fresh green accent',   preview: '#30d158' },
  sunset:   { label: 'Sunset',        description: 'Warm amber accent',    preview: '#ff9f0a' },
};
