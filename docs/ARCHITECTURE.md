# LiveScores — Architecture & Flow Diagrams

## 1. Repository Structure

```
LiveScores/
├── app/                        # Expo Router file-based routes
│   ├── _layout.tsx             # Root: QueryClientProvider + LiveGamesProvider
│   ├── index.tsx               # Redirect → /(tabs)/nfl
│   └── (tabs)/
│       ├── _layout.tsx         # Tab bar with LiveTabIcon pulse dots
│       ├── nfl.tsx             # NFL scoreboard screen
│       ├── nba.tsx
│       ├── mlb.tsx
│       ├── nhl.tsx
│       ├── tennis.tsx
│       ├── soccer.tsx          # + LeagueChipBar
│       └── cricket.tsx         # + LeagueChipBar
│   └── game/
│       └── [id].tsx            # Game detail screen
│
├── src/
│   ├── api/
│   │   ├── types.ts            # Raw ESPN types + normalised GameData types
│   │   ├── errors.ts           # AppError class + classifyError()
│   │   └── espn.ts             # Axios client + fetchScoreboard/fetchGameSummary
│   │
│   ├── constants/
│   │   ├── sports.ts           # SPORTS[], SOCCER_LEAGUES[], CRICKET_LEAGUES[]
│   │   ├── config.ts           # Base URL, poll intervals
│   │   └── colors.ts           # Dark theme colour palette
│   │
│   ├── contexts/
│   │   └── LiveGamesContext.tsx # Live game count per sport tab
│   │
│   ├── hooks/
│   │   ├── useScoreboard.ts    # TanStack Query hook for scoreboard polling
│   │   ├── useGameSummary.ts   # TanStack Query hook for game detail polling
│   │   └── useRefreshOnFocus.ts # Re-fetch on tab focus (skip first mount)
│   │
│   ├── utils/
│   │   ├── transformers.ts     # ESPN JSON → GameData[], sortGames, groupGamesIntoSections
│   │   ├── statusHelpers.ts    # getGameStatus, getStatusText, getPeriodLabel
│   │   └── dateHelpers.ts      # formatGameTime, formatLastUpdated
│   │
│   └── components/
│       ├── GameCard.tsx         # Pressable score card (navigates to detail)
│       ├── ScoreboardList.tsx   # SectionList with loading/error/empty states
│       ├── TeamRow.tsx          # Team logo + name + score row
│       ├── StatusBadge.tsx      # Live/halftime/final/scheduled pill
│       ├── ErrorScreen.tsx      # Kind-specific error display + retry
│       ├── EmptyState.tsx       # No games today
│       ├── LoadingScreen.tsx    # Skeleton card animation
│       ├── LastUpdatedBar.tsx   # "Updated Xs ago" ticker
│       ├── LeagueChipBar.tsx    # Horizontal scrollable league selector
│       ├── LineScores.tsx       # Period-by-period score table
│       └── GameDetailHeader.tsx # Large score display for detail screen
│
├── docs/
│   ├── DESIGN.md               # Design decisions and system design
│   ├── ARCHITECTURE.md         # This file
│   └── USAGE_GUIDE.md          # Developer usage guide
│
├── scripts/
│   └── generate-icons.js       # Sharp-based SVG → PNG icon generator
│
└── src/__tests__/
    ├── api/                    # errors.test.ts, espn.test.ts
    ├── components/             # GameCard, StatusBadge, TeamRow, ErrorScreen, EmptyState, …
    └── utils/                  # transformers, statusHelpers, dateHelpers
```

---

## 2. Data Flow — Scoreboard (Tab Screen)

