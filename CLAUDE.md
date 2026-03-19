# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (choose target)
npm start           # Expo Go / dev client
npm run ios         # iOS simulator
npm run android     # Android emulator
npm run web         # Browser (react-native-web)

# Testing
npm test                                            # Run all tests once
npm run test:watch                                  # Watch mode
npm run test:coverage                               # Coverage report
npx jest --testPathPattern="winProbability"         # Run a single test file

# Regenerate app icons (requires sharp)
npm run generate-icons
```

## Path Alias

`@/` maps to `./src/`. All source imports use this alias — never use relative paths crossing the `src/` boundary.

## Architecture

### Data Flow

```
ESPN API → fetchScoreboard/fetchGameSummary (src/api/espn.ts)
        → classifyError (src/api/errors.ts)          ← typed AppError
        → transformScoreboard (src/utils/transformers.ts) → GameData[]
        → useScoreboard / useGameSummary (TanStack Query hooks)
        → ScoreboardList / game/[id].tsx
```

All components consume the normalized `GameData` / `TeamInfo` types from `src/api/types.ts`. Raw ESPN types are never used outside `src/api/` and `src/utils/`.

### Navigation (Expo Router file-based)

- `app/_layout.tsx` — root: `ThemeProvider` → `QueryClientProvider` → `LiveGamesProvider` + `AppState` refetch listener (native only)
- `app/(tabs)/_layout.tsx` — tab bar driven dynamically from `SPORTS` array in `src/constants/sports.ts`, with a hardcoded Settings tab appended
- `app/(tabs)/[sport].tsx` — thin screens: call `useScoreboard`, pass data to `ScoreboardList`
- `app/(tabs)/soccer.tsx` and `app/(tabs)/cricket.tsx` — add a `LeagueChipBar` to switch sub-leagues
- `app/game/[id].tsx` — detail screen; receives `{ id, sport, league }` params from `GameCard` press
- `app/(tabs)/settings.tsx` — theme picker (Electric Blue / Emerald / Sunset)

### Adding a New Sport Tab

1. Add an entry to `SPORTS` in `src/constants/sports.ts` — the tab is auto-registered.
2. Create `app/(tabs)/[sport-id].tsx` following the pattern in `nfl.tsx`.
3. Add the sport slug to the `VALID_SPORTS` set in `src/api/espn.ts`.
4. If it needs a sub-league picker, add a `*_LEAGUES` array and follow the soccer/cricket pattern.

### Theme System

`src/constants/themes.ts` defines three `ColorScheme` objects (`electric`, `emerald`, `sunset`) as spreads of the base `Colors` with accent cluster overrides. `src/contexts/ThemeContext.tsx` exposes `useTheme()` returning `{ C, themeName, setTheme }` where `C` is the active `ColorScheme`. Theme is in-memory only (resets on app restart).

**Theming constraint:** `StyleSheet.create` is called at module level in all components, so static colors (backgrounds, borders, text hierarchy) are baked at import time. Only dynamic colors (accent, scheduled status, chip bar) are applied via inline style overrides or `useMemo(() => createStyles(C), [C])` inside the component. When modifying a component to be theme-aware, use `const { C } = useTheme()` and override only the accent-related style keys inline — do not rewrite the whole StyleSheet.

### Live Dot Indicators

`LiveCountPoller` (mounted in `app/_layout.tsx`) polls every non-cricket sport's default scoreboard simultaneously using `useQueries`. Query keys match what tab screens use, so TanStack Query deduplicates requests. Live counts are stored in `LiveGamesContext` and read by the tab bar icon renderer to show pulsing dots.

Cricket requires dynamic league discovery (`useCricketLeagues`) and can't be statically polled. `CricketLiveTracker` (a null-component inside `app/(tabs)/_layout.tsx`) handles this — it's always mounted so the cricket live dot appears before the user visits that tab.

### Win Probability

`src/utils/winProbability.ts` — `computeWinProbability()` returns `null` for final games (scoreline is already definitive). For live games it blends three signals: score differential × per-sport weight × game progress, season record (decays as progress → 1), and stats (total yards / shots). Tennis and cricket have dedicated sub-models. Returns `{ home, away, basis }` where values are integers summing to 100. `computeWinProbability` is called inside `useGameSummary` (detail screen) and `transformScoreboard` (cards).

### `useGameSummary` 400 Fallback

ESPN's summary API returns HTTP 400 for certain sport/event combinations (e.g. tennis). The hook catches this, looks up the event in TanStack Query's cache under the `['scoreboard', sport, league]` key, and returns a minimal `GameSummaryData` built from that cached `GameData` so the detail screen still renders.

### Polling Strategy

| Context | Interval |
|---|---|
| Scoreboard (all tabs) | 45 s (`POLL_INTERVAL_MS`) |
| Game detail | 20 s (`LIVE_INTERVAL`) |

`refetchIntervalInBackground: false` — polling pauses when app is backgrounded. On native, `AppState` + TanStack `focusManager` triggers an immediate refetch on foreground resume.

### Error Handling

`src/api/errors.ts` exports `AppError` with a `kind` discriminant: `network | timeout | not_found | server | unknown`. Hooks set `retry: false` for `not_found` / 400 to avoid hammering dead endpoints. `ErrorScreen` renders kind-specific icons and messages.

### Cross-Platform Notes

- `RefreshControl` is native only — guarded with `Platform.OS !== 'web'` in `ScoreboardList`.
- `AppState` listener in `app/_layout.tsx` is guarded with `Platform.OS !== 'web'`.

### Testing Setup

- Jest preset: `jest-expo` (~54)
- `@testing-library/react-native` v13 (matchers built-in, no explicit import needed)
- `moduleNameMapper` in `package.json` resolves `@/` alias and stubs `@expo/vector-icons` and `expo-image`
- Tests live in `src/__tests__/{api,components,utils}/`
- Mock stubs: `src/__mocks__/@expo/vector-icons.tsx`, `src/__mocks__/expo-image.tsx`
