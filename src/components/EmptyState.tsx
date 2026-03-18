import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface Props {
  sport?: string;
}

export function EmptyState({ sport }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name="calendar-outline" size={48} color={Colors.textMuted} />
      <Text style={styles.title}>No Games Today</Text>
      <Text style={styles.subtitle}>
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
    color: Colors.textSecondary,
    fontSize: 17,
    fontWeight: '600',
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
