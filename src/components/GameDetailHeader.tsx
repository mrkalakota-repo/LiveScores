import React, { memo, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorScheme } from '@/constants/themes';
import { StatusBadge } from './StatusBadge';
import type { GameStatus, TeamInfo } from '@/api/types';

function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      paddingVertical: 40,
      backgroundColor: C.surface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
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
      width: 76,
      height: 76,
    },
    logoPlaceholder: {
      width: 76,
      height: 76,
      borderRadius: 38,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.surfaceElevated,
    },
    logoInitial: {
      fontSize: 28,
      fontWeight: '900',
      color: C.textMuted,
    },
    abbrev: {
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    record: {
      fontSize: 11,
      fontWeight: '500',
    },
    score: {
      fontSize: 64,
      fontWeight: '900',
      letterSpacing: -2,
      lineHeight: 70,
    },
    scoreCricket: {
      fontSize: 36,
      letterSpacing: -1,
      lineHeight: 42,
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
}

interface TeamColProps {
  team: TeamInfo;
  gameStatus: GameStatus;
  align: 'left' | 'right';
  isTennis?: boolean;
  isCricket?: boolean;
}

const TeamCol = memo(function TeamCol({ team, gameStatus, align, isTennis, isCricket }: TeamColProps) {
  const { C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
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
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoInitial}>{team.abbreviation.charAt(0)}</Text>
        </View>
      )}
      <Text style={[styles.abbrev, { color: nameColor }]}>{team.abbreviation}</Text>
      {team.record && <Text style={[styles.record, { color: C.textMuted }]}>{team.record}</Text>}
      <Text style={[
        styles.score,
        isCricket && styles.scoreCricket,
        { color: scoreColor },
      ]}>
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
  const styles = useMemo(() => createStyles(C), [C]);
  const isTennis = sport === 'tennis';
  const isCricket = sport === 'cricket';

  return (
    <View style={styles.container}>
      <TeamCol team={awayTeam} gameStatus={status} align="left" isTennis={isTennis} isCricket={isCricket} />

      <View style={styles.middle}>
        <StatusBadge status={status} statusText={statusText} />
        {status !== 'scheduled' && (
          <Text style={[styles.vs, { color: C.textMuted }]}>vs</Text>
        )}
      </View>

      <TeamCol team={homeTeam} gameStatus={status} align="right" isTennis={isTennis} isCricket={isCricket} />
    </View>
  );
});
