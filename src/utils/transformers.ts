import type { EspnScoreboardResponse, EspnEvent, EspnCompetition, EspnCompetitor, GameData, TeamInfo } from '@/api/types';
import { getGameStatus, getStatusText } from './statusHelpers';
import { formatGameTime } from './dateHelpers';

function getTeamLogo(competitor: EspnCompetitor): string {
  // Individual sport: use country flag from athlete
  if (competitor.athlete?.flag?.href) return competitor.athlete.flag.href;
  const team = competitor.team ?? {};
  if (team.logo) return team.logo;
  if (team.logos && team.logos.length > 0) return team.logos[0].href;
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
  // Individual sport (tennis): build from athlete field
  if (competitor.athlete) {
    const a = competitor.athlete;
    const displayName = a.fullName ?? a.displayName ?? '?';
    // shortName is ESPN's compact form e.g. "T. Schoolkate" — ideal for card display
    const abbreviation = a.shortName ?? displayName;
    return {
      id: a.id ?? competitor.id,
      abbreviation,
      displayName,
      logo: getTeamLogo(competitor),
      score: competitor.score ?? '0',
      winner: competitor.winner === true || competitor.winner === 'true',
      record: getRecord(competitor),
      linescores: getLinescores(competitor),
    };
  }
  // Team sport: build from team field
  const team = competitor.team ?? {};
  const abbreviation = team.abbreviation ?? '?';
  const displayName = team.displayName ?? abbreviation;
  return {
    id: team.id ?? abbreviation,
    abbreviation,
    displayName,
    logo: getTeamLogo(competitor),
    score: competitor.score ?? '0',
    winner: competitor.winner === true || competitor.winner === 'true',
    record: getRecord(competitor),
    linescores: getLinescores(competitor),
  };
}

/** Flatten all competitions for an event — handles both direct and groupings layouts. */
function getCompetitions(event: EspnEvent): EspnCompetition[] {
  if (event.competitions && event.competitions.length > 0) return event.competitions;
  // Tennis / individual sports nest competitions inside groupings
  if (event.groupings && event.groupings.length > 0) {
    return event.groupings.flatMap(g => g.competitions ?? []);
  }
  return [];
}

export function transformScoreboard(
  raw: EspnScoreboardResponse,
  sport: string,
  league: string,
): GameData[] {
  const events = raw.events ?? [];

  return events.flatMap(event => {
    const competitions = getCompetitions(event);
    return competitions.flatMap((competition): GameData[] => {
      const status = competition.status ?? event.status;
      if (!status) return [];

      const competitors = competition.competitors ?? [];
      if (competitors.length < 2) return [];
      const home = competitors.find(c => c.homeAway === 'home') ?? competitors[0];
      const away = competitors.find(c => c.homeAway === 'away')
        ?? competitors.find(c => c !== home)
        ?? competitors[1];
      if (!home || !away) return [];

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
        statusText = formatGameTime(competition.date ?? event.date);
      }

      return [{
        id: competition.id,
        sport,
        league,
        homeTeam: buildTeam(home),
        awayTeam: buildTeam(away),
        status: gameStatus,
        statusText,
        startTime: competition.date ?? event.date,
        venue: competition.venue?.fullName,
        broadcasts,
        situation,
      }];
    });
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
