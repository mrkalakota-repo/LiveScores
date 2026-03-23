import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BASKETBALL_LEAGUES } from '@/constants/sports';
import type { LeagueConfig } from '@/constants/sports';
import { useScoreboard } from '@/hooks/useScoreboard';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { ScoreboardList } from '@/components/ScoreboardList';
import { LeagueChipBar } from '@/components/LeagueChipBar';
import { useLiveGames } from '@/contexts/LiveGamesContext';

export default function NbaScreen() {
  const { C } = useTheme();
  const [selectedLeague, setSelectedLeague] = useState<LeagueConfig>(BASKETBALL_LEAGUES[0]);
  const { data, isLoading, isError, error, isRefetching, refetch, dataUpdatedAt } =
    useScoreboard(selectedLeague.sport, selectedLeague.league);
  const { setLiveCount } = useLiveGames();
  useRefreshOnFocus(refetch);

  useEffect(() => {
    const count = data?.filter(g => g.status === 'live' || g.status === 'halftime').length ?? 0;
    setLiveCount('nba', count);
  }, [data, setLiveCount]);

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <LeagueChipBar
        leagues={BASKETBALL_LEAGUES}
        selected={selectedLeague.league}
        onSelect={setSelectedLeague}
      />
      <ScoreboardList
        games={data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isRefetching={isRefetching}
        onRetry={refetch}
        onRefresh={refetch}
        updatedAt={dataUpdatedAt}
        sport={selectedLeague.label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
