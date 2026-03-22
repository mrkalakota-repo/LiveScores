import React, { memo, useCallback, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { TeamRow } from './TeamRow';
import { StatusBadge } from './StatusBadge';
import type { GameData } from '@/api/types';

interface Props {
  game: GameData;
}

export const GameCard = memo(function GameCard({ game }: Props) {
  const { C } = useTheme();
  const router = useRouter();
  const accentColor = { live: C.live, halftime: C.halftime, scheduled: C.scheduled, final: C.final }[game.status] ?? C.border;
  const isLive = game.status === 'live' || game.status === 'halftime';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, { toValue: 0.975, duration: 100, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push({
      pathname: '/game/[id]',
      params: { id: game.id, sport: game.sport, league: game.league },
    });
  }, [router, game.id, game.sport, game.league]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: C.surface,
          borderColor: C.border,
          shadowOpacity: C.isDark ? 0.5 : 0.12,
        },
        isLive && [styles.cardLive, {
          backgroundColor: C.liveCardBackground,
          borderColor: C.liveBorder,
          shadowColor: C.live,
          shadowOpacity: C.isDark ? 0.35 : 0.15,
        }],
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
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

        {/* Win probability bar — hide when 50/50 (no signal) */}
        {game.winProbability && game.winProbability.basis !== 'even' && (
          <View style={styles.probRow}>
            <View style={styles.probLabel}>
              <Text style={[
                styles.probAbbrev,
                game.winProbability.away > game.winProbability.home && { color: C.accent },
              ]}>
                {game.awayTeam.abbreviation}
              </Text>
              <Text style={[
                styles.probPct,
                game.winProbability.away > game.winProbability.home && { color: C.accent },
              ]}>
                {game.winProbability.away}%
              </Text>
            </View>
            <View style={styles.probTrack}>
              <View style={[
                styles.probFill,
                { flex: game.winProbability.away },
                game.winProbability.away > game.winProbability.home && { backgroundColor: C.accent },
              ]} />
              <View style={styles.probDivider} />
              <View style={[
                styles.probFill,
                { flex: game.winProbability.home },
                game.winProbability.home > game.winProbability.away && { backgroundColor: C.accent },
              ]} />
            </View>
            <View style={[styles.probLabel, styles.probLabelRight]}>
              <Text style={[
                styles.probPct,
                game.winProbability.home > game.winProbability.away && { color: C.accent },
              ]}>
                {game.winProbability.home}%
              </Text>
              <Text style={[
                styles.probAbbrev,
                game.winProbability.home > game.winProbability.away && { color: C.accent },
              ]}>
                {game.homeTeam.abbreviation}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  cardLive: {
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 18,
    elevation: 10,
  },
  // press feedback is handled by Animated scale
  accent: {
    width: 6,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  broadcast: {
    fontSize: 10,
    color: Colors.textMuted,
    flexShrink: 1,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 1,
    opacity: 0.4,
  },
  situation: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  probRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  probTrack: {
    flex: 1,
    height: 6,
    flexDirection: 'row',
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated,
  },
  probFill: {
    height: '100%',
    backgroundColor: Colors.border,
  },
  probDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.background,
  },
  probLabel: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    minWidth: 52,
  },
  probLabelRight: {
    justifyContent: 'flex-end',
  },
  probAbbrev: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  probPct: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
