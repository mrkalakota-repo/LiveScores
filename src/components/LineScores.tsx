import React, { memo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { TeamInfo } from '@/api/types';

interface Props {
  sport: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
}

function periodLabels(sport: string, count: number): string[] {
  switch (sport) {
    case 'football':
      return count <= 4
        ? ['Q1', 'Q2', 'Q3', 'Q4'].slice(0, count)
        : [...['Q1', 'Q2', 'Q3', 'Q4'], ...Array.from({ length: count - 4 }, (_, i) => `OT${i + 1 > 1 ? i + 1 : ''}`).map((_, i) => i === 0 ? 'OT' : `OT${i + 1}`)];
    case 'basketball':
      return count <= 4
        ? ['Q1', 'Q2', 'Q3', 'Q4'].slice(0, count)
        : ['Q1', 'Q2', 'Q3', 'Q4', ...Array.from({ length: count - 4 }, (_, i) => i === 0 ? 'OT' : `OT${i + 1}`)];
    case 'hockey':
      return count <= 3
        ? ['P1', 'P2', 'P3'].slice(0, count)
        : ['P1', 'P2', 'P3', ...Array.from({ length: count - 3 }, (_, i) => i === 0 ? 'OT' : `OT${i + 1}`)];
    case 'baseball':
      return Array.from({ length: count }, (_, i) => String(i + 1));
    case 'cricket':
      return Array.from({ length: count }, (_, i) => `Inn ${i + 1}`);
    case 'tennis':
      return Array.from({ length: count }, (_, i) => `S${i + 1}`);
    default:
      return Array.from({ length: count }, (_, i) => String(i + 1));
  }
}

export const LineScores = memo(function LineScores({ sport, homeTeam, awayTeam }: Props) {
  const awayLS = awayTeam.linescores ?? [];
  const homeLS = homeTeam.linescores ?? [];
  const periodCount = Math.max(awayLS.length, homeLS.length);

  if (periodCount === 0) return null;

  const isTennis = sport === 'tennis';
  const labels = periodLabels(sport, periodCount);
  const totalLabel = isTennis ? 'SETS' : 'T';

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>{isTennis ? 'SET SCORES' : 'LINE SCORE'}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header row */}
          <View style={styles.row}>
            <Text style={[styles.teamAbbrev, styles.headerCell]} />
            {labels.map(lbl => (
              <Text key={lbl} style={[styles.cell, styles.headerCell]}>{lbl}</Text>
            ))}
            <Text style={[styles.totalCell, styles.headerCell]}>{totalLabel}</Text>
          </View>

          {/* Away row */}
          <View style={[styles.row, styles.dataRow]}>
            <Text style={[styles.teamAbbrev, styles.teamLabel]}>{awayTeam.abbreviation}</Text>
            {labels.map((_, i) => {
              const av = awayLS[i];
              const hv = homeLS[i];
              const awayWinsSet = isTennis && av !== undefined && hv !== undefined && av > hv;
              return (
                <Text key={i} style={[styles.cell, awayWinsSet && styles.setWinner]}>
                  {av !== undefined ? String(av) : '-'}
                </Text>
              );
            })}
            <Text style={[styles.totalCell, awayTeam.winner && styles.winnerTotal]}>
              {isTennis ? String(awayLS.filter((v, i) => v > (homeLS[i] ?? 0)).length) : awayTeam.score}
            </Text>
          </View>

          {/* Home row */}
          <View style={[styles.row, styles.dataRow]}>
            <Text style={[styles.teamAbbrev, styles.teamLabel]}>{homeTeam.abbreviation}</Text>
            {labels.map((_, i) => {
              const hv = homeLS[i];
              const av = awayLS[i];
              const homeWinsSet = isTennis && hv !== undefined && av !== undefined && hv > av;
              return (
                <Text key={i} style={[styles.cell, homeWinsSet && styles.setWinner]}>
                  {hv !== undefined ? String(hv) : '-'}
                </Text>
              );
            })}
            <Text style={[styles.totalCell, homeTeam.winner && styles.winnerTotal]}>
              {isTennis ? String(homeLS.filter((v, i) => v > (awayLS[i] ?? 0)).length) : homeTeam.score}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

const COL_W = 40;
const TEAM_W = 52;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.textMuted,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 8,
  },
  teamAbbrev: {
    width: TEAM_W,
    fontSize: 13,
    fontWeight: '700',
  },
  teamLabel: {
    color: Colors.textPrimary,
  },
  headerCell: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  cell: {
    width: COL_W,
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textSecondary,
  },
  totalCell: {
    width: COL_W,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  winnerTotal: {
    color: Colors.winnerScore,
  },
  setWinner: {
    fontWeight: '900',
    color: Colors.winnerScore,
  },
});
