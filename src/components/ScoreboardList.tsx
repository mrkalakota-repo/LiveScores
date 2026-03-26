import React, { useCallback, useMemo } from 'react';
import { FlatList, Platform, RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import { groupGamesIntoSections } from '@/utils/transformers';
import { GameCard } from './GameCard';
import { LoadingScreen } from './LoadingScreen';
import { ErrorScreen } from './ErrorScreen';
import { EmptyState } from './EmptyState';
import { LastUpdatedBar } from './LastUpdatedBar';
import { AdBanner } from './AdBanner';
import { AppError } from '@/api/errors';
import type { GameData } from '@/api/types';

interface Props {
  games: GameData[];
  isLoading: boolean;
  isError: boolean;
  error?: AppError | Error | null;
  isRefetching: boolean;
  onRetry: () => void;
  onRefresh: () => void;
  updatedAt: number;
  sport?: string;
}

export function ScoreboardList({
  games,
  isLoading,
  isError,
  error,
  isRefetching,
  onRetry,
  onRefresh,
  updatedAt,
  sport,
}: Props) {
  const { C } = useTheme();
  const { columns, isTablet, maxContentWidth, cardColumnWidth } = useResponsive();
  const sections = useMemo(() => groupGamesIntoSections(games), [games]);

  const renderItem = useCallback(
    ({ item }: { item: GameData }) => <GameCard game={item} />,
    [],
  );

  // On tablets, render each game at a fixed column width so they wrap into a grid
  const renderGridItem = useCallback(
    ({ item }: { item: GameData }) => (
      <View style={{ width: cardColumnWidth }}>
        <GameCard game={item} />
      </View>
    ),
    [cardColumnWidth],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: C.accent }]} />
        <Text style={[styles.sectionTitle, { color: C.accent }]} maxFontSizeMultiplier={1.3}>{section.title}</Text>
        <View style={[styles.sectionLine, { backgroundColor: C.accent }]} />
      </View>
    ),
    [C],
  );

  if (isLoading) return <LoadingScreen />;
  if (isError) {
    // "not_found" means ESPN has no data for this sport/league — show empty state instead of error
    if (error instanceof AppError && error.kind === 'not_found') {
      return <EmptyState sport={sport} />;
    }
    return <ErrorScreen onRetry={onRetry} error={error} />;
  }
  if (games.length === 0) return <EmptyState sport={sport} />;

  // Multi-column grid on tablets — use FlatList with numColumns
  if (columns > 1) {
    const flatData = sections.flatMap(s => s.data);
    return (
      <View style={styles.flex}>
        {updatedAt > 0 && <LastUpdatedBar updatedAt={updatedAt} />}
        <FlatList
          key={`grid-${columns}`}
          style={styles.flex}
          data={flatData}
          keyExtractor={item => item.id}
          numColumns={columns}
          renderItem={renderGridItem}
          ListFooterComponent={
            <View style={styles.footer}>
              <AdBanner />
            </View>
          }
          contentContainerStyle={[styles.content, styles.gridContent]}
          removeClippedSubviews
          refreshControl={
            Platform.OS !== 'web' ? (
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={onRefresh}
                tintColor={C.scheduled}
                colors={[C.scheduled]}
              />
            ) : undefined
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      {updatedAt > 0 && <LastUpdatedBar updatedAt={updatedAt} />}
      <SectionList
        style={styles.flex}
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListFooterComponent={
          <View style={styles.footer}>
            <AdBanner />
          </View>
        }
        contentContainerStyle={styles.content}
        stickySectionHeadersEnabled={false}
        removeClippedSubviews
        refreshControl={
          Platform.OS !== 'web' ? (
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor={C.scheduled}
              colors={[C.scheduled]}
            />
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  gridContent: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 8,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    opacity: 0.3,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 20,
    alignItems: 'center',
  },
});
