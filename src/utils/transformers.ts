import type { EspnScoreboardResponse, EspnCompetitor, GameData, TeamInfo } from '@/api/types';
import { getGameStatus, getStatusText } from './statusHelpers';
import { formatGameTime } from './dateHelpers';

function getTeamLogo(competitor: EspnCompetitor): string {
  if (competitor.team.logo) return competitor.team.logo;
  if (competitor.team.logos && competitor.team.logos.length > 0) {
    return competitor.team.logos[0].href;
  }
  return '';
}

function getRecord(competitor: EspnCompetitor): string | undefined {
  if (!competitor.records) return undefined;
  const overall = competitor.records.find(r => r.type === 'total' || r.type === 'overall');
  return overall?.summary;
}

function getLinescores(competitor: EspnCompetitor): number[] | undefined {
  if (!competitor.linescores) return undefined;
  return competitor.linescores.map(l => l.value);
}

function buildTeam(competitor: EspnCompetitor): TeamInfo {
  return {
    id: competitor.team.id,
    abbreviation: competitor.team.abbreviation,
    displayName: competitor.team.displayName,
    logo: getTeamLogo(competitor),
    score: competitor.score ?? '0',
    winner: competitor.winner ?? false,
    record: getRecord(competitor),
    linescores: getLinescores(competitor),
  };
}

export function transformScoreboard(
  raw: EspnScoreboardResponse,
  sport: string,
  league: string,
): GameData[] {
  const events = raw.events ?? [];

  return events.map(event => {
    const competition = event.competitions[0];
    const status = competition.status ?? event.status;

    const home = competition.competitors.find(c => c.homeAway === 'home')!;
    const away = competition.competitors.find(c => c.homeAway === 'away')!;

    const broadcasts: string[] = [];
    competition.broadcasts?.forEach(b => broadcasts.push(...b.names));

    // Situation text (baseball base/out state, etc.)
    let situation: string | undefined;
    if (competition.situation?.lastPlay?.text) {
      situation = competition.situation.lastPlay.text;
    }

    const gameStatus = getGameStatus(status);
    let statusText = getStatusText(status, sport);

    // For scheduled games, use human-readable time
    if (gameStatus === 'scheduled') {
      statusText = formatGameTime(event.date);
    }

    return {
      id: event.id,
      sport,
      league,
      homeTeam: buildTeam(home),
      awayTeam: buildTeam(away),
      status: gameStatus,
      statusText,
      startTime: event.date,
      venue: competition.venue?.fullName,
      broadcasts,
      situation,
    };
  });
}

// Sort games: live first, then by start time (scheduled), then final
export function sortGames(games: GameData[]): GameData[] {
  const order: Record<string, number> = { live: 0, halftime: 1, scheduled: 2, final: 3 };
  return [...games].sort((a, b) => {
    const statusDiff = (order[a.status] ?? 4) - (order[b.status] ?? 4);
    if (statusDiff !== 0) return statusDiff;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });
}

// Group games into sections for SectionList
export interface GameSection {
  title: string;
  data: GameData[];
}

export function groupGamesIntoSections(games: GameData[]): GameSection[] {
  const live = games.filter(g => g.status === 'live' || g.status === 'halftime');
  const scheduled = games.filter(g => g.status === 'scheduled');
  const final = games.filter(g => g.status === 'final');

  const sections: GameSection[] = [];
  if (live.length > 0) sections.push({ title: 'IN PROGRESS', data: live });
  if (scheduled.length > 0) sections.push({ title: 'UPCOMING', data: scheduled });
  if (final.length > 0) sections.push({ title: 'FINAL', data: final });
  return sections;
}
