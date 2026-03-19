import React, { memo, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorScheme } from '@/constants/themes';
import type { LeagueConfig } from '@/constants/sports';

interface Props {
  leagues: LeagueConfig[];
  selected: string;
  onSelect: (league: LeagueConfig) => void;
}

function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    scrollView: {
      flexShrink: 0,
      flexGrow: 0,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    container: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 8,
      gap: 8,
      flexDirection: 'row',
    },
    chip: {
      paddingHorizontal: 16,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipActive: {
      backgroundColor: C.chipActive,
      borderColor: C.chipActiveBorder,
      shadowColor: C.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 6,
    },
    chipInactive: {
      backgroundColor: C.chipInactive,
      borderColor: C.chipInactiveBorder,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '500',
      color: C.chipInactiveText,
    },
    chipTextActive: {
      color: C.chipActiveText,
      fontWeight: '700',
    },
  });
}

export const LeagueChipBar = memo(function LeagueChipBar({ leagues, selected, onSelect }: Props) {
  const { C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
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
