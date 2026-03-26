import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import type { GameStatus, TeamInfo } from '@/api/types';

interface Props {
  team: TeamInfo;
  isWinner: boolean;
  gameStatus: GameStatus;
  /** Opponent linescores — used to determine set winners in tennis */
  opponentLinescores?: number[];
  isTennis?: boolean;
}

export const TeamRow = memo(function TeamRow({ team, isWinner, gameStatus, opponentLinescores, isTennis }: Props) {
  const { C } = useTheme();
  const isFinal = gameStatus === 'final';
  const isScheduled = gameStatus === 'scheduled';

  const nameColor = isFinal
    ? isWinner ? C.winner : C.loser
    : C.textPrimary;

  const scoreColor = isFinal
    ? isWinner ? C.winnerScore : C.loserScore
    : isScheduled ? C.textMuted
    : C.textPrimary;

  const showTennisSets = isTennis && !isScheduled && team.linescores && team.linescores.length > 0;

  return (
    <View style={styles.row}>
      {team.logo ? (
        <Image
          source={{ uri: team.logo }}
          style={styles.logo}
          contentFit="contain"
          transition={200}
          recyclingKey={team.id}
        />
      ) : (
        <View style={[styles.logoPlaceholder, { backgroundColor: C.surfaceElevated }]}>
          <Text style={[styles.logoInitial, { color: C.textMuted }]} maxFontSizeMultiplier={1.3}>{team.abbreviation.charAt(0)}</Text>
        </View>
      )}
      <Text style={[styles.abbrev, { color: nameColor }]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
        {team.abbreviation}
      </Text>
      {team.record && (
        <Text style={[styles.record, { color: C.textMuted }]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
          {team.record}
        </Text>
      )}

      {showTennisSets ? (
        <View style={styles.setsRow}>
          {team.linescores!.map((games, i) => {
            const oppGames = opponentLinescores?.[i] ?? 0;
            const wonSet = games > oppGames;
            return (
              <View
                key={i}
                style={[
                  styles.setCell,
                  { backgroundColor: C.surfaceElevated },
                  wonSet && { backgroundColor: C.accent + '22' },
                ]}
              >
                <Text style={[
                  styles.setCellText,
                  { color: C.textSecondary },
                  wonSet && { color: C.accent, fontWeight: '900' },
                ]} maxFontSizeMultiplier={1.3}>
                  {games}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={[styles.score, { color: scoreColor }]} maxFontSizeMultiplier={1.3}>
          {isScheduled ? '--' : team.score}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  logo: {
    width: 38,
    height: 38,
  },
  logoPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    fontSize: 16,
    fontWeight: '800',
  },
  abbrev: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
    letterSpacing: 0.3,
  },
  record: {
    fontSize: 11,
    fontWeight: '500',
    marginRight: 4,
  },
  score: {
    fontSize: 28,
    fontWeight: '900',
    minWidth: 40,
    textAlign: 'right',
    letterSpacing: -1,
  },
  setsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  setCell: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setCellText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
