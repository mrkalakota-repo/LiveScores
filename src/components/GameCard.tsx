import React, { memo, useCallback, useMemo, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorScheme } from '@/constants/themes';

/**
 * Extract the in-game point score from a live tennis statusText.
 * ESPN's shortDetail can be "30-15", "Deuce", "Advantage Federer",
 * "Set 2, 5-4, 30-15", etc.
 * Returns a short display string or null when no point score is present.
 */
function extractTennisPoint(statusText: string): string | null {
  // Standard game-point patterns: "30-15", "40:30", "0-40", "AD-40"
  const scoreMatch = statusText.match(/\b(0|15|30|40|AD|A)\s*[-:]\s*(0|15|30|40|AD|A)\b/i);
  if (scoreMatch) {
    const a = scoreMatch[1].toUpperCase().replace(/^A$/, 'AD');
    const b = scoreMatch[2].toUpperCase().replace(/^A$/, 'AD');
    return `${a} - ${b}`;
  }
  if (/\bdeuce\b/i.test(statusText)) return 'Deuce';
  const advMatch = statusText.match(/\badv(?:antage)?\s+(.+)/i);
  if (advMatch) return `Adv. ${advMatch[1].trim()}`;
  return null;
}
import { TeamRow } from './TeamRow';
import { StatusBadge } from './StatusBadge';
import type { GameData } from '@/api/types';

interface Props {
  game: GameData;
}

function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: C.surface,
      marginHorizontal: 12,
      marginVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: C.border,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: C.isDark ? 0.5 : 0.08,
      shadowRadius: 10,
      elevation: 5,
    },
    cardLive: {
      shadowOffset: { width: 0, height: 0 },
      shadowRadius: 18,
      elevation: 10,
    },
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
      color: C.textMuted,
      flexShrink: 1,
      marginLeft: 8,
    },
    divider: {
      height: 1,
      backgroundColor: C.border,
      marginVertical: 1,
      opacity: 0.4,
    },
    situation: {
      fontSize: 11,
      color: C.textSecondary,
      marginTop: 8,
      fontStyle: 'italic',
      lineHeight: 16,
    },
    tennisPoint: {
      fontSize: 13,
      fontWeight: '800',
      color: C.live,
      marginTop: 8,
      letterSpacing: 0.5,
      textAlign: 'center',
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
      backgroundColor: C.surfaceElevated,
    },
    probFill: {
      height: '100%',
      backgroundColor: C.border,
    },
    probDivider: {
      width: 1,
      height: '100%',
      backgroundColor: C.background,
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
      color: C.textMuted,
      letterSpacing: 0.3,
    },
    probPct: {
      fontSize: 10,
      fontWeight: '800',
      color: C.textMuted,
    },
  });
}

export const GameCard = memo(function GameCard({ game }: Props) {
  const { C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
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

        {/* Tennis game-level point score */}
        {game.sport === 'tennis' && game.status === 'live' && (() => {
          const pt = extractTennisPoint(game.statusText);
          return pt ? <Text style={styles.tennisPoint}>{pt}</Text> : null;
        })()}

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
