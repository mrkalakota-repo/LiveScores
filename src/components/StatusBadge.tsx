import React, { useEffect, useRef, memo } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { GameStatus } from '@/api/types';

interface Props {
  status: GameStatus;
  statusText: string;
}

const STATUS_STYLES: Record<GameStatus, { badge: object; text: object; dotColor?: string }> = {
  live: { badge: { backgroundColor: Colors.liveBackground, borderColor: Colors.liveBorder }, text: { color: Colors.live }, dotColor: Colors.live },
  halftime: { badge: { backgroundColor: Colors.halftimeBackground, borderColor: Colors.halftimeBorder }, text: { color: Colors.halftime } },
  final: { badge: { backgroundColor: Colors.finalBackground, borderColor: Colors.finalBorder }, text: { color: Colors.final } },
  scheduled: { badge: { backgroundColor: Colors.scheduledBackground, borderColor: Colors.scheduledBorder }, text: { color: Colors.scheduled } },
};

export const StatusBadge = memo(function StatusBadge({ status, statusText }: Props) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status !== 'live') return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.15, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [status, opacity]);

  const { badge, text, dotColor } = STATUS_STYLES[status];

  return (
    <View style={[styles.badge, badge]}>
      {status === 'live' && dotColor && (
        <Animated.View style={[styles.dot, { backgroundColor: dotColor, opacity }]} />
      )}
      <Text style={[styles.text, text]} numberOfLines={1}>
        {statusText}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 7,
    borderWidth: 1,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
