import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { formatLastUpdated } from '@/utils/dateHelpers';

interface Props {
  updatedAt: number;
}

export function LastUpdatedBar({ updatedAt }: Props) {
  const { C } = useTheme();
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.bar}>
      <Ionicons name="time-outline" size={12} color={C.textMuted} />
      <Text style={[styles.text, { color: C.textMuted }]} maxFontSizeMultiplier={1.3}>Updated {formatLastUpdated(updatedAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
  },
  text: { fontSize: 11, fontWeight: '500', letterSpacing: 0.2 },
});
