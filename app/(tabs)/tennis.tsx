import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { useScoreboard } from '@/hooks/useScoreboard';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { ScoreboardList } from '@/components/ScoreboardList';
import { useLiveGames } from '@/contexts/LiveGamesContext';

export default function TennisScreen() {
  const { C } = useTheme();
  const { data, isLoading, isError, error, isRefetching, refetch, dataUpdatedAt } =
    useScoreboard('tennis', 'atp');
  const { setLiveCount } = useLiveGames();
  useRefreshOnFocus(refetch);

  useEffect(() => {
    const count = data?.filter(g => g.status === 'live' || g.status === 'halftime').length ?? 0;
    setLiveCount('tennis', count);
  }, [data, setLiveCount]);

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <ScoreboardList
        games={data ?? []}
        isLoading={isLoading}
        isError={isError}
        error={error}
        isRefetching={isRefetching}
        onRetry={refetch}
        onRefresh={refetch}
        updatedAt={dataUpdatedAt}
        sport="Tennis"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
});
