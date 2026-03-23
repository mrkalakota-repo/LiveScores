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

const THEME_NAMES: ThemeName[] = ['carbon', 'midnight', 'ember', 'frost', 'linen'];

export default function SettingsScreen() {
  const { themeName, setTheme, C } = useTheme();
  const { selectedIds, toggle } = useSportPreferences();

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: C.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Sport Picker ─────────────────────────────────────────────── */}
      <Text style={[styles.sectionLabel, { color: C.textMuted }]}>MY SPORTS</Text>
      <Text style={[styles.sectionHint, { color: C.textMuted }]}>
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
                { backgroundColor: C.surface, borderColor: active ? sport.tabColor + '60' : C.border },
                pressed && styles.rowPressed,
              ]}
              onPress={() => toggle(sport.id)}
              disabled={isLast}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active, disabled: isLast }}
            >
              <View style={[styles.sportIconBox, { backgroundColor: C.surfaceElevated, borderColor: sport.tabColor + '40' }]}>
                {sport.iconFamily === 'MaterialCommunityIcons' ? (
                  <MaterialCommunityIcons
                    name={sport.iconOutline as MCIName}
                    size={22}
                    color={active ? sport.tabColor : C.textMuted}
                  />
                ) : (
                  <Ionicons
                    name={sport.iconOutline as IoniconName}
                    size={22}
                    color={active ? sport.tabColor : C.textMuted}
                  />
                )}
              </View>

              <Text style={[styles.sportLabel, { color: active ? C.textPrimary : C.textMuted }]}>
                {sport.label}
              </Text>

              {isLast ? (
                <Ionicons name="lock-closed-outline" size={16} color={C.textMuted} />
              ) : (
                <View style={[styles.checkbox, { borderColor: C.border }, active && { backgroundColor: sport.tabColor, borderColor: sport.tabColor }]}>
                  {active && <Ionicons name="checkmark" size={13} color="#000" />}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* ── Color Theme ──────────────────────────────────────────────── */}
      <Text style={[styles.sectionLabel, styles.sectionLabelSpaced, { color: C.textMuted }]}>COLOR THEME</Text>
      <View style={styles.themeList}>
        {THEME_NAMES.map(name => {
          const meta = THEME_META[name];
          const isActive = themeName === name;
          return (
            <Pressable
              key={name}
              style={({ pressed }) => [
                styles.themeRow,
                { backgroundColor: meta.bg, borderColor: isActive ? meta.preview : meta.bg },
                pressed && styles.rowPressed,
              ]}
              onPress={() => setTheme(name)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
            >
              {/* Mini card preview */}
              <View style={[styles.miniCard, { backgroundColor: meta.surface }]}>
                <View style={[styles.miniAccent, { backgroundColor: meta.live }]} />
                <View style={styles.miniInner}>
                  <View style={[styles.miniLine, { backgroundColor: meta.textPrimary, width: 24 }]} />
                  <View style={[styles.miniLine, { backgroundColor: meta.textMuted, width: 20 }]} />
                </View>
                <View style={[styles.miniScore, { backgroundColor: meta.preview }]}>
                  <View style={[styles.miniScoreDot, { backgroundColor: meta.bg }]} />
                </View>
              </View>
              <View style={styles.themeMeta}>
                <Text style={[styles.themeLabel, { color: meta.textColor }]}>
                  {meta.label}
                </Text>
                <Text style={[styles.themeDesc, { color: meta.textColor, opacity: 0.6 }]}>
                  {meta.description}
                </Text>
              </View>
              {isActive && (
                <View style={[styles.checkCircle, { borderColor: meta.preview }]}>
                  <View style={[styles.checkFill, { backgroundColor: meta.preview }]} />
                </View>
              )}
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
    fontWeight: '900',
    letterSpacing: 1.5,
    color: Colors.textMuted,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionLabelSpaced: {
    marginTop: 32,
  },
  sectionHint: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 14,
    marginLeft: 4,
    lineHeight: 19,
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
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.border,
    paddingVertical: 14,
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
    fontSize: 16,
    fontWeight: '700',
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
    gap: 12,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    padding: 18,
    gap: 16,
  },
  miniCard: {
    width: 44,
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  miniAccent: {
    width: 3,
  },
  miniInner: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 6,
    gap: 4,
  },
  miniLine: {
    height: 3,
    borderRadius: 1.5,
    opacity: 0.6,
  },
  miniScore: {
    width: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniScoreDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  themeMeta: {
    flex: 1,
    gap: 4,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  themeDesc: {
    fontSize: 13,
    fontWeight: '500',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
