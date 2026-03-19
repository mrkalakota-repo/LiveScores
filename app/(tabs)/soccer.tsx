import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { SOCCER_LEAGUES, type SoccerLeague } from '@/constants/sports';
import { useScoreboard } from '@/hooks/useScoreboard';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { ScoreboardList } from '@/components/ScoreboardList';
import { LeagueChipBar } from '@/components/LeagueChipBar';
import { useLiveGames } from '@/contexts/LiveGamesContext';

export default function SoccerScreen() {
  const [selectedLeague, setSelectedLeague] = useState<SoccerLeague>(SOCCER_LEAGUES[0]);
  const { data, isLoading, isError, error, isRefetching, refetch, dataUpdatedAt } =
    useScoreboard(selectedLeague.sport, selectedLeague.league);
  const { setLiveCount } = useLiveGames();
  useRefreshOnFocus(refetch);

  useEffect(() => {
    const count = data?.filter(g => g.status === 'live' || g.status === 'halftime').length ?? 0;
    setLiveCount('soccer', count);
  }, [data, setLiveCount]);

  return (
    <View style={styles.container}>
      <LeagueChipBar
        leagues={SOCCER_LEAGUES}
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
  container: { flex: 1, backgroundColor: Colors.background },
});
