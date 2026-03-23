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
    // Cricket uses a vertical stacked layout
    containerCricket: {
      flexDirection: 'column',
      alignItems: 'stretch',
      paddingHorizontal: 20,
      paddingVertical: 28,
      gap: 16,
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
    middle: {
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 8,
    },
    vs: {
      fontSize: 13,
      fontWeight: '700',
    },
    // ── Tennis set-by-set layout ────────────────────────────────────────
    tennisContainer: {
      flexDirection: 'column',
      alignItems: 'stretch',
      paddingHorizontal: 20,
      paddingVertical: 28,
      gap: 16,
    },
    tennisStatusRow: {
      alignItems: 'center',
      paddingBottom: 4,
    },
    tennisPlayerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 6,
    },
    tennisLogo: {
      width: 32,
      height: 32,
    },
    tennisLogoPlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.surfaceElevated,
    },
    tennisLogoInitial: {
      fontSize: 14,
      fontWeight: '900',
      color: C.textMuted,
    },
    tennisName: {
      flex: 1,
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 0.2,
    },
    tennisSetsRow: {
      flexDirection: 'row',
      gap: 4,
    },
    tennisSetCell: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tennisSetText: {
      fontSize: 16,
      fontWeight: '700',
    },
    tennisSetWon: {
      fontWeight: '900',
    },
    tennisSetsWon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
    },
    tennisSetsWonText: {
      fontSize: 18,
      fontWeight: '900',
    },
    tennisHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 4,
      marginBottom: 2,
    },
    tennisHeaderSpacer: {
      flex: 1,
    },
    tennisHeaderLabel: {
      width: 32,
      textAlign: 'center',
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.3,
    },
    tennisHeaderTotal: {
      width: 36,
      textAlign: 'center',
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.3,
      marginLeft: 4,
    },
    tennisDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
      marginVertical: 2,
    },
    // ── Cricket stacked rows ──────────────────────────────────────────
    cricketStatusRow: {
      alignItems: 'center',
      paddingBottom: 4,
    },
    cricketTeamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 8,
    },
    cricketLogo: {
      width: 44,
      height: 44,
    },
    cricketLogoPlaceholder: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.surfaceElevated,
    },
    cricketLogoInitial: {
      fontSize: 18,
      fontWeight: '900',
      color: C.textMuted,
    },
    cricketName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    cricketScore: {
      fontSize: 22,
      fontWeight: '900',
      letterSpacing: -0.5,
      textAlign: 'right',
    },
    cricketDivider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.border,
      marginVertical: 2,
    },
  });
}

interface TeamColProps {
  team: TeamInfo;
  gameStatus: GameStatus;
  align: 'left' | 'right';
}

const TeamCol = memo(function TeamCol({ team, gameStatus, align }: TeamColProps) {
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
      <Text style={[styles.score, { color: scoreColor }]}>
        {isScheduled ? '--' : team.score}
      </Text>
    </View>
  );
});

interface TennisPlayerRowProps {
  team: TeamInfo;
  opponentLinescores: number[];
  gameStatus: GameStatus;
}

