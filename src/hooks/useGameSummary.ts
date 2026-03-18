import { useQuery } from '@tanstack/react-query';
import { fetchGameSummary } from '@/api/espn';
import { classifyError } from '@/api/errors';
import { getGameStatus, getStatusText } from '@/utils/statusHelpers';
import { formatGameTime } from '@/utils/dateHelpers';
import type { AppError } from '@/api/errors';
import type { GameStatus, Play, StatLine, TeamInfo } from '@/api/types';

// Re-poll every 20s for live games, otherwise every 2 minutes
const LIVE_INTERVAL = 20_000;
const IDLE_INTERVAL = 120_000;

function buildTeamFromSummary(competitor: NonNullable<NonNullable<NonNullable<ReturnType<typeof Object.create>>['header']>['competitions']>[0]['competitors'][0]): TeamInfo {
  const logo = competitor.team.logo
    ?? competitor.team.logos?.[0]?.href
    ?? '';
  const record = competitor.records?.find(r => r.type === 'total' || r.type === 'overall')?.summary;
  return {
    id: competitor.team.abbreviation,
    abbreviation: competitor.team.abbreviation,
    displayName: competitor.team.displayName,
    logo,
    score: competitor.score ?? '0',
    winner: competitor.winner ?? false,
    record,
    linescores: competitor.linescores?.map(l => {
      const v = l.value ?? Number(l.displayValue ?? '0');
      return isNaN(v) ? 0 : v;
    }),
  };
}

export interface GameSummaryData {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  status: GameStatus;
  statusText: string;
  venue?: string;
  broadcasts: string[];
  homeStats: StatLine[];
  awayStats: StatLine[];
  recentPlays: Play[];
}

export function useGameSummary(
  sport: string,
  league: string,
  eventId: string,
) {
  return useQuery<GameSummaryData, AppError>({
    queryKey: ['game-summary', sport, league, eventId],
    queryFn: async () => {
      const raw = await fetchGameSummary(sport, league, eventId);

      const competition = raw.header?.competitions?.[0];
      if (!competition) throw classifyError({ response: { status: 404 } });

      const rawStatus = competition.status;
      const gameStatus: GameStatus = rawStatus ? getGameStatus(rawStatus) : 'scheduled';
      let statusText = rawStatus ? getStatusText(rawStatus, sport) : '';
      if (gameStatus === 'scheduled' && rawStatus) {
        // type.detail is often "7:30 PM ET" (not ISO) — only call formatGameTime on real ISO dates
        const detail = rawStatus.type.detail;
        const parsed = new Date(detail);
        statusText = !isNaN(parsed.getTime()) ? formatGameTime(detail) : detail;
      }

      const home = competition.competitors?.find(c => c.homeAway === 'home');
      const away = competition.competitors?.find(c => c.homeAway === 'away');
      if (!home || !away) throw classifyError({ response: { status: 404 } });

      const broadcasts: string[] = [];
      competition.broadcasts?.forEach(b => broadcasts.push(...b.names));

      // Box score stats — key sport-relevant stats only
      const STAT_KEYS = ['passingYards', 'rushingYards', 'receivingYards', 'totalYards',
        'points', 'fieldGoalsMade', 'threePointersMade', 'rebounds', 'assists',
        'hits', 'runs', 'errors', 'saves', 'shots', 'fouls'];

      function extractStats(abbrev: string): StatLine[] {
        const team = raw.boxscore?.teams?.find(t => t.team.abbreviation === abbrev);
        if (!team?.statistics) return [];
        return team.statistics
          .filter(s => STAT_KEYS.includes(s.name) || s.label)
          .slice(0, 8)
          .map(s => ({ label: s.label ?? s.name, value: s.displayValue }));
      }

      // Recent plays — last 8, most recent first
      const recentPlays: Play[] = (raw.plays ?? [])
        .slice(-8)
        .reverse()
        .map((p, i) => ({
          id: p.id ?? String(i),
          text: p.text ?? '',
          clock: p.clock?.displayValue,
          team: p.team?.abbreviation,
          isScore: (p.scoreValue ?? 0) > 0,
        }))
        .filter(p => p.text.trim().length > 0);

      return {
        homeTeam: buildTeamFromSummary(home),
        awayTeam: buildTeamFromSummary(away),
        status: gameStatus,
        statusText,
        venue: competition.venue?.fullName,
        broadcasts,
        homeStats: extractStats(home.team.abbreviation),
        awayStats: extractStats(away.team.abbreviation),
        recentPlays,
      };
    },
    // Poll fast for live games, slower otherwise — derived from cached data
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'live' || status === 'halftime' ? LIVE_INTERVAL : IDLE_INTERVAL;
    },
    refetchIntervalInBackground: false,
    staleTime: 15_000,
    retry: (failureCount, error) => error.kind !== 'not_found' && failureCount < 2,
    throwOnError: false,
  });
}
