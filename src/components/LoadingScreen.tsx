import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import type { ColorScheme } from '@/constants/themes';

function SkeletonBox({ style }: { style: object }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return <Animated.View style={[style, { opacity }]} />;
}

function createStyles(C: ColorScheme) {
  return StyleSheet.create({
    container: { paddingTop: 12 },
    card: {
      backgroundColor: C.surface,
      marginHorizontal: 16,
      marginVertical: 6,
      borderRadius: 20,
      padding: 16,
      gap: 12,
      shadowColor: C.isDark ? '#000' : '#64748b',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: C.isDark ? 0.4 : 0.08,
      shadowRadius: 16,
      elevation: 6,
    },
    badge: {
      height: 22,
      width: 72,
      borderRadius: 8,
      backgroundColor: C.surfaceElevated,
    },
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    logo: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: C.surfaceElevated,
    },
    name: {
      height: 14,
      width: 80,
      borderRadius: 7,
      backgroundColor: C.surfaceElevated,
    },
    score: {
      height: 24,
      width: 36,
      borderRadius: 8,
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
