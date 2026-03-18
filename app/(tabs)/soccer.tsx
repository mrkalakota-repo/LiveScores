import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { SOCCER_LEAGUES, type SoccerLeague } from '@/constants/sports';
import { useScoreboard } from '@/hooks/useScoreboard';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { ScoreboardList } from '@/components/ScoreboardList';
import { LeagueChipBar } from '@/components/LeagueChipBar';

export default function SoccerScreen() {
  const [selectedLeague, setSelectedLeague] = useState<SoccerLeague>(SOCCER_LEAGUES[0]);

  const { data, isLoading, isError, isRefetching, refetch, dataUpdatedAt } =
    useScoreboard(selectedLeague.sport, selectedLeague.league);

  useRefreshOnFocus(refetch);

  return (
    <View style={styles.container}>
      <LeagueChipBar
        leagues={SOCCER_LEAGUES}
        selected={selectedLeague.league}
        onSelect={setSelectedLeague}
      />
      <View style={styles.divider} />
      <ScoreboardList
        games={data ?? []}
        isLoading={isLoading}
        isError={isError}
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
  divider: { height: 1, backgroundColor: Colors.border },
});
