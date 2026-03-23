import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchGameSummary } from '@/api/espn';
import { classifyError } from '@/api/errors';
import { getGameStatus, getStatusText } from '@/utils/statusHelpers';
import { formatGameTime } from '@/utils/dateHelpers';
import type { AppError } from '@/api/errors';
import type { GameData, GameStatus, Play, PlayerLine, StatLine, TeamInfo, CricketInningsData, CricketBatsman, CricketBowler } from '@/api/types';
import { computeWinProbability } from '@/utils/winProbability';
import type { WinProbability } from '@/utils/winProbability';

const LIVE_INTERVAL = 20_000;

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
    winner: competitor.winner === true || (competitor.winner as unknown) === 'true',
    record,
    linescores: competitor.linescores?.map(l => {
      const v = l.value ?? Number(l.displayValue ?? '0');
      return isNaN(v) ? 0 : v;
    }),
  };
}

/** Build a minimal GameSummaryData from cached scoreboard GameData (fallback for unsupported summary APIs). */
function buildSummaryFromGameData(game: GameData): GameSummaryData {
  return {
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
    status: game.status,
    statusText: game.statusText,
    venue: game.venue,
    broadcasts: game.broadcasts,
    homeStats: [],
    awayStats: [],
    recentPlays: [],
    playerLines: [],
    winProbability: null,
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
  playerLines: PlayerLine[];
  winProbability: WinProbability | null;
  cricketInnings?: CricketInningsData[];
}

// Box score stats — key sport-relevant stats only
const STAT_KEYS = ['passingYards', 'rushingYards', 'receivingYards', 'totalYards',
  'points', 'fieldGoalsMade', 'threePointersMade', 'rebounds', 'assists',
  'hits', 'runs', 'errors', 'saves', 'shots', 'fouls'];

const CATEGORY_LABELS: Record<string, string> = {
  passing: 'Passing', rushing: 'Rushing', receiving: 'Receiving',
  defensive: 'Defense', kicking: 'Kicking', punting: 'Punting',
  goalkeeping: 'GK', batting: 'Batting', bowling: 'Bowling',
  scoring: 'Scoring', rebounds: 'Rebounds', assists: 'Assists',
};

const MAX_STAT_COLS = 4;

function extractStats(raw: import('@/api/types').EspnSummaryResponse, abbrev: string): StatLine[] {
  const team = raw.boxscore?.teams?.find(t => t.team.abbreviation === abbrev);
  if (!team?.statistics) return [];
  return team.statistics
    .filter(s => STAT_KEYS.includes(s.name) || s.label)
    .slice(0, 8)
    .map(s => ({ label: s.label ?? s.name, value: s.displayValue }));
}

export function useGameSummary(
  sport: string,
  league: string,
  eventId: string,
) {
  const queryClient = useQueryClient();

  return useQuery<GameSummaryData, AppError>({
    queryKey: ['game-summary', sport, league, eventId],
    queryFn: async () => {
      try {
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

        const competitors = competition.competitors ?? [];
        const home = competitors.find(c => c.homeAway === 'home') ?? competitors[0];
        const away = competitors.find(c => c.homeAway === 'away')
          ?? competitors.find(c => c !== home)
          ?? competitors[1];
        if (!home || !away) throw classifyError({ response: { status: 404 } });

        const broadcasts: string[] = [];
        competition.broadcasts?.forEach(b => { if (b.names) broadcasts.push(...b.names); });

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

        const homeTeam = buildTeamFromSummary(home);
        const awayTeam = buildTeamFromSummary(away);
        const homeStats = extractStats(raw, homeTeam.abbreviation);
        const awayStats = extractStats(raw, awayTeam.abbreviation);

        // ── Cricket innings extraction ──────────────────────────────
        let cricketInnings: CricketInningsData[] | undefined;
        if (sport === 'cricket' && raw.rosters && raw.rosters.length > 0) {
          // Get linescores from header for over-by-over + summary stats
          const headerComps = competition.competitors ?? [];
          const inningsMap = new Map<string, CricketInningsData>();

          for (const hc of headerComps) {
            const abbrev = (hc.team as { abbreviation?: string }).abbreviation ?? '';
            for (const ls of hc.linescores ?? []) {
              const lsAny = ls as Record<string, unknown>;
              const statsObj = (lsAny.statistics ?? {}) as Record<string, unknown>;
              const cats = ((statsObj.categories ?? []) as Array<{ stats: Array<{ name: string; displayValue: string }> }>);
              const statMap: Record<string, string> = {};
              for (const cat of cats) {
                for (const s of cat.stats ?? []) {
                  statMap[s.name] = s.displayValue;
                }
              }

              const oversArr = (statsObj.overs ?? [[]]) as Array<Array<{ number: string; runs: string }>>;
              const recentOvers = (oversArr[0] ?? []).slice(-6).map(o => o.runs);

              const key = `${abbrev}-${lsAny.period}`;
              inningsMap.set(key, {
                teamAbbrev: abbrev,
                score: (lsAny.score as string) ?? `${statMap.runs ?? '0'}/${statMap.wickets ?? '0'}`,
                overs: statMap.overs ?? String(lsAny.overs ?? ''),
                runRate: statMap.runRate ?? '',
                extras: statMap.extras ?? '',
                batsmen: [],
                bowlers: [],
                recentOvers,
              });
            }
          }

          // Fill in batsmen and bowlers from rosters
          for (const roster of raw.rosters) {
            const rosterAbbrev = roster.team.abbreviation;
            for (const entry of roster.roster) {
              const name = entry.athlete.displayName;
              for (const ls of entry.linescores ?? []) {
                const statMap: Record<string, string> = {};
                for (const cat of ls.statistics?.categories ?? []) {
                  for (const s of cat.stats) {
                    statMap[s.name] = s.displayValue;
                  }
                }

                const runs = statMap.runs ?? '';
                const ballsFaced = statMap.ballsFaced ?? '';
                const overs = statMap.overs ?? '';
                const wickets = statMap.wickets ?? '';

                // Batting: this player batted for their own team
                if (ballsFaced && ballsFaced !== '0') {
                  const key = `${rosterAbbrev}-${ls.period}`;
                  const inn = inningsMap.get(key);
                  if (inn) {
                    inn.batsmen.push({
                      name,
                      runs,
                      balls: ballsFaced,
                      fours: statMap.fours ?? '0',
                      sixes: statMap.sixes ?? '0',
                      strikeRate: statMap.strikeRate ?? '',
                      dismissal: statMap.dismissal ?? statMap.dismissalCard ?? '',
                      isBatting: statMap.notouts === '1' || statMap.batted === '1',
                    });
                  }
                }

                // Bowling: this player bowled for the other team's innings
                if (overs && overs !== '0' && overs !== '0.0') {
                  // Find the opponent's innings
                  const opponentAbbrev = rosterAbbrev === homeTeam.abbreviation
                    ? awayTeam.abbreviation : homeTeam.abbreviation;
                  const key = `${opponentAbbrev}-${ls.period}`;
                  const inn = inningsMap.get(key);
                  if (inn) {
                    inn.bowlers.push({
                      name,
                      overs,
                      maidens: statMap.maidens ?? '0',
                      runs: statMap.conceded ?? '0',
                      wickets,
                      economy: statMap.economyRate ?? '',
                    });
                  }
                }
              }
            }
          }

          cricketInnings = [...inningsMap.values()].filter(
            inn => inn.batsmen.length > 0 || inn.bowlers.length > 0 || inn.score !== '0/0'
          );
          if (cricketInnings.length === 0) cricketInnings = undefined;
        }

        return {
          homeTeam,
          awayTeam,
          status: gameStatus,
          statusText,
          venue: competition.venue?.fullName,
          broadcasts,
          homeStats,
          awayStats,
          recentPlays,
          playerLines,
          winProbability: computeWinProbability({
            homeScore: homeTeam.score,
            awayScore: awayTeam.score,
            homeRecord: homeTeam.record,
            awayRecord: awayTeam.record,
            homeStats,
            awayStats,
            status: gameStatus,
            statusText,
            sport,
          }),
          cricketInnings,
        };
      } catch (err) {
        const appError = classifyError(err);
        // ESPN summary API returns 400 for individual-sport events (tennis, etc.)
        // Fall back to cached scoreboard data so the detail page still renders.
        if (appError.statusCode === 400) {
          const cachedGames = queryClient.getQueryData<GameData[]>(['scoreboard', sport, league]);
          const game = cachedGames?.find(g => g.id === eventId);
          if (game) return buildSummaryFromGameData(game);
        }
        throw appError;
      }
    },
    // Poll fast for live/halftime games, slower otherwise
    refetchInterval: LIVE_INTERVAL,
    refetchIntervalInBackground: false,
    staleTime: 15_000,
    retry: (failureCount, error) =>
      error.kind !== 'not_found' && error.statusCode !== 400 && failureCount < 2,
    throwOnError: false,
  });
}
