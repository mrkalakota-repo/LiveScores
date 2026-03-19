# LiveScores — Usage Guide

## Prerequisites

| Tool        | Version   | Install                        |
|-------------|-----------|--------------------------------|
| Node.js     | ≥ 18      | https://nodejs.org             |
| npm         | ≥ 9       | bundled with Node              |
| Expo CLI    | via npx   | no global install needed       |
| Expo Go app | ≥ SDK 54  | App Store / Google Play        |
| Xcode       | ≥ 15      | (iOS simulator only)           |
| Android SDK | ≥ API 33  | (Android emulator only)        |

---

## Quick Start

```bash
git clone https://github.com/mrkalakota-repo/LiveScores
cd LiveScores
npm install --legacy-peer-deps
npm start
```

Scan the QR code with Expo Go (iOS: Camera app, Android: Expo Go app).

---

## Running on Each Platform

```bash
npm start          # Opens Expo dev server — choose platform interactively
npm run ios        # Boots iOS simulator (requires Xcode)
npm run android    # Boots Android emulator (requires Android Studio)
npm run web        # Opens http://localhost:8081 in browser
```

Press `r` in the terminal to reload. Press `shift+m` to open the Expo dev menu.

---

## Running Tests

```bash
npm test                                        # Run all tests once
npm run test:watch                              # Watch mode (re-runs on save)
npm run test:coverage                           # Coverage report (lcov + text)
npx jest --testPathPattern="GameCard"           # Run one test file by name
npx jest --testPathPattern="errors|espn"        # Run multiple matching files
npx jest --verbose                              # Show individual test names
```

Coverage output is written to `coverage/` and displayed in the terminal.

---

## Regenerating App Icons

Requires the `sharp` npm package (already in devDependencies).

```bash
npm run generate-icons
```

This runs `scripts/generate-icons.js` and writes to `assets/`:
- `icon.png` (1024 × 1024) — iOS / general
- `splash-icon.png` (512 × 512) — Expo splash screen
- `favicon.png` (64 × 64) — web tab
- `android-icon-background.png` — adaptive icon background
- `android-icon-foreground.png` — adaptive icon foreground
- `android-icon-monochrome.png` — notification icon

Edit the SVG template inside `scripts/generate-icons.js` to change the icon design.

---

## Project Layout for New Developers

```
src/api/          ← ESPN HTTP client + typed errors + raw/normalised types
src/constants/    ← Sport & league configs, colours, poll intervals
src/contexts/     ← LiveGamesContext (live count per tab)
src/hooks/        ← TanStack Query hooks (useScoreboard, useGameSummary)
src/utils/        ← Pure transformation & formatting functions
src/components/   ← All UI building blocks
app/(tabs)/       ← One file per sport tab
app/game/[id].tsx ← Game detail screen
docs/             ← Design doc, architecture, this file
```

`@/` is an alias for `src/`. Use it for all imports — never use relative paths that cross the `src/` boundary.

---

## Adding a New Sport Tab

### 1. Register the sport constant

In [src/constants/sports.ts](../src/constants/sports.ts), add to the `SPORTS` array:

```ts
{
  id: 'rugby',          // unique tab ID and route segment
  label: 'Rugby',       // tab bar label (keep short — ≤ 6 chars ideal)
  sport: 'rugby',       // ESPN sport slug
  league: 'irb.sevens', // ESPN league slug (default league)
  icon: 'american-football-outline', // Ionicons name
}
```

### 2. Allowlist the sport in the API layer

In [src/api/espn.ts](../src/api/espn.ts), add to `VALID_SPORTS`:

```ts
const VALID_SPORTS = new Set([
  'football', 'basketball', 'baseball', 'hockey',
  'soccer', 'tennis', 'cricket',
  'rugby',   // ← add here
]);
```

### 3. Create the screen file

Create `app/(tabs)/rugby.tsx` following the standard pattern:

```tsx
import { useEffect } from 'react';
import { useScoreboard } from '@/hooks/useScoreboard';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { useLiveGames } from '@/contexts/LiveGamesContext';
import { ScoreboardList } from '@/components/ScoreboardList';

export default function RugbyScreen() {
  const { data, isLoading, isError, error, isRefetching, refetch, dataUpdatedAt } =
    useScoreboard('rugby', 'irb.sevens');
  const { setLiveCount } = useLiveGames();
  useRefreshOnFocus(refetch);

  useEffect(() => {
    const count = data?.filter(g => g.status === 'live' || g.status === 'halftime').length ?? 0;
    setLiveCount('rugby', count);
  }, [data, setLiveCount]);

  return (
    <ScoreboardList
      games={data ?? []}
      isLoading={isLoading}
      isError={isError}
      error={error}
      isRefetching={isRefetching}
      onRetry={refetch}
      onRefresh={refetch}
      updatedAt={dataUpdatedAt}
      sport="rugby"
    />
  );
}
```

