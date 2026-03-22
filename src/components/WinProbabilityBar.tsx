import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import type { WinProbability } from '@/utils/winProbability';
import type { TeamInfo } from '@/api/types';

interface Props {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  probability: WinProbability;
}

const BASIS_LABEL: Record<WinProbability['basis'], string> = {
  score:  'Based on score, game state & stats',
  record: 'Based on season records',
  even:   '',
};

export const WinProbabilityBar = memo(function WinProbabilityBar({
  homeTeam,
  awayTeam,
  probability,
}: Props) {
  const { C } = useTheme();
  const awayLeading = probability.away > probability.home;
  const homeLeading = probability.home > probability.away;

  return (
    <View>
      {/* Team labels + percentages */}
      <View style={styles.header}>
        <View style={styles.teamSide}>
          <Text style={[styles.pct, awayLeading && styles.pctLeading]}>
            {probability.away}%
          </Text>
          <Text style={[styles.abbrev, awayLeading && styles.abbrevLeading]}>
            {awayTeam.abbreviation}
          </Text>
        </View>

        <Text style={styles.centerLabel}>WIN PROBABILITY</Text>

        <View style={[styles.teamSide, styles.teamSideRight]}>
          <Text style={[styles.abbrev, homeLeading && styles.abbrevLeading]}>
            {homeTeam.abbreviation}
          </Text>
          <Text style={[styles.pct, homeLeading && styles.pctLeading]}>
            {probability.home}%
          </Text>
        </View>
      </View>

      {/* Probability bar */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            styles.fillAway,
            { flex: probability.away },
            awayLeading && { backgroundColor: C.accent, opacity: 0.85 },
          ]}
        />
        <View style={styles.trackDivider} />
        <View
          style={[
            styles.fill,
            styles.fillHome,
            { flex: probability.home },
            homeLeading && { backgroundColor: C.accent, opacity: 0.85 },
          ]}
        />
      </View>

      {/* Basis label */}
      {BASIS_LABEL[probability.basis] ? (
        <Text style={styles.basis}>{BASIS_LABEL[probability.basis]}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  teamSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  teamSideRight: {
    justifyContent: 'flex-end',
  },
  pct: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textMuted,
    letterSpacing: -0.5,
  },
  pctLeading: {
    color: Colors.textPrimary,
  },
  abbrev: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.3,
    paddingBottom: 2,
  },
  abbrevLeading: {
    color: Colors.textSecondary,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingBottom: 8,
    paddingHorizontal: 6,
  },
  track: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceElevated,
  },
  fill: {
    height: '100%',
  },
  fillAway: {
    backgroundColor: Colors.surfaceElevated,
    borderRightWidth: 0,
  },
  fillHome: {
    backgroundColor: Colors.surfaceElevated,
  },
  trackDivider: {
    width: 2,
    height: '100%',
    backgroundColor: Colors.background,
  },
  basis: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 0.2,
  },
});
