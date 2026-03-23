import { useQuery } from '@tanstack/react-query';
import { fetchScoreboard } from '@/api/espn';
import { transformScoreboard } from '@/utils/transformers';
import { POLL_INTERVAL_MS } from '@/constants/config';
import type { AppError } from '@/api/errors';
import type { GameData, EspnEvent } from '@/api/types';

/**
 * Fetches both ATP and WTA scoreboards, merges events (deduplicating
 * shared tournaments like the Miami Open), then filters by grouping slug
 * (e.g. "mens-singles", "womens-doubles").
 */
export function useTennisScoreboard(groupingSlug: string) {
  return useQuery<GameData[], AppError>({
    queryKey: ['scoreboard', 'tennis', 'all', groupingSlug],
    queryFn: async () => {
      const [atpRaw, wtaRaw] = await Promise.all([
        fetchScoreboard('tennis', 'atp'),
        fetchScoreboard('tennis', 'wta'),
      ]);

      // Merge events, deduplicating by ID (shared tournaments appear in both)
      const eventMap = new Map<string, EspnEvent>();
      for (const event of atpRaw.events ?? []) {
        eventMap.set(event.id, event);
      }
      for (const event of wtaRaw.events ?? []) {
        if (!eventMap.has(event.id)) {
          eventMap.set(event.id, event);
        }
      }

      const merged = { events: [...eventMap.values()] };
      return transformScoreboard(merged, 'tennis', 'atp', groupingSlug);
    },
    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (error.kind === 'not_found') return false;
      return failureCount < 2;
    },
    throwOnError: false,
  });
}
