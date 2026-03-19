import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useTheme, THEME_META } from '@/contexts/ThemeContext';
import { useSportPreferences } from '@/contexts/SportPreferencesContext';
import { SPORTS } from '@/constants/sports';
import type { ThemeName } from '@/constants/themes';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const THEME_NAMES: ThemeName[] = ['electric', 'emerald', 'sunset'];

export default function SettingsScreen() {
  const { themeName, setTheme, C } = useTheme();
  const { selectedIds, toggle } = useSportPreferences();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Sport Picker ─────────────────────────────────────────────── */}
      <Text style={styles.sectionLabel}>MY SPORTS</Text>
      <Text style={styles.sectionHint}>
        Selected sports appear as tabs. The rest are in the ··· menu.
      </Text>
      <View style={styles.sportList}>
        {SPORTS.map(sport => {
          const active = selectedIds.has(sport.id);
          const isLast = active && selectedIds.size === 1;
          return (
            <Pressable
              key={sport.id}
              style={({ pressed }) => [
                styles.sportRow,
                active && { borderColor: sport.tabColor + '60' },
                pressed && styles.rowPressed,
              ]}
              onPress={() => toggle(sport.id)}
              disabled={isLast}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active, disabled: isLast }}
            >
              <View style={[styles.sportIconBox, { borderColor: sport.tabColor + '40' }]}>
                {sport.iconFamily === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons
                    name={sport.iconOutline as MCIName}
                    size={22}
                    color={active ? sport.tabColor : Colors.textMuted}
                  />
                ) : (
                  <Ionicons
                    name={sport.iconOutline as IoniconName}
                    size={22}
                    color={active ? sport.tabColor : Colors.textMuted}
                  />
                )}
              </View>

              <Text style={[styles.sportLabel, active && { color: Colors.textPrimary }]}>
                {sport.label}
              </Text>

              {isLast ? (
                <Ionicons name="lock-closed-outline" size={16} color={Colors.textMuted} />
              ) : (
                <View style={[styles.checkbox, active && { backgroundColor: sport.tabColor, borderColor: sport.tabColor }]}>
                  {active && <Ionicons name="checkmark" size={13} color="#000" />}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* ── Color Theme ──────────────────────────────────────────────── */}
      <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>COLOR THEME</Text>
      <View style={styles.themeList}>
        {THEME_NAMES.map(name => {
          const meta = THEME_META[name];
          const isActive = themeName === name;
          return (
            <Pressable
              key={name}
              style={({ pressed }) => [
                styles.themeRow,
                isActive && { borderColor: C.accent },
                pressed && styles.rowPressed,
              ]}
              onPress={() => setTheme(name)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
            >
              <View style={[styles.themePreview, { backgroundColor: meta.preview }]} />
              <View style={styles.themeMeta}>
                <Text style={[styles.themeLabel, isActive && { color: C.accent }]}>
                  {meta.label}
                </Text>
                <Text style={styles.themeDesc}>{meta.description}</Text>
              </View>
              {isActive && <View style={[styles.checkDot, { backgroundColor: C.accent }]} />}
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginBottom: 6,
    marginLeft: 4,
  },
  sectionLabelSpaced: {
    marginTop: 28,
  },
  sectionHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 12,
    marginLeft: 4,
  },
  rowPressed: {
    opacity: 0.75,
  },
  // ── Sport rows ──────────────────────────────────────────────────────
  sportList: {
    gap: 8,
  },
  sportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 14,
  },
  sportIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  sportLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Theme rows ──────────────────────────────────────────────────────
  themeList: {
    gap: 10,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    gap: 14,
  },
  themePreview: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  themeMeta: {
    flex: 1,
    gap: 3,
  },
  themeLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  themeDesc: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  checkDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
