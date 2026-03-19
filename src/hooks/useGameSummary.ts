import { useQuery } from '@tanstack/react-query';
import { fetchGameSummary } from '@/api/espn';
import { classifyError } from '@/api/errors';
import { getGameStatus, getStatusText } from '@/utils/statusHelpers';
import { formatGameTime } from '@/utils/dateHelpers';
import type { AppError } from '@/api/errors';
import type { GameStatus, Play, PlayerLine, StatLine, TeamInfo } from '@/api/types';

// Re-poll every 20s for live games, otherwise every 2 minutes
const LIVE_INTERVAL = 20_000;
const IDLE_INTERVAL = 120_000;

type SummaryCompetitor = NonNullable<
  NonNullable<NonNullable<import('@/api/types').EspnSummaryResponse['header']>['competitions']>[0]['competitors']
>[0];

function buildTeamFromSummary(competitor: SummaryCompetitor): TeamInfo {
  const team = competitor.team ?? {};
  const logo = (team as { logo?: string }).logo
    ?? (team as { logos?: Array<{ href: string }> }).logos?.[0]?.href
    ?? '';
  const abbreviation = (team as { abbreviation?: string }).abbreviation ?? '?';
  const displayName = (team as { displayName?: string }).displayName ?? abbreviation;
  const record = competitor.records?.find(r => r.type === 'total' || r.type === 'overall')?.summary;
  return {
    id: abbreviation,
    abbreviation,
    displayName,
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
  playerLines: PlayerLine[];  // top players from both teams, grouped by category
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
      competition.broadcasts?.forEach(b => { if (b.names) broadcasts.push(...b.names); });

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

      // Player lines — top performer per category per team
      const CATEGORY_LABELS: Record<string, string> = {
        passing: 'Passing', rushing: 'Rushing', receiving: 'Receiving',
        defensive: 'Defense', kicking: 'Kicking', punting: 'Punting',
        goalkeeping: 'GK', batting: 'Batting', bowling: 'Bowling',
        scoring: 'Scoring', rebounds: 'Rebounds', assists: 'Assists',
      };
      const MAX_STAT_COLS = 4;
      const playerLines: PlayerLine[] = [];

      (raw.boxscore?.players ?? []).forEach(teamPlayers => {
        const abbrev = teamPlayers.team.abbreviation;
        (teamPlayers.statistics ?? []).forEach(catGroup => {
          if (!catGroup.name) return; // skip groups with no name
          const categoryLabel = CATEGORY_LABELS[catGroup.name] ?? catGroup.name;
          if (!categoryLabel) return;
          const labels = catGroup.labels ?? [];
          // Take top 2 athletes per category (sorted by first stat descending)
          const athletes = [...(catGroup.athletes ?? [])]
            .sort((a, b) => parseFloat(b.stats[0] ?? '0') - parseFloat(a.stats[0] ?? '0'))
            .slice(0, 2);
          athletes.forEach(a => {
            const statCols = labels
              .slice(0, MAX_STAT_COLS)
              .map((lbl, i) => ({ label: lbl, value: a.stats[i] ?? '-' }))
              .filter(s => s.value !== '0' && s.value !== '-');
            if (statCols.length === 0) return;
            playerLines.push({
              id: a.athlete.id,
              name: a.athlete.displayName,
              jersey: a.athlete.jersey,
              teamAbbrev: abbrev,
              category: categoryLabel,
              stats: statCols,
            });
          });
        });
      });

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
        playerLines,
      };
    },
    // Poll fast for live/halftime games, slower otherwise
    refetchInterval: LIVE_INTERVAL,
    refetchIntervalInBackground: false,
    staleTime: 15_000,
    retry: (failureCount, error) => error.kind !== 'not_found' && failureCount < 2,
    throwOnError: false,
  });
}
