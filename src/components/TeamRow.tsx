import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import type { GameStatus, TeamInfo } from '@/api/types';

interface Props {
  team: TeamInfo;
  isWinner: boolean;
  gameStatus: GameStatus;
}

export const TeamRow = memo(function TeamRow({ team, isWinner, gameStatus }: Props) {
  const isFinal = gameStatus === 'final';
  const isScheduled = gameStatus === 'scheduled';

  // Tennis set scores come through as "6 3 7" — space-separated games per set
  const isSetScore = !isScheduled && team.score.includes(' ');

  const nameColor = isFinal
    ? isWinner ? Colors.winner : Colors.loser
    : Colors.textPrimary;

  const scoreColor = isFinal
    ? isWinner ? Colors.winnerScore : Colors.loserScore
    : isScheduled ? Colors.textMuted
    : Colors.textPrimary;

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
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoInitial}>{team.abbreviation.charAt(0)}</Text>
        </View>
      )}
      <Text style={[styles.abbrev, { color: nameColor }]} numberOfLines={1}>
        {team.abbreviation}
      </Text>
      {team.record && (
        <Text style={styles.record} numberOfLines={1}>
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
    gap: 10,
  },
  logo: {
    width: 34,
    height: 34,
  },
  logoPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  abbrev: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
    letterSpacing: 0.2,
  },
  record: {
    fontSize: 11,
    color: Colors.textMuted,
    marginRight: 8,
  },
  score: {
    fontSize: 26,
    fontWeight: '900',
    minWidth: 40,
    textAlign: 'right',
    letterSpacing: -0.5,
  },
  scoreSet: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 3,
    minWidth: 52,
  },
});