```
  ┌─────────────┐
  │  Sport Tab  │   e.g. app/(tabs)/nfl.tsx
  └──────┬──────┘
         │ calls
         ▼
  ┌────────────────────┐
  │   useScoreboard    │   src/hooks/useScoreboard.ts
  │   (sport, league)  │
  └──────┬─────────────┘
         │ queryFn (every 45 s)
         ▼
  ┌─────────────────────────────────────────────┐
  │           fetchScoreboard(sport, league)     │   src/api/espn.ts
  │                                             │
  │  1. Validate sport ∈ VALID_SPORTS Set       │
  │  2. Validate league matches /^[\w.\-]+$/    │
  │  3. GET /sport/league/scoreboard            │
  │  4. On error → classifyError() → AppError  │
  └──────────────────────┬──────────────────────┘
                         │ EspnScoreboardResponse (raw)
                         ▼
  ┌──────────────────────────────────────────────┐
  │   transformScoreboard(raw, sport, league)    │   src/utils/transformers.ts
  │                                              │
  │  • Map each event → GameData                │
  │  • getGameStatus() → 'live'|'halftime'|…    │
  │  • getStatusText() → "Q3 8:42" / "Final"    │
  │  • formatGameTime() for scheduled           │
  │  • Extract linescores, record, situation     │
  └──────────────────────┬───────────────────────┘
                         │ GameData[]
                         ▼
  ┌──────────────────────────────────────────────┐
  │           TanStack Query Cache               │
  │   key: ['scoreboard', sport, league]        │
  └──────────────────────┬───────────────────────┘
                         │
         ┌───────────────┼──────────────────┐
         ▼               ▼                  ▼
  ┌────────────┐  ┌─────────────┐  ┌────────────────┐
  │ isLoading  │  │   isError   │  │  data: GameData[]│
  │            │  │ error: AppError│ │                │
  └─────┬──────┘  └──────┬──────┘  └───────┬────────┘
        │                │                  │
        ▼                ▼                  ▼
  LoadingScreen    ErrorScreen        ScoreboardList
  (skeleton cards) (kind-specific)    (SectionList)
                                           │
                                    ┌──────┴──────┐
                                    │  GameCard   │ × N
                                    │  (Pressable)│
                                    └──────┬──────┘
                                           │ onPress
                                           ▼
                               router.push('/game/[id]',
                                 { id, sport, league })
```

---

## 3. Data Flow — Game Detail Screen

```
  ┌──────────────────────────────────────┐
  │       app/game/[id].tsx              │
  │  params: { id, sport, league }       │
  └────────────────┬─────────────────────┘
                   │ calls
                   ▼
  ┌──────────────────────────────────────────────────┐
  │           useGameSummary(sport, league, id)      │
  │                                                  │
  │  refetchInterval derived from cached status:     │
  │    live/halftime → 20 s                          │
  │    final/scheduled → 120 s                       │
  └──────────────────┬───────────────────────────────┘
                     │ queryFn
                     ▼
  ┌────────────────────────────────────────────────────┐
  │   fetchGameSummary(sport, league, eventId)         │
  │                                                    │
  │  Validates: sport, league, eventId (/^\d+$/)       │
  │  GET /sport/league/summary?event=eventId           │
  └───────────────────────┬────────────────────────────┘
                          │ EspnSummaryResponse (raw)
                          ▼
  ┌────────────────────────────────────────────────────┐
  │            Transform inside queryFn                │
  │                                                    │
  │  • buildTeamFromSummary() → TeamInfo               │
  │  • getGameStatus() + getStatusText()               │
  │  • Extract boxscore stats (max 8 per team)         │
  │  • Extract recent plays (last 8, reversed)         │
  │  • Safe ISO date parse for statusText              │
  └───────────────────────┬────────────────────────────┘
                          │ GameSummaryData
                          ▼
  ┌────────────────────────────────────────────────────┐
  │                   Rendered UI                      │
  │                                                    │
  │  ┌─────────────────────────────┐                  │
  │  │     GameDetailHeader        │  big scores       │
  │  ├─────────────────────────────┤                  │
  │  │        LineScores           │  period table     │
  │  ├─────────────────────────────┤                  │
  │  │       Game Info Card        │  venue/broadcast  │
  │  ├─────────────────────────────┤                  │
  │  │     Team Stats Card         │  side-by-side     │
  │  ├─────────────────────────────┤                  │
  │  │     Recent Plays Card       │  last 8 plays     │
  │  └─────────────────────────────┘                  │
  └────────────────────────────────────────────────────┘
```

---

## 4. Live Game Indicator Flow

```
  Sport Tab Screen
  (e.g. nfl.tsx)
        │
        │ data: GameData[]
        │
        ▼
  useEffect: count live/halftime games
        │
        │ setLiveCount('nfl', count)
        │
        ▼
  LiveGamesContext
  { liveCounts: { nfl: 2, nba: 0, … } }
        │
        │ consumed by
        ▼
  app/(tabs)/_layout.tsx
  LiveTabIcon (per tab)
        │
        ├── focused tab → no dot
        └── unfocused tab + liveCounts[sportId] > 0
                  │
                  ▼
            Animated pulsing red dot
            (opacity 0.2 → 1, 550 ms loop)
```

