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
      <View style={styles.spacer} />
      <Text style={[styles.score, { color: scoreColor }]}>
        {isScheduled ? '--' : team.score}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    gap: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  logoPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  abbrev: {
    fontSize: 15,
    fontWeight: '600',
    width: 46,
  },
  record: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  spacer: { flex: 1 },
  score: {
    fontSize: 22,
    fontWeight: '800',
    minWidth: 36,
    textAlign: 'right',
    letterSpacing: -0.5,
  },
});
