import { useQuery } from '@tanstack/react-query';
import { fetchCricketLeagues } from '@/api/espn';
import { classifyError } from '@/api/errors';
import type { AppError } from '@/api/errors';
import type { LeagueConfig } from '@/constants/sports';

/**
 * Fetches today's active cricket leagues from the ESPN scoreboard header.
 * Returns a dynamic list of leagues that have matches scheduled/live today.
 */
export function useCricketLeagues() {
  return useQuery<LeagueConfig[], AppError>({
    queryKey: ['cricket-leagues', new Date().toISOString().slice(0, 10)],
    queryFn: fetchCricketLeagues,
    // Refresh every 10 min — leagues don't change often within a day
    staleTime: 10 * 60_000,
    refetchInterval: 10 * 60_000,
    refetchIntervalInBackground: false,
    retry: (failureCount, error) => error.kind !== 'not_found' && failureCount < 2,
    throwOnError: false,
  });
}