---

## 5. Error Classification Flow

```
  Axios request fails
        │
        ▼
  classifyError(err)
        │
        ├── err instanceof AppError → pass through
        │
        ├── isAxiosError(err)
        │     ├── err.code === 'ECONNABORTED'
        │     │   OR err.message.includes('timeout') → AppError('timeout')
        │     │
        │     ├── !err.response AND err.request   → AppError('network')
        │     │
        │     └── err.response.status
        │           ├── 404        → AppError('not_found')
        │           ├── 500–599    → AppError('server')
        │           └── other      → AppError('unknown')
        │
        └── anything else          → AppError('unknown')
```

---

## 6. Polling & Refresh Strategy

```
  ┌─────────────────────────────────────────────────────────┐
  │                     Polling Timeline                    │
  │                                                         │
  │  App foreground                                         │
  │  ─────────────────────────────────────────────────────  │
  │                                                         │
  │  t=0s  ──── fetch ──── cache                           │
  │  t=45s ──── fetch ──── cache   (scoreboard tab)        │
  │  t=90s ──── fetch ──── cache                           │
  │                                                         │
  │  t=0s  ──── fetch ──── cache                           │
  │  t=20s ──── fetch ──── cache   (game detail, live)     │
  │  t=40s ──── fetch ──── cache                           │
  │                                                         │
  │  App backgrounded                                       │
  │  ─────────────────────────────────────────────────────  │
  │  polling PAUSED (refetchIntervalInBackground: false)    │
  │                                                         │
  │  App foregrounded                                       │
  │  ─────────────────────────────────────────────────────  │
  │  AppState 'active' → focusManager.setFocused(true)     │
  │  → immediate refetch → resume polling                   │
  │                                                         │
  │  Tab focus (returning from game detail)                 │
  │  ─────────────────────────────────────────────────────  │
  │  useRefreshOnFocus → refetch() (skips first mount)      │
  └─────────────────────────────────────────────────────────┘
```

---

## 7. Navigation Graph

```
                    app/index.tsx
                         │
                         │ router.replace('/(tabs)/nfl')
                         ▼
         ┌───────────────────────────────────────┐
         │           Tab Navigator               │
         │                                       │
         │  [NFL] [NBA] [MLB] [NHL] [SOC] [TEN] [CKT]
         │    │                       │           │
         │    │                       │ LeagueChipBar
         │    │                  soccer.tsx    cricket.tsx
         │    │
         │  nfl.tsx → ScoreboardList → GameCard (×N)
         └───────────────────────────────┼───────┘
                                         │ router.push
                                         ▼
                              app/game/[id].tsx
                              params: id, sport, league
                                         │
                                         │ router.back()
                                         │ OR router.replace('/')
                                         ▼
                                   (previous tab)
```

---

## 8. Component Tree (Scoreboard Tab)

```
app/(tabs)/nfl.tsx
└── ScoreboardList
    ├── LoadingScreen          (isLoading)
    ├── ErrorScreen            (isError, non-404)
    ├── EmptyState             (no data / 404)
    └── SectionList            (data)
        ├── LastUpdatedBar     (header)
        ├── SectionHeader      ("IN PROGRESS" / "UPCOMING" / "FINAL")
        └── GameCard  (×N)
            ├── StatusBadge
            ├── TeamRow  (away)
            └── TeamRow  (home)
```

## 9. Component Tree (Game Detail)

```
app/game/[id].tsx
├── Custom NavBar (back + refresh)
└── ScrollView
    ├── GameDetailHeader
    │   ├── TeamColumn (logo + abbrev + score)  [away]
    │   ├── StatusBadge
    │   └── TeamColumn (logo + abbrev + score)  [home]
    ├── LineScores (if available)
    │   └── ScrollView (horizontal)
    │       ├── Header row  (Q1 Q2 Q3 Q4 T  or  P1 P2 P3 T …)
    │       ├── Away row
    │       └── Home row
    ├── Game Info Card  (venue, broadcasts)
    ├── Team Stats Card
    │   ├── StatRow  (×N)  label | away value | home value
    └── Recent Plays Card
        └── PlayRow  (×8)  team dot + text + clock + score marker
```
