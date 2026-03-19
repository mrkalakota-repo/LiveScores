# LiveScores — Design Document

## 1. Purpose

LiveScores is a cross-platform (iOS, Android, Web) sports scoreboard app. It polls ESPN's public API to display live, upcoming, and final game scores across seven sports. The design prioritises real-time freshness, graceful degradation on errors, and a consistent dark-mode sports aesthetic.

---

## 2. Goals & Non-Goals

### Goals
- Show live scores with automatic background polling (45 s scoreboards, 20 s game detail)
- Support 7 sports (NFL, NBA, MLB, NHL, Soccer, Tennis, Cricket) with per-sport sub-leagues
- Navigate from a score card to a full game detail screen with line scores, team stats, and play-by-play
- Run on iOS, Android, and Web from a single codebase
- Fail gracefully with informative, kind-specific error messages

### Non-Goals
- User accounts, favourites, or notifications
- Historical stats or standings
- Paid/authenticated ESPN APIs

---

## 3. System Architecture

### Layers

```
┌────────────────────────────────────────────────┐
│                   UI Layer                      │
│  app/(tabs)/*.tsx  ·  app/game/[id].tsx         │
│  components/       ·  contexts/                 │
├────────────────────────────────────────────────┤
│                  Hook Layer                     │
│  useScoreboard  ·  useGameSummary               │
│  useRefreshOnFocus                              │
├────────────────────────────────────────────────┤
│              Data / Cache Layer                 │
│  TanStack Query (QueryClient)                   │
├────────────────────────────────────────────────┤
│                   API Layer                     │
│  espn.ts  ·  errors.ts  ·  types.ts            │
├────────────────────────────────────────────────┤
│              Transport Layer                    │
│  Axios (10 s timeout · base URL)               │
└────────────────────────────────────────────────┘
```

Raw ESPN data never escapes the API layer. All consumers use the normalised `GameData` / `GameSummaryData` types defined in `src/api/types.ts`.

---

## 4. Data Model

### Core Types

```
GameData
  id           string          — ESPN event ID
  sport        string          — espn sport slug (football, basketball …)
  league       string          — espn league slug (nfl, nba, usa.1 …)
  homeTeam     TeamInfo
  awayTeam     TeamInfo
  status       GameStatus      — 'live' | 'halftime' | 'final' | 'scheduled'
  statusText   string          — human-readable e.g. "Q3 8:42", "Final"
  startTime    string          — ISO-8601
  venue?       string
  broadcasts   string[]
  situation?   string          — baseball base state / cricket over

TeamInfo
  id           string
  abbreviation string
  displayName  string
  logo         string          — URL (may be empty)
  score        string
  winner       boolean
  record?      string          — e.g. "12-5"
  linescores?  string[]        — per-period scores

GameStatus = 'live' | 'halftime' | 'final' | 'scheduled'
```

### Summary Types (game detail only)

```
GameSummaryData
  homeTeam / awayTeam  TeamInfo
  status / statusText
  venue / broadcasts
  homeStats / awayStats  StatLine[]   — up to 8 key stats per team
  recentPlays            Play[]       — last 8 plays, most-recent first

StatLine   { label: string; value: string }
Play       { id; text; clock?; team?; isScore: boolean }
```

---

## 5. Error Handling Strategy

ESPN API failures are classified into five kinds so the UI can render the most helpful message:

| Kind        | Trigger                          | UI Message                |
|-------------|----------------------------------|---------------------------|
| `network`   | No response, request sent        | "No Internet Connection"  |
| `timeout`   | `ECONNABORTED` / > 10 s          | "Request Timed Out"       |
| `not_found` | HTTP 404                         | "Not Available" (empty state, no retry) |
| `server`    | HTTP 5xx                         | "Service Unavailable"     |
| `unknown`   | Other HTTP / unexpected          | "Something Went Wrong"    |

`not_found` disables automatic retry (`retry: false`) to avoid hammering dead ESPN endpoints (e.g. tennis has no active season).

---

## 6. Polling Strategy

| Context              | Interval | Reason                                    |
|----------------------|----------|-------------------------------------------|
| Scoreboard tabs      | 45 s     | Balances freshness vs. battery/data usage |
| Game detail — live   | 20 s     | Fast enough for live score updates        |
| Game detail — other  | 120 s    | Finished/scheduled games rarely change    |

`refetchIntervalInBackground: false` pauses polling when the app is backgrounded. On native, an `AppState` listener calls `focusManager.setFocused(true)` to trigger an immediate refetch on foreground resume. On web, `visibilitychange` handles this automatically via the TanStack Query browser adapter.

