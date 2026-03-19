import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { LeagueConfig } from '@/constants/sports';
import { useScoreboard } from '@/hooks/useScoreboard';
import { useCricketLeagues } from '@/hooks/useCricketLeagues';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { ScoreboardList } from '@/components/ScoreboardList';
import { LeagueChipBar } from '@/components/LeagueChipBar';
import { useLiveGames } from '@/contexts/LiveGamesContext';

export default function CricketScreen() {
  const { C } = useTheme();
  const { data: leagues, isLoading: leaguesLoading } = useCricketLeagues();
  const [selectedLeague, setSelectedLeague] = useState<LeagueConfig | null>(null);
  const { setLiveCount } = useLiveGames();

  // Auto-select first league once discovered
  useEffect(() => {
    if (leagues && leagues.length > 0 && !selectedLeague) {
      setSelectedLeague(leagues[0]);
    }
  }, [leagues, selectedLeague]);

  const { data, isLoading, isError, error, isRefetching, refetch, dataUpdatedAt } =
    useScoreboard(
      selectedLeague?.sport ?? 'cricket',
      selectedLeague?.league ?? '',
    );

  useRefreshOnFocus(refetch);

  useEffect(() => {
    const count = data?.filter(g => g.status === 'live' || g.status === 'halftime').length ?? 0;
    setLiveCount('cricket', count);
  }, [data, setLiveCount]);

  if (leaguesLoading) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  if (!leagues || leagues.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: C.background }]}>
        <Text style={[styles.emptyText, { color: C.textSecondary }]}>No cricket matches today</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      {leagues && leagues.length > 0 && selectedLeague && (
        <LeagueChipBar
          leagues={leagues}
          selected={selectedLeague.league}
          onSelect={setSelectedLeague}
        />
      )}
      <ScoreboardList
        games={data ?? []}
        isLoading={isLoading || !selectedLeague}
        isError={isError}
        error={error}
        isRefetching={isRefetching}
        onRetry={refetch}
        onRefresh={refetch}
        updatedAt={dataUpdatedAt}
        sport={selectedLeague?.label ?? 'Cricket'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
});
