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
      <Ionicons name="calendar-outline" size={48} color={C.textMuted} />
      <Text style={[styles.title, { color: C.textSecondary }]}>No Games Today</Text>
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
    gap: 12,
    paddingBottom: 80,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
