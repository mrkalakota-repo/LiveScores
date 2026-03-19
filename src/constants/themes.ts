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
  surface:             '#0a0a0a',
  surfaceElevated:     '#141414',
  border:              '#1c1c1e',
  borderSubtle:        '#111111',
  textPrimary:         '#f5f5f7',
  textSecondary:       '#a8b8cc',
  textMuted:           '#556a82',
  live:                '#ff2d55',
  liveBackground:      '#1a0008',
  liveBorder:          '#5c0019',
  liveCardBackground:  '#0d0004',
  halftime:            '#ff9f0a',
  halftimeBackground:  '#1a0e00',
  halftimeBorder:      '#7a4800',
  final:               '#556a82',
  finalBackground:     '#0a0a0a',
  finalBorder:         '#1c1c1e',
  scheduled:           '#00c8ff',
  scheduledBackground: '#001a2e',
  scheduledBorder:     '#00507a',
  winner:              '#f5f5f7',
  loser:               '#556a82',
  winnerScore:         '#30d158',
  loserScore:          '#556a82',
  tabActive:           '#00c8ff',
  tabInactive:         '#4a6278',
  tabLive:             '#ff2d55',
  tabBarBackground:    '#050505',
  chipActive:          '#001a2e',
  chipActiveBorder:    '#00c8ff',
  chipActiveText:      '#f5f5f7',
  chipInactive:        '#0a0a0a',
  chipInactiveBorder:  '#1c1c1e',
  chipInactiveText:    '#a8b8cc',
  divider:             '#111111',
  accent:              '#00c8ff',
  isDark:              true,
};

// ── Midnight — deep indigo-purple with vibrant violet ─────────────────────
const midnight: ColorScheme = {
  background:          '#06001a',
  surface:             '#0d0028',
  surfaceElevated:     '#16003a',
  border:              '#26004e',
  borderSubtle:        '#1a0034',
  textPrimary:         '#f0e6ff',
  textSecondary:       '#b090e0',
  textMuted:           '#6840a0',
  live:                '#ff2d55',
  liveBackground:      '#1f0015',
  liveBorder:          '#660022',
  liveCardBackground:  '#120008',
  halftime:            '#ff9f0a',
  halftimeBackground:  '#1f1200',
  halftimeBorder:      '#8a5200',
  final:               '#6840a0',
  finalBackground:     '#0d0028',
  finalBorder:         '#26004e',
  scheduled:           '#bf5af2',
  scheduledBackground: '#18004a',
  scheduledBorder:     '#5a1a99',
  winner:              '#f0e6ff',
  loser:               '#6840a0',
  winnerScore:         '#34d399',
  loserScore:          '#6840a0',
  tabActive:           '#c084fc',
  tabInactive:         '#5a3688',
  tabLive:             '#ff2d55',
  tabBarBackground:    '#040010',
  chipActive:          '#1e0055',
  chipActiveBorder:    '#c084fc',
  chipActiveText:      '#f0e6ff',
  chipInactive:        '#0d0028',
  chipInactiveBorder:  '#26004e',
  chipInactiveText:    '#b090e0',
  divider:             '#1a0034',
  accent:              '#c084fc',
  isDark:              true,
};

// ── Ember — warm obsidian with amber-gold ─────────────────────────────────
const ember: ColorScheme = {
  background:          '#0e0800',
  surface:             '#1a1000',
  surfaceElevated:     '#261600',
  border:              '#3c2400',
  borderSubtle:        '#2a1a00',
  textPrimary:         '#fff8ec',
  textSecondary:       '#d4a868',
  textMuted:           '#7a5828',
  live:                '#ff2d55',
  liveBackground:      '#1f0a00',
  liveBorder:          '#661e00',
  liveCardBackground:  '#120500',
  halftime:            '#ff9f0a',
  halftimeBackground:  '#1f1000',
  halftimeBorder:      '#8a5000',
  final:               '#7a5828',
  finalBackground:     '#1a1000',
  finalBorder:         '#3c2400',
  scheduled:           '#ff9f0a',
  scheduledBackground: '#1f1000',
  scheduledBorder:     '#8a5000',
  winner:              '#fff8ec',
  loser:               '#7a5828',
  winnerScore:         '#34c759',
  loserScore:          '#7a5828',
  tabActive:           '#ffa020',
  tabInactive:         '#6a4818',
  tabLive:             '#ff2d55',
  tabBarBackground:    '#0a0500',
  chipActive:          '#201000',
  chipActiveBorder:    '#ffa020',
  chipActiveText:      '#fff8ec',
  chipInactive:        '#1a1000',
  chipInactiveBorder:  '#3c2400',
  chipInactiveText:    '#d4a868',
  divider:             '#2a1a00',
  accent:              '#ffa020',
  isDark:              true,
};

