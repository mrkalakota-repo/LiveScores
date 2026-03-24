import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { TENNIS_FORMATS } from '@/constants/sports';
import { useTennisScoreboard } from '@/hooks/useTennisScoreboard';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { usePersistedLeague } from '@/hooks/usePersistedLeague';
import { ScoreboardList } from '@/components/ScoreboardList';
import { LeagueChipBar } from '@/components/LeagueChipBar';
import { useLiveGames } from '@/contexts/LiveGamesContext';

export default function TennisScreen() {
  const { C } = useTheme();
  const [selectedFormat, setSelectedFormat] = usePersistedLeague('tennis', TENNIS_FORMATS, TENNIS_FORMATS[0]);
  const { data, isLoading, isError, error, isRefetching, refetch, dataUpdatedAt } =
    useTennisScoreboard(selectedFormat.league);
  const { setLiveCount } = useLiveGames();
  useRefreshOnFocus(refetch);

  useEffect(() => {
    const count = data?.filter(g => g.status === 'live' || g.status === 'halftime').length ?? 0;
    setLiveCount('tennis', count);
  }, [data, setLiveCount]);

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <LeagueChipBar
        leagues={TENNIS_FORMATS}
        selected={selectedFormat.league}
        onSelect={setSelectedFormat}
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
        sport="Tennis"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