The tab is auto-registered by the dynamic tab layout — no changes to `_layout.tsx` needed.

---

## Adding a Sport with Sub-League Selector

For sports with multiple leagues (like Soccer or Cricket), add a `LeagueChipBar`:

### 1. Define the leagues array in `sports.ts`

```ts
export const RUGBY_LEAGUES: LeagueConfig[] = [
  { id: 'sevens', label: 'Sevens', sport: 'rugby', league: 'irb.sevens' },
  { id: 'super',  label: 'Super Rugby', sport: 'rugby', league: 'rugby.super' },
];
```

### 2. Update the screen to use `LeagueChipBar`

```tsx
import { useState } from 'react';
import { View } from 'react-native';
import { LeagueChipBar } from '@/components/LeagueChipBar';
import { RUGBY_LEAGUES } from '@/constants/sports';

export default function RugbyScreen() {
  const [selectedLeague, setSelectedLeague] = useState(RUGBY_LEAGUES[0].league);
  const { data, ... } = useScoreboard('rugby', selectedLeague);
  // ... same as standard pattern

  return (
    <View style={{ flex: 1 }}>
      <LeagueChipBar
        leagues={RUGBY_LEAGUES}
        selected={selectedLeague}
        onSelect={setSelectedLeague}
      />
      <ScoreboardList ... />
    </View>
  );
}
```

---

## Adding Status Text for a New Sport

`getStatusText()` in [src/utils/statusHelpers.ts](../src/utils/statusHelpers.ts) has a `switch(sport)` block. Add a case for the new sport:

```ts
case 'rugby':
  if (gameStatus === 'live') return `${period}H ${displayClock}`;  // e.g. "1H 15:30"
  break;
```

Add a `getPeriodLabel()` case for line scores:

```ts
case 'rugby':
  return period === 1 ? '1H' : period === 2 ? '2H' : `ET${period - 2}`;
```

---

## Updating Poll Intervals

In [src/constants/config.ts](../src/constants/config.ts):

```ts
export const POLL_INTERVAL_MS = 45_000;   // scoreboard tabs
```

In [src/hooks/useGameSummary.ts](../src/hooks/useGameSummary.ts):

```ts
const LIVE_INTERVAL = 20_000;   // game detail when live
const IDLE_INTERVAL = 120_000;  // game detail when final / scheduled
```

---

## Changing the Colour Theme

All colours are in [src/constants/colors.ts](../src/constants/colors.ts). The file exports a single `Colors` object — change values there and every component picks them up automatically. Key semantic colours:

| Key                | Usage                                     |
|--------------------|-------------------------------------------|
| `background`       | Root screen background                    |
| `surface`          | Card backgrounds                          |
| `surfaceElevated`  | Elevated cards (stats, plays)             |
| `live`             | Live badge, accent stripe, pulse dot      |
| `halftime`         | Halftime badge, accent stripe             |
| `scheduled`        | Upcoming badge, accent stripe             |
| `final`            | Finished badge, accent stripe             |
| `winner`           | Winning team name                         |
| `winnerScore`      | Winning team score                        |
| `accent`           | Selected chip, links, active states       |

---

## Environment & Config

There are no secret API keys — ESPN's API is public. The base URL and timeout are in [src/constants/config.ts](../src/constants/config.ts) and [src/api/espn.ts](../src/api/espn.ts).

If ESPN changes their API structure, update the raw types in [src/api/types.ts](../src/api/types.ts) and the transform logic in [src/utils/transformers.ts](../src/utils/transformers.ts) and [src/hooks/useGameSummary.ts](../src/hooks/useGameSummary.ts).

---

## Common Issues

### Metro bundler shows stale errors after code changes
Clear the Metro cache:
```bash
npx expo start --clear
```

### `npm install` fails with peer dependency errors
Always use the legacy flag with this project:
```bash
npm install --legacy-peer-deps
```

### Tests fail with `Cannot find module '@expo/vector-icons'`
The mock is at [src/__mocks__/@expo/vector-icons.tsx](../src/__mocks__/@expo/vector-icons.tsx). Ensure `moduleNameMapper` in `package.json` maps `@expo/vector-icons` to this stub.

### Expo Go says "SDK version mismatch"
This project targets **SDK 54**. Install the matching Expo Go version from the App Store / Google Play, or use `npx expo start --tunnel` and select "Development build" if using SDK 55+.

### A sport tab shows "Not Available" (empty state)
ESPN may have no active season for that sport/league. This is a `not_found` (HTTP 404) response, shown as an empty state rather than an error. Try a different league from the chip bar, or check back when the season is active.