// ── Frost — crisp white with deep sky blue ────────────────────────────────
const frost: ColorScheme = {
  background:          '#f4f7fb',
  surface:             '#ffffff',
  surfaceElevated:     '#eaeff7',
  border:              '#d8e2f0',
  borderSubtle:        '#e6edf7',
  textPrimary:         '#0c1930',
  textSecondary:       '#3a5278',
  textMuted:           '#7a90b0',
  live:                '#e31738',
  liveBackground:      '#fff0f3',
  liveBorder:          '#ffb8c8',
  liveCardBackground:  '#fff5f8',
  halftime:            '#d97706',
  halftimeBackground:  '#fffbec',
  halftimeBorder:      '#fdd68a',
  final:               '#7a90b0',
  finalBackground:     '#f4f7fb',
  finalBorder:         '#d8e2f0',
  scheduled:           '#0071e3',
  scheduledBackground: '#e8f3ff',
  scheduledBorder:     '#93c5fd',
  winner:              '#0c1930',
  loser:               '#7a90b0',
  winnerScore:         '#16813a',
  loserScore:          '#7a90b0',
  tabActive:           '#0071e3',
  tabInactive:         '#7a90b0',
  tabLive:             '#e31738',
  tabBarBackground:    '#ffffff',
  chipActive:          '#daeeff',
  chipActiveBorder:    '#0071e3',
  chipActiveText:      '#00458a',
  chipInactive:        '#f4f7fb',
  chipInactiveBorder:  '#d8e2f0',
  chipInactiveText:    '#3a5278',
  divider:             '#e0e8f4',
  accent:              '#0071e3',
  isDark:              false,
};

// ── Linen — warm ivory with rich amber ────────────────────────────────────
const linen: ColorScheme = {
  background:          '#faf6f0',
  surface:             '#ffffff',
  surfaceElevated:     '#f2ebe0',
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
  finalBackground:     '#faf6f0',
  finalBorder:         '#ddd0b8',
  scheduled:           '#b86000',
  scheduledBackground: '#fff8ee',
  scheduledBorder:     '#fccf80',
  winner:              '#1c1008',
  loser:               '#a07848',
  winnerScore:         '#186830',
  loserScore:          '#a07848',
  tabActive:           '#c07000',
  tabInactive:         '#a07848',
  tabLive:             '#c91c30',
  tabBarBackground:    '#faf6f0',
  chipActive:          '#fff0d0',
  chipActiveBorder:    '#c07000',
  chipActiveText:      '#7a3e00',
  chipInactive:        '#faf6f0',
  chipInactiveBorder:  '#ddd0b8',
  chipInactiveText:    '#6b4e28',
  divider:             '#e8dcc8',
  accent:              '#c07000',
  isDark:              false,
};

export const THEMES: Record<ThemeName, ColorScheme> = { carbon, midnight, ember, frost, linen };

export const THEME_META: Record<ThemeName, { label: string; description: string; preview: string; bg: string; textColor: string }> = {
  carbon:   { label: 'Carbon',   description: 'AMOLED black · electric cyan',   preview: '#00c8ff', bg: '#000000', textColor: '#f5f5f7' },
  midnight: { label: 'Midnight', description: 'Deep indigo · vibrant violet',   preview: '#c084fc', bg: '#06001a', textColor: '#f0e6ff' },
  ember:    { label: 'Ember',    description: 'Warm obsidian · amber gold',     preview: '#ffa020', bg: '#0e0800', textColor: '#fff8ec' },
  frost:    { label: 'Frost',    description: 'Crisp white · sky blue',         preview: '#0071e3', bg: '#ffffff', textColor: '#0c1930' },
  linen:    { label: 'Linen',    description: 'Warm ivory · rich amber',        preview: '#c07000', bg: '#faf6f0', textColor: '#1c1008' },
};
