import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/colors';

function SkeletonBox({ style }: { style: object }) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.9, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View style={[style, { opacity }]} />;
}

function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonBox style={styles.badge} />
      <View style={styles.teamRow}>
        <SkeletonBox style={styles.logo} />
        <SkeletonBox style={styles.name} />
        <SkeletonBox style={styles.score} />
      </View>
      <View style={styles.teamRow}>
        <SkeletonBox style={styles.logo} />
        <SkeletonBox style={[styles.name, { width: 60 }]} />
        <SkeletonBox style={styles.score} />
      </View>
    </View>
  );
}

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    marginHorizontal: 12,
    marginVertical: 5,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  badge: {
    height: 20,
    width: 70,
    borderRadius: 6,
    backgroundColor: Colors.surfaceElevated,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
  },
  name: {
    height: 14,
    width: 80,
    borderRadius: 4,
    backgroundColor: Colors.surfaceElevated,
  },
  score: {
    height: 20,
    width: 32,
    borderRadius: 4,
    backgroundColor: Colors.surfaceElevated,
    marginLeft: 'auto',
  },
});
