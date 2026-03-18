import { useQuery } from '@tanstack/react-query';
import { fetchScoreboard } from '@/api/espn';
import { classifyError } from '@/api/errors';
import { transformScoreboard } from '@/utils/transformers';
import { POLL_INTERVAL_MS } from '@/constants/config';
import type { AppError } from '@/api/errors';
import type { GameData } from '@/api/types';

export function useScoreboard(sport: string, league: string) {
  return useQuery<GameData[], AppError>({
    queryKey: ['scoreboard', sport, league],
    queryFn: async () => {
      const raw = await fetchScoreboard(sport, league);
      return transformScoreboard(raw, sport, league);
    },
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      // Don't retry on 404 or input validation errors
      if (error.kind === 'not_found') return false;
      return failureCount < 2;
    },
    throwOnError: false,
  });
}
