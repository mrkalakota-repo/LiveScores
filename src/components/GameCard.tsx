import React, { memo, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorScheme } from '@/constants/themes';
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
      marginVertical: 5,
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
      backgroundColor: C.liveCardBackground,
      borderColor: C.liveBorder,
      shadowColor: C.live,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: C.isDark ? 0.35 : 0.15,
      shadowRadius: 18,
      elevation: 10,
    },
    cardPressed: { opacity: 0.78 },
    accent: {
      width: 6,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
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
      marginTop: 7,
      fontStyle: 'italic',
      lineHeight: 16,
    },
    probRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 9,
      gap: 6,
    },
    probTrack: {
      flex: 1,
      height: 4,
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
    probSide: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 3,
      minWidth: 52,
    },
    probSideRight: {
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
    probPctRight: {
      textAlign: 'right',
    },
  });
}

export const GameCard = memo(function GameCard({ game }: Props) {
  const { C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const router = useRouter();
  const accentColor = { live: C.live, halftime: C.halftime, scheduled: C.accent, final: C.border }[game.status] ?? C.border;
  const isLive = game.status === 'live' || game.status === 'halftime';

  const handlePress = useCallback(() => {
    router.push({
      pathname: '/game/[id]',
      params: { id: game.id, sport: game.sport, league: game.league },
    });
  }, [router, game.id, game.sport, game.league]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        isLive && styles.cardLive,
        pressed && styles.cardPressed,
      ]}
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

        {/* Win probability bar */}
        {game.winProbability && (
          <View style={styles.probRow}>
            <View style={styles.probSide}>
              <Text style={[styles.probAbbrev, game.winProbability.away > game.winProbability.home && { color: C.accent }]}>
                {game.awayTeam.abbreviation}
              </Text>
              <Text style={[styles.probPct, game.winProbability.away > game.winProbability.home && { color: C.accent }]}>
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
            <View style={[styles.probSide, styles.probSideRight]}>
              <Text style={[styles.probPct, game.winProbability.home > game.winProbability.away && { color: C.accent }]}>
                {game.winProbability.home}%
              </Text>
              <Text style={[styles.probAbbrev, game.winProbability.home > game.winProbability.away && { color: C.accent }]}>
                {game.homeTeam.abbreviation}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
});
