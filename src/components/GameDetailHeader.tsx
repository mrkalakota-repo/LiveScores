import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusBadge } from './StatusBadge';
import type { GameStatus, TeamInfo } from '@/api/types';

interface TeamColProps {
  team: TeamInfo;
  gameStatus: GameStatus;
  align: 'left' | 'right';
  isTennis?: boolean;
}

const TeamCol = memo(function TeamCol({ team, gameStatus, align, isTennis }: TeamColProps) {
  const { C } = useTheme();
  const isFinal = gameStatus === 'final';
  const isScheduled = gameStatus === 'scheduled';
  const nameColor = isFinal ? (team.winner ? C.winner : C.loser) : C.textPrimary;
  const scoreColor = isFinal
    ? team.winner ? C.winnerScore : C.loserScore
    : isScheduled ? C.textMuted
    : C.textPrimary;

  return (
    <View style={[styles.teamCol, align === 'right' && styles.teamColRight]}>
      {team.logo ? (
        <Image source={{ uri: team.logo }} style={styles.logo} contentFit="contain" recyclingKey={team.id} />
      ) : (
        <View style={[styles.logoPlaceholder, { backgroundColor: C.surfaceElevated }]}>
          <Text style={[styles.logoInitial, { color: C.textMuted }]}>{team.abbreviation.charAt(0)}</Text>
        </View>
      )}
      <Text style={[styles.abbrev, { color: nameColor }]}>{team.abbreviation}</Text>
      {team.record && <Text style={[styles.record, { color: C.textMuted }]}>{team.record}</Text>}
      <Text style={[styles.score, { color: scoreColor }]}>
        {isScheduled ? '--' : team.score}
      </Text>
      {isTennis && !isScheduled && (
        <Text style={[styles.setsLabel, { color: C.textMuted }]}>SETS</Text>
      )}
    </View>
  );
});

interface Props {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  status: GameStatus;
  statusText: string;
  sport?: string;
}

export const GameDetailHeader = memo(function GameDetailHeader({ homeTeam, awayTeam, status, statusText, sport }: Props) {
  const { C } = useTheme();
  const isTennis = sport === 'tennis';

  return (
    <View style={[styles.container, { backgroundColor: C.surface, borderBottomColor: C.border }]}>
      <TeamCol team={awayTeam} gameStatus={status} align="left" isTennis={isTennis} />

      <View style={styles.middle}>
        <StatusBadge status={status} statusText={statusText} />
        {status !== 'scheduled' && (
          <Text style={[styles.vs, { color: C.textMuted }]}>vs</Text>
        )}
      </View>

      <TeamCol team={homeTeam} gameStatus={status} align="right" isTennis={isTennis} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 36,
    borderBottomWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoInitial: {
    fontSize: 26,
    fontWeight: '900',
  },
  abbrev: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  record: {
    fontSize: 10,
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
    fontWeight: '700',
  },
  setsLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
});
