import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import type { GameStatus, TeamInfo } from '@/api/types';

interface Props {
  team: TeamInfo;
  isWinner: boolean;
  gameStatus: GameStatus;
}

export const TeamRow = memo(function TeamRow({ team, isWinner, gameStatus }: Props) {
  const { C } = useTheme();
  const isFinal = gameStatus === 'final';
  const isScheduled = gameStatus === 'scheduled';

  // Tennis set scores come through as "6 3 7" — space-separated games per set
  const isSetScore = !isScheduled && team.score.includes(' ');

  const nameColor = isFinal
    ? isWinner ? C.winner : C.loser
    : C.textPrimary;

  const scoreColor = isFinal
    ? isWinner ? C.winnerScore : C.loserScore
    : isScheduled ? C.textMuted
    : C.textPrimary;

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
          <Text style={[styles.logoInitial, { color: C.textMuted }]}>{team.abbreviation.charAt(0)}</Text>
        </View>
      )}
      <Text style={[styles.abbrev, { color: nameColor }]} numberOfLines={1}>
        {team.abbreviation}
      </Text>
      {team.record && (
        <Text style={[styles.record, { color: C.textMuted }]} numberOfLines={1}>
          {team.record}
        </Text>
      )}
      <Text style={[styles.score, isSetScore && styles.scoreSet, { color: scoreColor }]}>
        {isScheduled ? '--' : team.score}
      </Text>
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
  scoreSet: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 3,
    minWidth: 52,
  },
});
