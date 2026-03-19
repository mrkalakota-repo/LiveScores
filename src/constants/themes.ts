export type ThemeName = 'carbon' | 'midnight' | 'ember';

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
};

// ── Carbon — pure-dark with cyan ──────────────────────────────────────────────
const carbon: ColorScheme = {
  background:          '#000000',
  surface:             '#0d0d0d',
  surfaceElevated:     '#161616',
  border:              '#1e1e1e',
  borderSubtle:        '#141414',
  textPrimary:         '#ffffff',
  textSecondary:       '#aab8d0',
  textMuted:           '#627a98',
  live:                '#ff2d55',
  liveBackground:      '#1a0008',
  liveBorder:          '#5c0019',
  liveCardBackground:  '#0d0004',
  halftime:            '#ff9f0a',
  halftimeBackground:  '#1a0e00',
  halftimeBorder:      '#7a4800',
  final:               '#627a98',
  finalBackground:     '#0d0d0d',
  finalBorder:         '#1e1e1e',
  scheduled:           '#0a84ff',
  scheduledBackground: '#001233',
  scheduledBorder:     '#0a3d8f',
  winner:              '#ffffff',
  loser:               '#627a98',
  winnerScore:         '#34c759',
  loserScore:          '#627a98',
  tabActive:           '#00c8ff',
  tabInactive:         '#627a98',
  tabLive:             '#ff2d55',
  tabBarBackground:    '#050505',
  chipActive:          '#001a33',
  chipActiveBorder:    '#00c8ff',
  chipActiveText:      '#ffffff',
  chipInactive:        '#0d0d0d',
  chipInactiveBorder:  '#1e1e1e',
  chipInactiveText:    '#aab8d0',
  divider:             '#141414',
  accent:              '#00c8ff',
};

// ── Midnight — deep navy-purple with violet ───────────────────────────────────
const midnight: ColorScheme = {
  background:          '#07001a',
  surface:             '#0e0025',
  surfaceElevated:     '#160034',
  border:              '#260048',
  borderSubtle:        '#1a0038',
  textPrimary:         '#ede0ff',
  textSecondary:       '#a888d8',
  textMuted:           '#6b4a99',
  live:                '#ff2d55',
  liveBackground:      '#1f0015',
  liveBorder:          '#660022',
  liveCardBackground:  '#120008',
  halftime:            '#ff9f0a',
  halftimeBackground:  '#1f1200',
  halftimeBorder:      '#8a5200',
  final:               '#6b4a99',
  finalBackground:     '#0e0025',
  finalBorder:         '#260048',
  scheduled:           '#9f6fff',
  scheduledBackground: '#15003d',
  scheduledBorder:     '#4a1a99',
  winner:              '#ede0ff',
  loser:               '#6b4a99',
  winnerScore:         '#34c759',
  loserScore:          '#6b4a99',
  tabActive:           '#bf5af2',
  tabInactive:         '#6b4a99',
  tabLive:             '#ff2d55',
  tabBarBackground:    '#050012',
  chipActive:          '#1f0050',
  chipActiveBorder:    '#bf5af2',
  chipActiveText:      '#ede0ff',
  chipInactive:        '#0e0025',
  chipInactiveBorder:  '#260048',
  chipInactiveText:    '#a888d8',
  divider:             '#1a0038',
  accent:              '#bf5af2',
};

// ── Ember — warm dark with amber ──────────────────────────────────────────────
const ember: ColorScheme = {
  background:          '#0f0800',
  surface:             '#1a0f00',
  surfaceElevated:     '#241500',
  border:              '#3a2200',
  borderSubtle:        '#281800',
  textPrimary:         '#fff5e0',
  textSecondary:       '#c8a06a',
  textMuted:           '#7a5830',
  live:                '#ff2d55',
  liveBackground:      '#1f0a00',
  liveBorder:          '#661e00',
  liveCardBackground:  '#120500',
  halftime:            '#ff9f0a',
  halftimeBackground:  '#1f1000',
  halftimeBorder:      '#8a5000',
  final:               '#7a5830',
  finalBackground:     '#1a0f00',
  finalBorder:         '#3a2200',
  scheduled:           '#ff9f0a',
  scheduledBackground: '#1f1000',
  scheduledBorder:     '#8a5000',
  winner:              '#fff5e0',
  loser:               '#7a5830',
  winnerScore:         '#34c759',
  loserScore:          '#7a5830',
  tabActive:           '#ff9f0a',
  tabInactive:         '#7a5830',
  tabLive:             '#ff2d55',
  tabBarBackground:    '#0a0500',
  chipActive:          '#1f1000',
  chipActiveBorder:    '#ff9f0a',
  chipActiveText:      '#fff5e0',
  chipInactive:        '#1a0f00',
  chipInactiveBorder:  '#3a2200',
  chipInactiveText:    '#c8a06a',
  divider:             '#281800',
  accent:              '#ff9f0a',
};

export const THEMES: Record<ThemeName, ColorScheme> = { carbon, midnight, ember };

export const THEME_META: Record<ThemeName, { label: string; description: string; preview: string; bg: string }> = {
  carbon:   { label: 'Carbon',   description: 'Pure black with cyan',       preview: '#00c8ff', bg: '#000000' },
  midnight: { label: 'Midnight', description: 'Deep purple, violet accent', preview: '#bf5af2', bg: '#07001a' },
  ember:    { label: 'Ember',    description: 'Warm dark with amber',       preview: '#ff9f0a', bg: '#0f0800' },
};
