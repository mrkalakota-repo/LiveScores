import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { Play, TeamInfo } from '@/api/types';

interface Props {
  awayTeam: TeamInfo;
  homeTeam: TeamInfo;
  /** e.g. "30:15", "Deuce", "Advantage Djokovic", "Set 3" */
  statusText: string;
  recentPlays: Play[];
}

/** Parse a tennis point score string into { away, home } display values. */
function parseCurrentPoint(statusText: string): { away: string; home: string } | null {
  // "30:15" or "40:30" — colon-separated game points
  const colonMatch = statusText.match(/^(\d+|AD)\s*:\s*(\d+|AD)$/i);
  if (colonMatch) return { away: colonMatch[1], home: colonMatch[2] };

  // "30-15" or "40-30"
  const dashMatch = statusText.match(/^(\d+|AD)\s*-\s*(\d+|AD)$/i);
  if (dashMatch) return { away: dashMatch[1], home: dashMatch[2] };

  // "Deuce" or "DEUCE"
  if (/^deuce$/i.test(statusText.trim())) return { away: '40', home: '40' };

  // "Advantage Federer" — we don't know which side so show ADV
  if (/^adv(antage)?/i.test(statusText.trim())) return null;

  return null;
}

/** Map a tennis point number to display label (0→0, 1→15, 2→30, 3→40, AD→AD) */
function pointLabel(raw: string): string {
  switch (raw) {
    case '0': return '0';
    case '1': return '15';
    case '2': return '30';
    case '3': return '40';
    default: return raw; // already formatted (15, 30, 40, AD, Deuce)
  }
}

export const TennisPointBoard = memo(function TennisPointBoard({
  awayTeam,
  homeTeam,
  statusText,
  recentPlays,
}: Props) {
  const { C } = useTheme();
  const point = parseCurrentPoint(statusText);

  // Filter plays to point-level events (skip set/game announcements)
  const pointPlays = recentPlays.filter(p =>
    p.text && !/^(set|game|match)/i.test(p.text.trim())
  ).slice(0, 10);

  if (!point && pointPlays.length === 0) return null;

  return (
    <View style={styles.wrapper}>

      {/* Current game score */}
      {point && (
        <>
          <Text style={[styles.sectionTitle, { color: C.accent }]}>CURRENT GAME</Text>
          <View style={[styles.scoreBoard, { backgroundColor: C.surfaceElevated, borderColor: C.border }]}>
            <View style={styles.scoreCol}>
              <Text style={[styles.playerName, { color: C.textSecondary }]} numberOfLines={1}>
                {awayTeam.abbreviation}
              </Text>
              <Text style={[styles.gamePoint, { color: C.textPrimary }]}>
                {pointLabel(point.away)}
              </Text>
            </View>
            <View style={[styles.scoreDivider, { backgroundColor: C.border }]} />
            <View style={styles.scoreCol}>
              <Text style={[styles.playerName, { color: C.textSecondary }]} numberOfLines={1}>
                {homeTeam.abbreviation}
              </Text>
              <Text style={[styles.gamePoint, { color: C.textPrimary }]}>
                {pointLabel(point.home)}
              </Text>
            </View>
          </View>
          {/* Show special status text below score if not a plain "30:15" pattern */}
          {(/deuce|advantage|adv/i.test(statusText)) && (
            <Text style={[styles.statusLabel, { color: C.accent }]}>{statusText}</Text>
          )}
        </>
      )}

      {/* Point-by-point play log */}
      {pointPlays.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced, { color: C.accent }]}>
            POINT HISTORY
          </Text>
          {pointPlays.map((play, i) => (
            <View
              key={play.id}
              style={[
                styles.playRow,
                i > 0 && { borderTopWidth: 1, borderTopColor: C.borderSubtle },
              ]}
            >
              {play.team && (
                <View style={[
                  styles.teamPill,
                  {
                    backgroundColor: play.team === awayTeam.abbreviation
                      ? C.scheduledBackground : C.surfaceElevated,
                    borderColor: play.team === awayTeam.abbreviation
                      ? C.scheduledBorder : C.border,
                  },
                ]}>
                  <Text style={[styles.teamPillText, { color: C.textSecondary }]}>
                    {play.team}
                  </Text>
                </View>
              )}
              <Text style={[styles.playText, { color: C.textSecondary }]} numberOfLines={2}>
                {play.text}
              </Text>
              {play.isScore && (
                <View style={[styles.scoreDot, { backgroundColor: C.winnerScore }]} />
              )}
            </View>
          ))}
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  sectionTitleSpaced: {
    marginTop: 18,
  },
  scoreBoard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 6,
  },
  scoreCol: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    gap: 6,
  },
  playerName: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  gamePoint: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreDivider: {
    width: 1,
    alignSelf: 'stretch',
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  playRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 10,
  },
  teamPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  teamPillText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  playText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  scoreDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
});