const TennisPlayerRow = memo(function TennisPlayerRow({ team, opponentLinescores, gameStatus }: TennisPlayerRowProps) {
  const { C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const isFinal = gameStatus === 'final';
  const isScheduled = gameStatus === 'scheduled';
  const nameColor = isFinal ? (team.winner ? C.winner : C.loser) : C.textPrimary;
  const ls = team.linescores ?? [];
  const setsWon = ls.filter((g, i) => g > (opponentLinescores[i] ?? 0)).length;

  return (
    <View style={styles.tennisPlayerRow}>
      {team.logo ? (
        <Image source={{ uri: team.logo }} style={styles.tennisLogo} contentFit="contain" recyclingKey={team.id} />
      ) : (
        <View style={styles.tennisLogoPlaceholder}>
          <Text style={styles.tennisLogoInitial}>{team.abbreviation.charAt(0)}</Text>
        </View>
      )}
      <Text style={[styles.tennisName, { color: nameColor }]} numberOfLines={1}>
        {team.abbreviation}
      </Text>
      <View style={styles.tennisSetsRow}>
        {ls.map((games, i) => {
          const oppGames = opponentLinescores[i] ?? 0;
          const wonSet = games > oppGames;
          return (
            <View
              key={i}
              style={[
                styles.tennisSetCell,
                { backgroundColor: C.surfaceElevated },
                wonSet && { backgroundColor: C.accent + '22' },
              ]}
            >
              <Text style={[
                styles.tennisSetText,
                { color: C.textSecondary },
                wonSet && [styles.tennisSetWon, { color: C.accent }],
              ]}>
                {games}
              </Text>
            </View>
          );
        })}
      </View>
      {!isScheduled && (
        <View style={[styles.tennisSetsWon, { backgroundColor: team.winner ? C.accent + '22' : C.surfaceElevated }]}>
          <Text style={[styles.tennisSetsWonText, { color: team.winner ? C.accent : C.textSecondary }]}>
            {setsWon}
          </Text>
        </View>
      )}
    </View>
  );
});

interface CricketTeamRowProps {
  team: TeamInfo;
  gameStatus: GameStatus;
}

const CricketTeamRow = memo(function CricketTeamRow({ team, gameStatus }: CricketTeamRowProps) {
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
    <View style={styles.cricketTeamRow}>
      {team.logo ? (
        <Image source={{ uri: team.logo }} style={styles.cricketLogo} contentFit="contain" recyclingKey={team.id} />
      ) : (
        <View style={styles.cricketLogoPlaceholder}>
          <Text style={styles.cricketLogoInitial}>{team.abbreviation.charAt(0)}</Text>
        </View>
      )}
      <Text style={[styles.cricketName, { color: nameColor }]} numberOfLines={1}>
        {team.displayName}
      </Text>
      <Text style={[styles.cricketScore, { color: scoreColor }]}>
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
  sport?: string;
}

export const GameDetailHeader = memo(function GameDetailHeader({ homeTeam, awayTeam, status, statusText, sport }: Props) {
  const { C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const isTennis = sport === 'tennis';
  const isCricket = sport === 'cricket';

  if (isCricket) {
    return (
      <View style={[styles.container, styles.containerCricket]}>
        <View style={styles.cricketStatusRow}>
          <StatusBadge status={status} statusText={statusText} />
        </View>
        <CricketTeamRow team={awayTeam} gameStatus={status} />
        <View style={styles.cricketDivider} />
        <CricketTeamRow team={homeTeam} gameStatus={status} />
      </View>
    );
  }

  if (isTennis) {
    const awayLS = awayTeam.linescores ?? [];
    const homeLS = homeTeam.linescores ?? [];
    const setCount = Math.max(awayLS.length, homeLS.length);
    const setLabels = Array.from({ length: setCount }, (_, i) => `S${i + 1}`);

    return (
      <View style={[styles.container, styles.tennisContainer]}>
        <View style={styles.tennisStatusRow}>
          <StatusBadge status={status} statusText={statusText} />
        </View>

        {/* Column headers: spacer + S1 S2 S3 ... + SETS */}
        {setCount > 0 && status !== 'scheduled' && (
          <View style={styles.tennisHeaderRow}>
            {/* Logo + name spacer */}
            <View style={{ width: 32 }} />
            <View style={styles.tennisHeaderSpacer} />
            {setLabels.map(lbl => (
              <Text key={lbl} style={[styles.tennisHeaderLabel, { color: C.textMuted }]}>{lbl}</Text>
            ))}
            <Text style={[styles.tennisHeaderTotal, { color: C.textMuted }]}>SETS</Text>
          </View>
        )}

        <TennisPlayerRow team={awayTeam} opponentLinescores={homeLS} gameStatus={status} />
        <View style={styles.tennisDivider} />
        <TennisPlayerRow team={homeTeam} opponentLinescores={awayLS} gameStatus={status} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TeamCol team={awayTeam} gameStatus={status} align="left" />

      <View style={styles.middle}>
        <StatusBadge status={status} statusText={statusText} />
        {status !== 'scheduled' && (
          <Text style={[styles.vs, { color: C.textMuted }]}>vs</Text>
        )}
      </View>

      <TeamCol team={homeTeam} gameStatus={status} align="right" />
    </View>
  );
});
