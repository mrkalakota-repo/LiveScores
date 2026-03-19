/**
 * LiveCountPoller — background component mounted at the root.
 *
 * Uses useQueries to poll every sport's default scoreboard simultaneously,
 * so all tab live-dot indicators update even before those tabs are visited.
 * Query keys are identical to what each tab screen uses, so TanStack Query
 * deduplicates the network requests when a tab is also open.
 */
import { useEffect } from 'react';
import { useQueries } from '@tanstack/react-query';
import { fetchScoreboard } from '@/api/espn';
import { transformScoreboard } from '@/utils/transformers';
import { SPORTS } from '@/constants/sports';
import { POLL_INTERVAL_MS } from '@/constants/config';
import { useLiveGames } from '@/contexts/LiveGamesContext';
import type { AppError } from '@/api/errors';
import type { GameData } from '@/api/types';

export function LiveCountPoller() {
  const { setLiveCount } = useLiveGames();

  // Cricket uses dynamic league IDs from a discovery endpoint — exclude from static poll
  const pollableSports = SPORTS.filter(s => s.sport !== 'cricket');

  const results = useQueries({
    queries: pollableSports.map(sport => ({
      queryKey: ['scoreboard', sport.sport, sport.league],
      queryFn: async (): Promise<GameData[]> => {
        const raw = await fetchScoreboard(sport.sport, sport.league);
        return transformScoreboard(raw, sport.sport, sport.league);
      },
      refetchInterval: POLL_INTERVAL_MS,
      refetchIntervalInBackground: false,
      staleTime: 30_000,
      retry: (failureCount: number, error: AppError) =>
        error?.kind !== 'not_found' && failureCount < 2,
      throwOnError: false,
    })),
  });

  useEffect(() => {
    results.forEach((result, i) => {
      const sport = pollableSports[i];
      const count =
        result.data?.filter(g => g.status === 'live' || g.status === 'halftime').length ?? 0;
      setLiveCount(sport.id, count);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, setLiveCount]);

  return null;
}