Live-vs-idle polling in `useGameSummary` is derived from cached data (`query.state.data?.status`) so no `isLive` parameter needs to be passed from the UI, eliminating a stale-reference bug class.

---

## 7. Security Design

All user-controlled values that flow into ESPN API URLs are validated before the HTTP call:

| Field    | Validation                  | Example attack blocked             |
|----------|-----------------------------|------------------------------------|
| `sport`  | Allowlist Set (7 values)    | `../../etc/passwd` as sport        |
| `league` | Regex `^[\w.\-]+$`          | `usa.1;rm -rf /` as league         |
| `eventId`| Regex `^\d+$`              | `12345&other=val` as event ID      |

Invalid inputs throw synchronously before any HTTP request, surfacing as `AppError('unknown')`.

---

## 8. Performance Design

### Component Memoization
All leaf components (`GameCard`, `TeamRow`, `StatusBadge`, `LeagueChipBar`, `LineScores`, `GameDetailHeader`) are wrapped in `React.memo`. Callbacks passed down are `useCallback`-memoized to prevent unnecessary re-renders during polling intervals.

### List Virtualisation
`ScoreboardList` uses `SectionList` (backed by `VirtualizedList`) with `removeClippedSubviews={true}` on Android. `renderItem` is `useCallback`-memoized so the reference is stable across re-renders.

### Query Caching
- `staleTime: 30_000` on scoreboards — re-navigation within 30 s reuses cached data without a network call
- `gcTime: 300_000` (5 min) — cache entries persist for 5 minutes after all observers unmount (tab switches)

### Animation Budget
All animations (live pulse dot, loading skeleton, live badge) use the native driver (`useNativeDriver: true`) where possible to keep animations on the UI thread.

---

## 9. Cross-Platform Compatibility

| Feature             | Native (iOS/Android)                | Web                          |
|---------------------|-------------------------------------|------------------------------|
| Pull-to-refresh     | `RefreshControl` on `ScrollView`    | Omitted (no equivalent)      |
| Background refetch  | `AppState` listener + focusManager  | `visibilitychange` (auto)    |
| Animations          | Native driver                       | JS-driven (expo-web fallback)|
| Navigation          | Native stack                        | Web history API (expo-router)|

Platform guards use `Platform.OS !== 'web'` (not `Platform.OS === 'ios'`) so Android and iOS share the same native code path.

---

## 10. Component Design

### GameCard
Single responsibility: render one game as a pressable card. Navigation params (`id`, `sport`, `league`) are passed directly so the detail screen does not need to re-derive them from the game list.

Left accent stripe colour encodes status at a glance:
- Red → live
- Orange → halftime
- Blue → scheduled
- Grey → final

### ScoreboardList
Thin orchestration component. Handles all loading/error/empty states so individual sport screens stay free of conditional rendering logic. Uses `SectionList` so games are automatically grouped into "IN PROGRESS / UPCOMING / FINAL" sections without prop-drilling section data.

### LiveGamesContext
Chosen over prop-drilling or a global state library (Redux/Zustand) because:
- Only one piece of state: `Record<sportId, liveCount>`
- Consumers are only the tab bar icons (unfocused dots) and the sport screens (writers)
- Lifetime matches the app root — no teardown needed

### LeagueChipBar
Generic `leagues: LeagueConfig[]` prop (not soccer-specific) so Cricket could reuse the same component. Horizontal `ScrollView` with `showsHorizontalScrollIndicator={false}` keeps the UI clean on narrow phones.

---

## 11. Navigation Design

Expo Router file-based routing mirrors the URL structure:

```
/                   → redirect to /(tabs)/nfl
/(tabs)/nfl         → NFL scoreboard
/(tabs)/soccer      → Soccer scoreboard + league chip bar
/(tabs)/cricket     → Cricket scoreboard + league chip bar
/game/[id]          → Game detail (id + sport + league as route params)
```

Params (`sport`, `league`) are passed via `router.push({ pathname, params })` so the detail screen can fetch the correct ESPN endpoint without a secondary lookup. The back button uses `router.canGoBack()` with a fallback `router.replace('/')` for deep-link entry.

---

## 12. Testing Strategy

| Layer        | Coverage Target | Approach                                   |
|--------------|-----------------|--------------------------------------------|
| API layer    | Full            | Jest + axios mock; validates all error kinds and input guards |
| Utilities    | Full            | Pure functions; full branch coverage       |
| Hooks        | Core paths      | `renderHook` with mocked query client      |
| Components   | Render + interactions | `@testing-library/react-native`; no snapshot tests |
| Integration  | Not covered     | Out of scope (no real ESPN calls in CI)    |

Snapshot tests are deliberately avoided — they break on cosmetic changes and add maintenance noise without catching logic regressions.
