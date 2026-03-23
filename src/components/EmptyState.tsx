import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  sport?: string;
}

export function EmptyState({ sport }: Props) {
  const { C } = useTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: C.surfaceElevated }]}>
        <Ionicons name="calendar-outline" size={44} color={C.textMuted} />
      </View>
      <Text style={[styles.title, { color: C.textPrimary }]}>No Games Today</Text>
      <Text style={[styles.subtitle, { color: C.textMuted }]}>
        {sport ? `No ${sport.toUpperCase()} games are scheduled right now.` : 'Check back later for live scores.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: 80,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
});
