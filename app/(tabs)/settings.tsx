import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import { useTheme, THEME_META } from '@/contexts/ThemeContext';
import type { ThemeName } from '@/constants/themes';

const THEME_NAMES: ThemeName[] = ['electric', 'emerald', 'sunset'];

export default function SettingsScreen() {
  const { themeName, setTheme, C } = useTheme();

  return (
    <View style={styles.screen}>
      <Text style={styles.sectionLabel}>COLOR THEME</Text>
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
                pressed && styles.themeRowPressed,
              ]}
              onPress={() => setTheme(name)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isActive }}
            >
              <View style={[styles.preview, { backgroundColor: meta.preview }]} />
              <View style={styles.themeMeta}>
                <Text style={[styles.themeLabel, isActive && { color: C.accent }]}>
                  {meta.label}
                </Text>
                <Text style={styles.themeDesc}>{meta.description}</Text>
              </View>
              {isActive && (
                <View style={[styles.checkDot, { backgroundColor: C.accent }]} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: Colors.textMuted,
    marginBottom: 12,
    marginLeft: 4,
  },
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
  themeRowPressed: {
    opacity: 0.75,
  },
  preview: {
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
