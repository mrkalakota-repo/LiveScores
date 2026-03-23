import React, { useEffect, useRef, memo, useMemo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { GameStatus } from '@/api/types';

interface Props {
  status: GameStatus;
  statusText: string;
}

export const StatusBadge = memo(function StatusBadge({ status, statusText }: Props) {
  const { C } = useTheme();
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status !== 'live') return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.2, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [status, opacity]);

  const statusColors = useMemo(() => ({
    live:      { badge: { backgroundColor: C.liveBackground, borderColor: C.liveBorder },         text: C.live,      dot: C.live },
    halftime:  { badge: { backgroundColor: C.halftimeBackground, borderColor: C.halftimeBorder }, text: C.halftime,  dot: undefined },
    final:     { badge: { backgroundColor: C.finalBackground, borderColor: C.finalBorder },       text: C.final,     dot: undefined },
    scheduled: { badge: { backgroundColor: C.scheduledBackground, borderColor: C.scheduledBorder }, text: C.scheduled, dot: undefined },
  }), [C]);

  const { badge, text, dot } = statusColors[status];

  return (
    <View style={[styles.badge, badge]}>
      {status === 'live' && dot && (
        <Animated.View style={[styles.dot, { backgroundColor: dot, opacity }]} />
      )}
      <Text style={[styles.text, { color: text }]} numberOfLines={1}>
        {statusText}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
