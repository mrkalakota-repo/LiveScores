import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { useScoreboard } from '@/hooks/useScoreboard';
import { useRefreshOnFocus } from '@/hooks/useRefreshOnFocus';
import { ScoreboardList } from '@/components/ScoreboardList';

export default function NhlScreen() {
  const { data, isLoading, isError, isRefetching, refetch, dataUpdatedAt } =
    useScoreboard('hockey', 'nhl');

  useRefreshOnFocus(refetch);

  return (
    <View style={styles.container}>
      <ScoreboardList
        games={data ?? []}
        isLoading={isLoading}
        isError={isError}
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
