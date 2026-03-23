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
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    container: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      gap: 8,
      flexDirection: 'row',
    },
    chip: {
      paddingHorizontal: 16,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipActive: {
      backgroundColor: C.chipActive,
      shadowColor: C.accent,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: C.isDark ? 0.5 : 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    chipInactive: {
      backgroundColor: C.chipInactive,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: C.chipInactiveText,
    },
    chipTextActive: {
      color: C.chipActiveText,
      fontWeight: '800',
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
