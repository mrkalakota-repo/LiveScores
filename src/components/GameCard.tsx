import React, { memo, useCallback, useMemo, useRef } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { useResponsive } from '@/hooks/useResponsive';
import type { ColorScheme } from '@/constants/themes';

/**
 * Extract the in-game point score from a live tennis statusText.
 */
function extractTennisPoint(statusText: string): string | null {
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
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: C.isDark ? '#000' : '#64748b',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: C.isDark ? 0.6 : 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    cardLive: {
      shadowColor: C.live,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: C.isDark ? 0.5 : 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
    accent: {
      width: 4,
    },
    inner: {
      flex: 1,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 14,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    broadcast: {
      fontSize: 10,
      fontWeight: '500',
      color: C.textMuted,
      flexShrink: 1,
      marginLeft: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
      marginVertical: 2,
    },
    situation: {
      fontSize: 12,
      color: C.textSecondary,
      marginTop: 10,
      fontStyle: 'italic',
      lineHeight: 17,
    },
    tennisSetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: -2,
      gap: 4,
    },
    tennisSetLabel: {
      width: 28,
      textAlign: 'center',
      fontSize: 9,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    tennisPoint: {
      fontSize: 14,
      fontWeight: '900',
      color: C.live,
      marginTop: 10,
      letterSpacing: 1,
      textAlign: 'center',
    },
    probRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 8,
    },
    probTrack: {
      flex: 1,
      height: 5,
      flexDirection: 'row',
      borderRadius: 3,
      overflow: 'hidden',
      backgroundColor: C.surfaceElevated,
    },
    probFill: {
      height: '100%',
      backgroundColor: C.border,
    },
    probDivider: {
      width: 2,
      height: '100%',
      backgroundColor: C.surface,
    },
    probLabel: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 3,
      minWidth: 52,
    },
    probLabelRight: {
      justifyContent: 'flex-end',
    },
    probAbbrev: {
      fontSize: 9,
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
  const { columns } = useResponsive();
  const styles = useMemo(() => createStyles(C), [C]);
  const router = useRouter();
  const accentColor = { live: C.live, halftime: C.halftime, scheduled: C.accent, final: C.border }[game.status] ?? C.border;
  const isLive = game.status === 'live' || game.status === 'halftime';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(scaleAnim, { toValue: 0.97, duration: 80, useNativeDriver: true }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
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
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, columns > 1 && { flex: 1 }]}>
    <Pressable
      style={[
        styles.card,
        isLive && [styles.cardLive, {
          backgroundColor: C.liveCardBackground,
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
            <Text style={styles.broadcast} numberOfLines={1} maxFontSizeMultiplier={1.3}>
              {game.broadcasts[0]}
            </Text>
          )}
        </View>

        {/* Tennis set headers */}
        {game.sport === 'tennis' && game.status !== 'scheduled' && (game.awayTeam.linescores?.length || game.homeTeam.linescores?.length) ? (
          <View style={styles.tennisSetHeader}>
            <View style={{ flex: 1 }} />
            {Array.from(
              { length: Math.max(game.awayTeam.linescores?.length ?? 0, game.homeTeam.linescores?.length ?? 0) },
              (_, i) => (
                <Text key={i} style={[styles.tennisSetLabel, { color: C.textMuted }]}>
                  S{i + 1}
                </Text>
              ),
            )}
          </View>
        ) : null}

        {/* Teams */}
        <TeamRow
          team={game.awayTeam}
          isWinner={game.awayTeam.winner}
          gameStatus={game.status}
          isTennis={game.sport === 'tennis'}
          opponentLinescores={game.homeTeam.linescores}
        />
        <View style={styles.divider} />
        <TeamRow
          team={game.homeTeam}
          isWinner={game.homeTeam.winner}
          gameStatus={game.status}
          isTennis={game.sport === 'tennis'}
          opponentLinescores={game.awayTeam.linescores}
        />

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
