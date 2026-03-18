import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { useScoreboard } from '@/hooks/useScoreboard';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { ScoreboardList } from '@/components/ScoreboardList';
import { useLiveGames } from '@/contexts/LiveGamesContext';

export default function NhlScreen() {
  const { data, isLoading, isError, error, isRefetching, refetch, dataUpdatedAt } =
    useScoreboard('hockey', 'nhl');
  const { setLiveCount } = useLiveGames();
  useRefreshOnFocus(refetch);

  useEffect(() => {
    const count = data?.filter(g => g.status === 'live' || g.status === 'halftime').length ?? 0;
    setLiveCount('nhl', count);
  }, [data, setLiveCount]);

  return (
    <View style={styles.container}>
      <ScoreboardList
        games={data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isRefetching={isRefetching}
        onRetry={refetch}
        onRefresh={refetch}
        updatedAt={dataUpdatedAt}
        sport="NHL"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
});
