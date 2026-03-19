// ── Raw ESPN API types ──────────────────────────────────────────────────────

export interface EspnScoreboardResponse {
  events: EspnEvent[];
}

export interface EspnEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions?: EspnCompetition[];
  status?: EspnStatus;
  // Tennis/individual-sport events nest competitions inside groupings
  groupings?: Array<{
    grouping: { id: string; slug: string; displayName: string };
    competitions: EspnCompetition[];
  }>;
}

export interface EspnCompetition {
  id: string;
  date?: string;
  venue?: { fullName: string };
  broadcasts?: Array<{ names: string[] }>;
  competitors: EspnCompetitor[];
  status: EspnStatus;
  situation?: {
    lastPlay?: { text: string };
    balls?: number;
    strikes?: number;
    outs?: number;
    onFirst?: boolean;
    onSecond?: boolean;
    onThird?: boolean;
  };
}

export interface EspnCompetitor {
  id: string;
  homeAway?: string;
  // Team sports use `team`; individual sports (tennis) use `athlete`
  team?: {
    id?: string;
    abbreviation?: string;
    displayName?: string;
    logo?: string;
    logos?: Array<{ href: string }>;
  };
  athlete?: {
    id?: string;
    displayName?: string;
    shortName?: string;
    fullName?: string;
    flag?: { href: string; alt?: string };
  };
  score?: string;
  winner?: boolean | string; // cricket returns "true"/"false" strings
  linescores?: Array<{ value: number }>;
  records?: Array<{ summary: string; type: string }>;
}

export interface EspnStatus {
  clock?: number;
  displayClock?: string;
  period?: number;
  type: {
    id: string;
    name: string;
    state: 'pre' | 'in' | 'post';
    completed: boolean;
    description: string;
    detail: string;
    shortDetail: string;
  };
}

// ── Normalized types (what components consume) ──────────────────────────────

export type GameStatus = 'scheduled' | 'live' | 'halftime' | 'final';

export interface TeamInfo {
  id: string;
  abbreviation: string;
  displayName: string;
  logo: string;
  score: string;
  winner: boolean;
  record?: string;
  linescores?: number[];
}

export interface GameData {
  id: string;
  sport: string;
  league: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  status: GameStatus;
  statusText: string;
  startTime: string;
  venue?: string;
  broadcasts: string[];
  situation?: string;
}

// ── ESPN Summary API types ───────────────────────────────────────────────────

export interface EspnSummaryResponse {
  header?: {
    competitions?: Array<{
      venue?: { fullName?: string };
      status?: EspnStatus;
      competitors?: Array<{
        homeAway?: string;
        team: { abbreviation: string; displayName: string; logo?: string; logos?: Array<{ href: string }> };
        score?: string;
        winner?: boolean;
        linescores?: Array<{ displayValue?: string; value?: number }>;
        records?: Array<{ summary: string; type: string }>;
      }>;
      broadcasts?: Array<{ names: string[] }>;
    }>;
  };
  boxscore?: {
    teams?: Array<{
      team: { abbreviation: string };
      statistics?: Array<{ name: string; displayValue: string; label?: string }>;
    }>;
    players?: Array<{
      team: { abbreviation: string };
      statistics?: Array<{
        name: string;   // e.g. "passing", "rushing"
        keys?: string[];
        labels?: string[];
        athletes?: Array<{
          athlete: { id: string; displayName: string; jersey?: string };
          stats: string[];
        }>;
      }>;
    }>;
  };
  plays?: Array<{
    id?: string;
    text?: string;
    type?: { text?: string };
    clock?: { displayValue?: string };
    scoreValue?: number;
    team?: { abbreviation?: string };
  }>;
}

export interface StatLine {
  label: string;
  value: string;
}

/** A single stat column for one player (e.g. "YDS: 312") */
export interface PlayerStatColumn {
  label: string;
  value: string;
}

/** One player's row — name + up to 4 key stats */
export interface PlayerLine {
  id: string;
  name: string;
  jersey?: string;
  teamAbbrev: string;
  category: string;   // "Passing", "Rushing", "Receiving", etc.
  stats: PlayerStatColumn[];
}

export interface Play {
  id: string;
  text: string;
  clock?: string;
  team?: string;
  isScore: boolean;
}
