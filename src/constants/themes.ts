export type ThemeName = 'carbon' | 'midnight' | 'ember' | 'frost' | 'linen';

export type ColorScheme = {
  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderSubtle: string;
  // Typography
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  // Status: Live
  live: string;
  liveBackground: string;
  liveBorder: string;
  liveCardBackground: string;
  // Status: Halftime
  halftime: string;
  halftimeBackground: string;
  halftimeBorder: string;
  // Status: Final
  final: string;
  finalBackground: string;
  finalBorder: string;
  // Status: Scheduled
  scheduled: string;
  scheduledBackground: string;
  scheduledBorder: string;
  // Game Results
  winner: string;
  loser: string;
  winnerScore: string;
  loserScore: string;
  // Navigation
  tabActive: string;
  tabInactive: string;
  tabLive: string;
  tabBarBackground: string;
  // Chips
  chipActive: string;
  chipActiveBorder: string;
  chipActiveText: string;
  chipInactive: string;
  chipInactiveBorder: string;
  chipInactiveText: string;
  // Misc
  divider: string;
  accent: string;
  // Theme mode
  isDark: boolean;
};

// ── Carbon — AMOLED black with electric cyan ───────────────────────────────
const carbon: ColorScheme = {
  background:          '#000000',
  surface:             '#111113',
  surfaceElevated:     '#1a1a1e',
  border:              '#252528',
  borderSubtle:        '#18181b',
  textPrimary:         '#fafafa',
  textSecondary:       '#a1a1aa',
  textMuted:           '#52525b',
  live:                '#ef4444',
  liveBackground:      '#1c0a0a',
  liveBorder:          '#7f1d1d',
  liveCardBackground:  '#110606',
  halftime:            '#f59e0b',
  halftimeBackground:  '#1c1304',
  halftimeBorder:      '#92400e',
  final:               '#52525b',
  finalBackground:     '#111113',
  finalBorder:         '#252528',
  scheduled:           '#22d3ee',
  scheduledBackground: '#042f3a',
  scheduledBorder:     '#0e7490',
  winner:              '#fafafa',
  loser:               '#52525b',
  winnerScore:         '#22c55e',
  loserScore:          '#52525b',
  tabActive:           '#22d3ee',
  tabInactive:         '#52525b',
  tabLive:             '#ef4444',
  tabBarBackground:    '#09090b',
  chipActive:          '#042f3a',
  chipActiveBorder:    '#22d3ee',
  chipActiveText:      '#ecfeff',
  chipInactive:        '#111113',
  chipInactiveBorder:  '#252528',
  chipInactiveText:    '#a1a1aa',
  divider:             '#18181b',
  accent:              '#22d3ee',
  isDark:              true,
};

// ── Midnight — deep indigo with vibrant violet ─────────────────────────────
const midnight: ColorScheme = {
  background:          '#050510',
  surface:             '#10102a',
  surfaceElevated:     '#1a1a40',
  border:              '#2a2a55',
  borderSubtle:        '#1c1c3d',
  textPrimary:         '#eef0ff',
  textSecondary:       '#a5a0d0',
  textMuted:           '#605a90',
  live:                '#ef4444',
  liveBackground:      '#1c0a10',
  liveBorder:          '#7f1d2d',
  liveCardBackground:  '#110608',
  halftime:            '#f59e0b',
  halftimeBackground:  '#1c1304',
  halftimeBorder:      '#92400e',
  final:               '#605a90',
  finalBackground:     '#10102a',
  finalBorder:         '#2a2a55',
  scheduled:           '#a78bfa',
  scheduledBackground: '#1e1548',
  scheduledBorder:     '#5b21b6',
  winner:              '#eef0ff',
  loser:               '#605a90',
  winnerScore:         '#34d399',
  loserScore:          '#605a90',
  tabActive:           '#a78bfa',
  tabInactive:         '#605a90',
  tabLive:             '#ef4444',
  tabBarBackground:    '#06060f',
  chipActive:          '#1e1548',
  chipActiveBorder:    '#a78bfa',
  chipActiveText:      '#eef0ff',
  chipInactive:        '#10102a',
  chipInactiveBorder:  '#2a2a55',
  chipInactiveText:    '#a5a0d0',
  divider:             '#1c1c3d',
  accent:              '#a78bfa',
  isDark:              true,
};

// ── Ember — warm obsidian with amber-gold ─────────────────────────────────
const ember: ColorScheme = {
  background:          '#0c0804',
  surface:             '#181008',
  surfaceElevated:     '#261a0e',
  border:              '#382610',
  borderSubtle:        '#2a1c0a',
  textPrimary:         '#fef3e2',
  textSecondary:       '#c9a06a',
  textMuted:           '#7a5c30',
  live:                '#ef4444',
  liveBackground:      '#1c0a06',
  liveBorder:          '#7f1d1d',
  liveCardBackground:  '#110504',
  halftime:            '#f59e0b',
  halftimeBackground:  '#1c1304',
  halftimeBorder:      '#92400e',
  final:               '#7a5c30',
  finalBackground:     '#181008',
  finalBorder:         '#382610',
  scheduled:           '#fbbf24',
  scheduledBackground: '#1c1304',
  scheduledBorder:     '#92400e',
  winner:              '#fef3e2',
  loser:               '#7a5c30',
  winnerScore:         '#34d399',
  loserScore:          '#7a5c30',
  tabActive:           '#fbbf24',
  tabInactive:         '#7a5c30',
  tabLive:             '#ef4444',
  tabBarBackground:    '#0a0604',
  chipActive:          '#261a00',
  chipActiveBorder:    '#fbbf24',
  chipActiveText:      '#fef3e2',
  chipInactive:        '#181008',
  chipInactiveBorder:  '#382610',
  chipInactiveText:    '#c9a06a',
  divider:             '#2a1c0a',
  accent:              '#fbbf24',
  isDark:              true,
};

