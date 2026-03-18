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
npm test                   # Run all tests once
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
npx jest --testPathPattern="GameCard"   # Run a single test file

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

- `app/_layout.tsx` — root: `QueryClientProvider` + `AppState` refetch listener (native only)
- `app/(tabs)/_layout.tsx` — tab bar driven dynamically from `SPORTS` array in `src/constants/sports.ts`
- `app/(tabs)/[sport].tsx` — thin screens: call `useScoreboard`, pass data to `ScoreboardList`
- `app/(tabs)/soccer.tsx` and `app/(tabs)/cricket.tsx` — add a `LeagueChipBar` to switch sub-leagues
- `app/game/[id].tsx` — detail screen; receives `{ id, sport, league }` params from `GameCard` press

### Adding a New Sport Tab

1. Add an entry to `SPORTS` in `src/constants/sports.ts` — the tab is auto-registered.
2. Create `app/(tabs)/[sport-id].tsx` following the pattern in `nfl.tsx`.
3. Add the sport slug to the `VALID_SPORTS` set in `src/api/espn.ts`.
4. If it needs a sub-league picker, add a `*_LEAGUES` array and follow the soccer/cricket pattern.

### Polling Strategy

| Context | Interval |
|---|---|
| Scoreboard (all tabs) | 45 s (`POLL_INTERVAL_MS`) |
| Game detail — live | 20 s |
| Game detail — finished/scheduled | 120 s |

`refetchIntervalInBackground: false` — polling pauses when app is backgrounded. On native, `AppState` + TanStack `focusManager` triggers an immediate refetch on foreground resume. On web, the browser's `visibilitychange` event handles this automatically.

### Error Handling

`src/api/errors.ts` exports `AppError` with a `kind` discriminant: `network | timeout | not_found | server | unknown`. Hooks set `retry: false` for `not_found` to avoid hammering dead endpoints. `ErrorScreen` renders kind-specific icons and messages.

### Cross-Platform Notes

- `RefreshControl` is native only — guarded with `Platform.OS !== 'web'` in `ScoreboardList`.
- `AppState` listener in `app/_layout.tsx` is guarded with `Platform.OS !== 'web'`.

### Testing Setup

- Jest preset: `jest-expo` (~54)
- `@testing-library/react-native` v13 (matchers built-in, no explicit import needed)
- `moduleNameMapper` in `package.json` resolves `@/` alias and stubs `@expo/vector-icons` and `expo-image`
- Tests live in `src/__tests__/{api,components,utils}/`
- Mock stubs: `src/__mocks__/@expo/vector-icons.tsx`, `src/__mocks__/expo-image.tsx`
