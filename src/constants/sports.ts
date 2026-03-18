export interface SportConfig {
  id: string;
  label: string;
  sport: string;
  league: string;
  icon: string; // Ionicons name
}

/** Generic league selector entry — used by Soccer, Cricket, etc. */
export interface LeagueConfig {
  id: string;
  label: string;
  sport: string;
  league: string;
}

/** Backwards-compatible alias */
export type SoccerLeague = LeagueConfig;

export const SPORTS: SportConfig[] = [
  { id: 'nfl',     label: 'NFL',     sport: 'football',   league: 'nfl',           icon: 'american-football' },
  { id: 'nba',     label: 'NBA',     sport: 'basketball', league: 'nba',           icon: 'basketball' },
  { id: 'mlb',     label: 'MLB',     sport: 'baseball',   league: 'mlb',           icon: 'baseball' },
  { id: 'nhl',     label: 'NHL',     sport: 'hockey',     league: 'nhl',           icon: 'snow' },
  { id: 'soccer',  label: 'Soccer',  sport: 'soccer',     league: 'usa.1',         icon: 'football' },
  { id: 'tennis',  label: 'Tennis',  sport: 'tennis',     league: 'atp',           icon: 'tennisball' },
  { id: 'cricket', label: 'Cricket', sport: 'cricket',    league: 'icc.cricket',   icon: 'baseball-outline' },
];

export const SOCCER_LEAGUES: LeagueConfig[] = [
  { id: 'mls',        label: 'MLS',        sport: 'soccer', league: 'usa.1' },
  { id: 'epl',        label: 'EPL',        sport: 'soccer', league: 'eng.1' },
  { id: 'laliga',     label: 'La Liga',    sport: 'soccer', league: 'esp.1' },
  { id: 'ucl',        label: 'UCL',        sport: 'soccer', league: 'uefa.champions' },
  { id: 'bundesliga', label: 'Bundesliga', sport: 'soccer', league: 'ger.1' },
];

export const CRICKET_LEAGUES: LeagueConfig[] = [
  { id: 'icc',      label: 'ICC',      sport: 'cricket', league: 'icc.cricket' },
  { id: 'ipl',      label: 'IPL',      sport: 'cricket', league: 'ipl' },
  { id: 'big_bash', label: 'Big Bash', sport: 'cricket', league: 'aus.1' },
  { id: 't20_blast',label: 'T20 Blast',sport: 'cricket', league: 'eng.t20' },
  { id: 'cpl',      label: 'CPL',      sport: 'cricket', league: 'wi.1' },
];
