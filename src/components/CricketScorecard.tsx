import React, { memo, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorScheme } from '@/constants/themes';
import type { CricketInningsData } from '@/api/types';

function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    wrapper: { gap: 16 },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 1.5,
      color: C.accent,
    },
    sectionLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.accent,
      opacity: 0.3,
    },
    inningsCard: {
      backgroundColor: C.surface,
      borderRadius: 16,
      padding: 14,
      gap: 12,
    },
    inningsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    inningsTeam: {
      fontSize: 15,
      fontWeight: '900',
      color: C.textPrimary,
      letterSpacing: 0.3,
    },
    inningsScore: {
      fontSize: 15,
      fontWeight: '900',
      color: C.accent,
    },
    inningsMeta: {
      flexDirection: 'row',
      gap: 16,
    },
    metaItem: {
      fontSize: 11,
      color: C.textMuted,
      fontWeight: '600',
    },
    metaValue: {
      fontWeight: '800',
      color: C.textSecondary,
    },
    // Table shared
    tableHeader: {
      flexDirection: 'row',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 7,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    tableRowLast: {
      borderBottomWidth: 0,
    },
    // Batting
    batName: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: C.textPrimary,
    },
    batNameBatting: {
      color: C.accent,
    },
    batDismissal: {
      fontSize: 10,
      color: C.textMuted,
      marginTop: 1,
    },
    batCol: {
      width: 36,
      textAlign: 'right',
      fontSize: 12,
      fontWeight: '600',
      color: C.textSecondary,
    },
    batColHeader: {
      width: 36,
      textAlign: 'right',
      fontSize: 10,
      fontWeight: '700',
      color: C.textMuted,
      letterSpacing: 0.3,
    },
    batRuns: {
      fontWeight: '900',
      color: C.textPrimary,
    },
    // Bowling
    bowlName: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: C.textPrimary,
    },
    bowlCol: {
      width: 40,
      textAlign: 'right',
      fontSize: 12,
      fontWeight: '600',
      color: C.textSecondary,
    },
    bowlColHeader: {
      width: 40,
      textAlign: 'right',
      fontSize: 10,
      fontWeight: '700',
      color: C.textMuted,
      letterSpacing: 0.3,
    },
    bowlWickets: {
      fontWeight: '900',
      color: C.textPrimary,
    },
    // Recent overs
    oversRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    oversLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: C.textMuted,
      letterSpacing: 0.5,
    },
    overBall: {
      width: 24,
      height: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.surfaceElevated,
    },
    overBallText: {
      fontSize: 11,
      fontWeight: '800',
      color: C.textSecondary,
    },
    subLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: C.textMuted,
      letterSpacing: 0.8,
      marginBottom: 4,
    },
  });
}

interface Props {
  innings: CricketInningsData[];
}

export const CricketScorecard = memo(function CricketScorecard({ innings }: Props) {
  const { C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <View style={styles.wrapper}>
      {innings.map((inn, idx) => (
        <View key={`${inn.teamAbbrev}-${idx}`} style={styles.inningsCard}>
          {/* Innings header */}
          <View style={styles.inningsHeader}>
            <Text style={styles.inningsTeam}>{inn.teamAbbrev}</Text>
            <Text style={styles.inningsScore}>{inn.score}</Text>
          </View>

          {/* Meta: overs, run rate, extras */}
          <View style={styles.inningsMeta}>
            {inn.overs ? (
              <Text style={styles.metaItem}>
                Overs: <Text style={styles.metaValue}>{inn.overs}</Text>
              </Text>
            ) : null}
            {inn.runRate ? (
              <Text style={styles.metaItem}>
                RR: <Text style={styles.metaValue}>{inn.runRate}</Text>
              </Text>
            ) : null}
            {inn.extras ? (
              <Text style={styles.metaItem}>
                Extras: <Text style={styles.metaValue}>{inn.extras}</Text>
              </Text>
            ) : null}
          </View>

          {/* Batting scorecard */}
          {inn.batsmen.length > 0 && (
            <View>
              <Text style={styles.subLabel}>BATTING</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.batName, { color: C.textMuted, fontSize: 10, fontWeight: '700' }]}>Batter</Text>
                    <Text style={styles.batColHeader}>R</Text>
                    <Text style={styles.batColHeader}>B</Text>
                    <Text style={styles.batColHeader}>4s</Text>
                    <Text style={styles.batColHeader}>6s</Text>
                    <Text style={styles.batColHeader}>SR</Text>
                  </View>
                  {inn.batsmen.map((bat, bi) => (
                    <View
                      key={`${bat.name}-${bi}`}
                      style={[styles.tableRow, bi === inn.batsmen.length - 1 && styles.tableRowLast]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[styles.batName, bat.isBatting && styles.batNameBatting]}
                          numberOfLines={1}
                        >
                          {bat.name}{bat.isBatting ? ' *' : ''}
                        </Text>
                        {bat.dismissal ? (
                          <Text style={styles.batDismissal} numberOfLines={1}>{bat.dismissal}</Text>
                        ) : null}
                      </View>
                      <Text style={[styles.batCol, styles.batRuns]}>{bat.runs}</Text>
                      <Text style={styles.batCol}>{bat.balls}</Text>
                      <Text style={styles.batCol}>{bat.fours}</Text>
                      <Text style={styles.batCol}>{bat.sixes}</Text>
                      <Text style={styles.batCol}>{bat.strikeRate || '-'}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Bowling scorecard */}
          {inn.bowlers.length > 0 && (
            <View>
              <Text style={styles.subLabel}>BOWLING</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.bowlName, { color: C.textMuted, fontSize: 10, fontWeight: '700' }]}>Bowler</Text>
                    <Text style={styles.bowlColHeader}>O</Text>
                    <Text style={styles.bowlColHeader}>M</Text>
                    <Text style={styles.bowlColHeader}>R</Text>
                    <Text style={styles.bowlColHeader}>W</Text>
                    <Text style={styles.bowlColHeader}>Econ</Text>
                  </View>
                  {inn.bowlers.map((bowl, bi) => (
                    <View
                      key={`${bowl.name}-${bi}`}
                      style={[styles.tableRow, bi === inn.bowlers.length - 1 && styles.tableRowLast]}
                    >
                      <Text style={styles.bowlName} numberOfLines={1}>{bowl.name}</Text>
                      <Text style={styles.bowlCol}>{bowl.overs}</Text>
                      <Text style={styles.bowlCol}>{bowl.maidens}</Text>
                      <Text style={styles.bowlCol}>{bowl.runs}</Text>
                      <Text style={[styles.bowlCol, styles.bowlWickets]}>{bowl.wickets}</Text>
                      <Text style={styles.bowlCol}>{bowl.economy || '-'}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Recent overs */}
          {inn.recentOvers.length > 0 && (
            <View style={styles.oversRow}>
              <Text style={styles.oversLabel}>RECENT</Text>
              {inn.recentOvers.map((runs, i) => (
                <View key={i} style={styles.overBall}>
                  <Text style={styles.overBallText}>{runs}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );
});
