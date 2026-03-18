import React, { memo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import type { LeagueConfig } from '@/constants/sports';

interface Props {
  leagues: LeagueConfig[];
  selected: string;
  onSelect: (league: LeagueConfig) => void;
}

export const LeagueChipBar = memo(function LeagueChipBar({ leagues, selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {leagues.map(league => {
        const isActive = selected === league.league;
        return (
          <Pressable
            key={league.id}
            style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            onPress={() => onSelect(league)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {league.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: Colors.chipActive,
    borderColor: Colors.chipActiveBorder,
  },
  chipInactive: {
    backgroundColor: Colors.chipInactive,
    borderColor: Colors.chipInactiveBorder,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.chipInactiveText,
  },
  chipTextActive: {
    color: Colors.chipActiveText,
    fontWeight: '700',
  },
});