// ── Frost — crisp white with electric blue ──────────────────────────────────
const frost: ColorScheme = {
  background:          '#f0f4f8',
  surface:             '#ffffff',
  surfaceElevated:     '#e8edf4',
  border:              '#d0d8e4',
  borderSubtle:        '#e0e6ef',
  textPrimary:         '#0f172a',
  textSecondary:       '#475569',
  textMuted:           '#94a3b8',
  live:                '#dc2626',
  liveBackground:      '#fef2f2',
  liveBorder:          '#fca5a5',
  liveCardBackground:  '#fff5f5',
  halftime:            '#d97706',
  halftimeBackground:  '#fffbeb',
  halftimeBorder:      '#fcd34d',
  final:               '#94a3b8',
  finalBackground:     '#f0f4f8',
  finalBorder:         '#d0d8e4',
  scheduled:           '#2563eb',
  scheduledBackground: '#eff6ff',
  scheduledBorder:     '#93c5fd',
  winner:              '#0f172a',
  loser:               '#94a3b8',
  winnerScore:         '#16a34a',
  loserScore:          '#94a3b8',
  tabActive:           '#2563eb',
  tabInactive:         '#94a3b8',
  tabLive:             '#dc2626',
  tabBarBackground:    '#ffffff',
  chipActive:          '#eff6ff',
  chipActiveBorder:    '#2563eb',
  chipActiveText:      '#1d4ed8',
  chipInactive:        '#f0f4f8',
  chipInactiveBorder:  '#d0d8e4',
  chipInactiveText:    '#475569',
  divider:             '#e2e8f0',
  accent:              '#2563eb',
  isDark:              false,
};

// ── Linen — warm ivory with rich amber ──────────────────────────────────────
const linen: ColorScheme = {
  background:          '#f8f4ee',
  surface:             '#ffffff',
  surfaceElevated:     '#f0e8da',
  border:              '#ddd0b8',
  borderSubtle:        '#eae0d0',
  textPrimary:         '#1c1008',
  textSecondary:       '#6b4e28',
  textMuted:           '#a07848',
  live:                '#c91c30',
  liveBackground:      '#fff0f2',
  liveBorder:          '#ffb0ba',
  liveCardBackground:  '#fff4f6',
  halftime:            '#b86000',
  halftimeBackground:  '#fff8ee',
  halftimeBorder:      '#fccf80',
  final:               '#a07848',
  finalBackground:     '#f8f4ee',
  finalBorder:         '#ddd0b8',
  scheduled:           '#b86000',
  scheduledBackground: '#fff8ee',
  scheduledBorder:     '#fccf80',
  winner:              '#1c1008',
  loser:               '#a07848',
  winnerScore:         '#16a34a',
  loserScore:          '#a07848',
  tabActive:           '#c07000',
  tabInactive:         '#a07848',
  tabLive:             '#c91c30',
  tabBarBackground:    '#f8f4ee',
  chipActive:          '#fff0d0',
  chipActiveBorder:    '#c07000',
  chipActiveText:      '#7a3e00',
  chipInactive:        '#f8f4ee',
  chipInactiveBorder:  '#ddd0b8',
  chipInactiveText:    '#6b4e28',
  divider:             '#e8dcc8',
  accent:              '#c07000',
  isDark:              false,
};

export const THEMES: Record<ThemeName, ColorScheme> = { carbon, midnight, ember, frost, linen };

export const THEME_META: Record<ThemeName, {
  label: string; description: string; preview: string; bg: string; textColor: string;
  surface: string; textPrimary: string; textMuted: string; live: string;
}> = {
  carbon:   { label: 'Carbon',   description: 'AMOLED black · electric cyan',   preview: '#22d3ee', bg: '#000000', textColor: '#fafafa', surface: '#111113', textPrimary: '#fafafa', textMuted: '#52525b', live: '#ef4444' },
  midnight: { label: 'Midnight', description: 'Deep indigo · vibrant violet',   preview: '#a78bfa', bg: '#050510', textColor: '#eef0ff', surface: '#10102a', textPrimary: '#eef0ff', textMuted: '#605a90', live: '#ef4444' },
  ember:    { label: 'Ember',    description: 'Warm obsidian · amber gold',     preview: '#fbbf24', bg: '#0c0804', textColor: '#fef3e2', surface: '#181008', textPrimary: '#fef3e2', textMuted: '#7a5c30', live: '#ef4444' },
  frost:    { label: 'Frost',    description: 'Crisp white · electric blue',    preview: '#2563eb', bg: '#f0f4f8', textColor: '#0f172a', surface: '#ffffff', textPrimary: '#0f172a', textMuted: '#94a3b8', live: '#dc2626' },
  linen:    { label: 'Linen',    description: 'Warm ivory · rich amber',        preview: '#c07000', bg: '#f8f4ee', textColor: '#1c1008', surface: '#ffffff', textPrimary: '#1c1008', textMuted: '#a07848', live: '#c91c30' },
};
