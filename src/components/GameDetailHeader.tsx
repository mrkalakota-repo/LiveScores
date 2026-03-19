import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Colors } from '@/constants/colors';
import { StatusBadge } from './StatusBadge';
import type { GameStatus, TeamInfo } from '@/api/types';

interface TeamColProps {
  team: TeamInfo;
  gameStatus: GameStatus;
  align: 'left' | 'right';
}

const TeamCol = memo(function TeamCol({ team, gameStatus, align }: TeamColProps) {
  const isFinal = gameStatus === 'final';
  const isScheduled = gameStatus === 'scheduled';
  const nameColor = isFinal ? (team.winner ? Colors.winner : Colors.loser) : Colors.textPrimary;
  const scoreColor = isFinal
    ? team.winner ? Colors.winnerScore : Colors.loserScore
    : isScheduled ? Colors.textMuted
    : Colors.textPrimary;

  return (
    <View style={[styles.teamCol, align === 'right' && styles.teamColRight]}>
      {team.logo ? (
        <Image source={{ uri: team.logo }} style={styles.logo} contentFit="contain" recyclingKey={team.id} />
      ) : (
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoInitial}>{team.abbreviation.charAt(0)}</Text>
        </View>
      )}
      <Text style={[styles.abbrev, { color: nameColor }]}>{team.abbreviation}</Text>
      {team.record && <Text style={styles.record}>{team.record}</Text>}
      <Text style={[styles.score, { color: scoreColor }]}>
        {isScheduled ? '--' : team.score}
      </Text>
    </View>
  );
});

interface Props {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  status: GameStatus;
  statusText: string;
}

export const GameDetailHeader = memo(function GameDetailHeader({ homeTeam, awayTeam, status, statusText }: Props) {
  return (
    <View style={styles.container}>
      <TeamCol team={awayTeam} gameStatus={status} align="left" />

      <View style={styles.middle}>
        <StatusBadge status={status} statusText={statusText} />
        {status !== 'scheduled' && (
          <Text style={styles.vs}>vs</Text>
        )}
      </View>

      <TeamCol team={homeTeam} gameStatus={status} align="right" />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 28,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  teamCol: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 6,
  },
  teamColRight: {
    alignItems: 'flex-end',
  },
  logo: {
    width: 72,
    height: 72,
  },
  logoPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  abbrev: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  record: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  score: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    lineHeight: 70,
  },
  middle: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  vs: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
});
