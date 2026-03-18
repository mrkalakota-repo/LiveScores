import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { TeamRow } from './TeamRow';
import { StatusBadge } from './StatusBadge';
import type { GameData } from '@/api/types';

interface Props {
  game: GameData;
}

const LEFT_ACCENT: Partial<Record<string, string>> = {
  live: Colors.live,
  halftime: Colors.halftime,
  scheduled: Colors.accent,
  final: Colors.border,
};

export const GameCard = memo(function GameCard({ game }: Props) {
  const router = useRouter();
  const accentColor = LEFT_ACCENT[game.status] ?? Colors.border;

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/game/[id]',
      params: { id: game.id, sport: game.sport, league: game.league },
    });
  }, [router, game.id, game.sport, game.league]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={handlePress}
      accessibilityLabel={`${game.awayTeam.abbreviation} vs ${game.homeTeam.abbreviation}, tap for details`}
      accessibilityRole="button"
    >
      {/* Colored left accent stripe */}
      <View style={[styles.accent, { backgroundColor: accentColor }]} />

      <View style={styles.inner}>
        {/* Header: status badge + broadcast */}
        <View style={styles.header}>
          <StatusBadge status={game.status} statusText={game.statusText} />
          {game.broadcasts.length > 0 && (
            <Text style={styles.broadcast} numberOfLines={1}>
              {game.broadcasts[0]}
            </Text>
          )}
        </View>

        {/* Teams */}
        <TeamRow team={game.awayTeam} isWinner={game.awayTeam.winner} gameStatus={game.status} />
        <View style={styles.divider} />
        <TeamRow team={game.homeTeam} isWinner={game.homeTeam.winner} gameStatus={game.status} />

        {/* Situation (baseball, cricket play-by-play) */}
        {game.situation && (
          <Text style={styles.situation} numberOfLines={2}>
            {game.situation}
          </Text>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 12,
    marginVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardPressed: { opacity: 0.82 },
  accent: {
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  broadcast: {
    fontSize: 11,
    color: Colors.textMuted,
    flexShrink: 1,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 1,
    opacity: 0.5,
  },
  situation: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 7,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});
