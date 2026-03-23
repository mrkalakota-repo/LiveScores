import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorScheme } from '@/constants/themes';

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

function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    container: { paddingTop: 8 },
    card: {
      backgroundColor: C.surface,
      marginHorizontal: 12,
      marginVertical: 8,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: C.border,
      gap: 10,
    },
    badge: {
      height: 20,
      width: 70,
      borderRadius: 6,
      backgroundColor: C.surfaceElevated,
    },
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    logo: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: C.surfaceElevated,
    },
    name: {
      height: 14,
      width: 80,
      borderRadius: 4,
      backgroundColor: C.surfaceElevated,
    },
    score: {
      height: 20,
      width: 32,
      borderRadius: 4,
      backgroundColor: C.surfaceElevated,
      marginLeft: 'auto',
    },
  });
}

function SkeletonCard({ styles }: { styles: ReturnType<typeof createStyles> }) {
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
  const { C } = useTheme();
  const styles = useMemo(() => createStyles(C), [C]);
  return (
    <View style={styles.container}>
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonCard key={i} styles={styles} />
      ))}
    </View>
  );
}
