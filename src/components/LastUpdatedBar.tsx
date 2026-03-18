import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { formatLastUpdated } from '@/utils/dateHelpers';

interface Props {
  updatedAt: number;
}

export function LastUpdatedBar({ updatedAt }: Props) {
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick(n => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={styles.bar}>
      <Ionicons name="time-outline" size={12} color={Colors.textMuted} />
      <Text style={styles.text}>Updated {formatLastUpdated(updatedAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  text: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
