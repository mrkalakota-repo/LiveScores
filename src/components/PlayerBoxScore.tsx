import React, { memo, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorScheme } from '@/constants/themes';
import type { TeamBoxScore } from '@/api/types';

function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    wrapper: { gap: 4 },
    // Team tab bar
    tabBar: {
      flexDirection: 'row',
      borderRadius: 10,
      backgroundColor: C.surfaceElevated,
      padding: 3,
      marginBottom: 12,
    },
    tab: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    tabActive: {
      backgroundColor: C.accent,
    },
    tabText: {
      fontSize: 13,
      fontWeight: '800',
      color: C.textMuted,
      letterSpacing: 0.3,
    },
    tabTextActive: {
      color: '#fff',
    },
    // Category
    catHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 6,
      gap: 8,
    },
    catLabel: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 1,
      color: C.accent,
    },
    catLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: C.accent,
      opacity: 0.3,
    },
    // Table
    tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    playerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 7,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
    },
    playerRowAlt: {
      backgroundColor: C.surfaceElevated + '40',
    },
    nameCol: {
      width: 120,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingRight: 4,
    },
    nameColHeader: {
      width: 120,
    },
    playerName: {
      fontSize: 12,
      fontWeight: '700',
      color: C.textPrimary,
      flex: 1,
    },
    playerJersey: {
      fontSize: 10,
      fontWeight: '600',
      color: C.textMuted,
      width: 22,
    },
    headerLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: C.textMuted,
      letterSpacing: 0.3,
    },
    statValue: {
      fontSize: 12,
      fontWeight: '600',
      color: C.textSecondary,
    },
    statHighlight: {
      fontWeight: '900',
      color: C.textPrimary,
    },
    emptyText: {
      fontSize: 13,
      color: C.textMuted,
      textAlign: 'center',
      paddingVertical: 20,
    },
  });
}

// Stat columns that should be highlighted (bold) when non-zero
const HIGHLIGHT_STATS = new Set([
  'TD', 'INT', 'SACK', 'PTS', 'REB', 'AST', 'STL', 'BLK',
  'HR', 'RBI', 'SB', 'W', 'SV', 'G', 'A', 'SOG',
]);

interface CategoryTableProps {
  cat: TeamBoxScore['categories'][number];
  styles: ReturnType<typeof createStyles>;
  C: ColorScheme;
}

const CategoryTable = memo(function CategoryTable({ cat, styles, C }: CategoryTableProps) {
  const colW = Math.max(38, Math.min(52, 240 / Math.max(cat.labels.length, 1)));
  return (
    <View>
      <View style={styles.catHeader}>
        <Text style={styles.catLabel}>{cat.category.toUpperCase()}</Text>
        <View style={styles.catLine} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Column headers */}
          <View style={styles.tableHeader}>
            <View style={styles.nameColHeader}>
              <Text style={styles.headerLabel}>PLAYER</Text>
            </View>
            {cat.labels.map(lbl => (
              <Text
                key={lbl}
                style={[styles.headerLabel, { width: colW, textAlign: 'right' }]}
              >
                {lbl}
              </Text>
            ))}
          </View>

          {/* Player rows */}
          {cat.players.map((player, pi) => (
            <View
              key={player.id + pi}
              style={[styles.playerRow, pi % 2 === 1 && styles.playerRowAlt]}
            >
              <View style={styles.nameCol}>
                {player.jersey && (
                  <Text style={styles.playerJersey}>#{player.jersey}</Text>
                )}
                <Text style={styles.playerName} numberOfLines={1}>
                  {player.name}
                </Text>
              </View>
              {player.stats.map((val, si) => {
                const label = cat.labels[si] ?? '';
                const isHighlight = HIGHLIGHT_STATS.has(label)
                  && val !== '0' && val !== '-' && val !== '';
                return (
                  <Text
                    key={si}
                    style={[
                      styles.statValue,
                      { width: colW, textAlign: 'right' },
                      isHighlight && styles.statHighlight,
                    ]}
                  >
                    {val}
                  </Text>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
});

interface Props {
  boxScores: TeamBoxScore[];
}

export const PlayerBoxScore = memo(function PlayerBoxScore({ boxScores }: Props) {
  const { C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  const [activeTeam, setActiveTeam] = useState(0);

  if (boxScores.length === 0) return null;

  const team = boxScores[activeTeam] ?? boxScores[0];

  return (
    <View style={styles.wrapper}>
      {/* Team toggle tabs */}
      {boxScores.length > 1 && (
        <View style={styles.tabBar}>
          {boxScores.map((bs, i) => (
            <Pressable
              key={bs.teamAbbrev}
              style={[styles.tab, i === activeTeam && styles.tabActive]}
              onPress={() => setActiveTeam(i)}
            >
              <Text style={[styles.tabText, i === activeTeam && styles.tabTextActive]}>
                {bs.teamAbbrev}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Categories for selected team */}
      {team.categories.length === 0 ? (
        <Text style={styles.emptyText}>No player stats available</Text>
      ) : (
        team.categories.map(cat => (
            <CategoryTable key={cat.category} cat={cat} styles={styles} C={C} />
        ))
      )}
    </View>
  );
});
