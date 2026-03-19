export interface SportConfig {
  id: string;
  label: string;
  sport: string;
  league: string;
  icon: string;                                           // icon name — focused (filled)
  iconOutline: string;                                    // icon name — unfocused (outline)
  iconFamily?: 'Ionicons' | 'MaterialCommunityIcons';     // defaults to Ionicons
  tabColor: string;                                       // active tint
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
  { id: 'nfl',     label: 'Football',   sport: 'football',   league: 'nfl',         icon: 'american-football',      iconOutline: 'american-football-outline', tabColor: '#E03A3E' },
  { id: 'nba',     label: 'Basketball', sport: 'basketball', league: 'nba',         icon: 'basketball',             iconOutline: 'basketball-outline',        tabColor: '#F87131' },
  { id: 'mlb',     label: 'Baseball',   sport: 'baseball',   league: 'mlb',         icon: 'baseball',               iconOutline: 'baseball-outline',          tabColor: '#C8102E' },
  { id: 'nhl',     label: 'Hockey',     sport: 'hockey',     league: 'nhl',         icon: 'hockey-puck',            iconOutline: 'hockey-puck',               tabColor: '#0085CA', iconFamily: 'MaterialCommunityIcons' },
  { id: 'soccer',  label: 'Soccer',     sport: 'soccer',     league: 'usa.1',       icon: 'football',               iconOutline: 'football-outline',          tabColor: '#00A651' },
  { id: 'tennis',  label: 'Tennis',     sport: 'tennis',     league: 'atp',         icon: 'tennisball',             iconOutline: 'tennisball-outline',        tabColor: '#C9F02A' },
  { id: 'cricket', label: 'Cricket',    sport: 'cricket',    league: 'icc.cricket', icon: 'cricket',                iconOutline: 'cricket',                   tabColor: '#00B4D8', iconFamily: 'MaterialCommunityIcons' },
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
