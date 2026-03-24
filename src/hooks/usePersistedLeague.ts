import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LeagueConfig } from '@/constants/sports';

const PREFIX = '@livescores/league/';

/**
 * Like useState<LeagueConfig> but persists the selected league ID to AsyncStorage.
 * On mount, restores the last selection if it exists in the provided leagues list.
 */
export function usePersistedLeague(
  key: string,
  leagues: readonly LeagueConfig[],
  defaultLeague: LeagueConfig,
): [LeagueConfig, (league: LeagueConfig) => void] {
  const [selected, setSelected] = useState<LeagueConfig>(defaultLeague);

  // Restore on mount
  useEffect(() => {
    AsyncStorage.getItem(PREFIX + key).then(stored => {
      if (!stored) return;
      const found = leagues.find(l => l.league === stored);
      if (found) setSelected(found);
    });
  }, [key, leagues]);

  const select = useCallback((league: LeagueConfig) => {
    setSelected(league);
    AsyncStorage.setItem(PREFIX + key, league.league);
  }, [key]);

  return [selected, select];
}
