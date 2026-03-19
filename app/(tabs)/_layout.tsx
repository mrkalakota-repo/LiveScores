import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { SPORTS } from '@/constants/sports';
import type { SportConfig } from '@/constants/sports';
import { useLiveGames } from '@/contexts/LiveGamesContext';
import { useCricketLeagues } from '@/hooks/useCricketLeagues';
import { useScoreboard } from '@/hooks/useScoreboard';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];
type MCIName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Runs in the layout (always mounted) so the cricket live-dot appears
 * without the user having to visit the cricket tab first.
 * Tab screens are lazy-loaded by Expo Router, so without this the cricket
 * screen never mounts and setLiveCount is never called.
 */
function CricketLiveTracker() {
  const { data: leagues } = useCricketLeagues();
  const firstLeague = leagues?.[0];
  const { data } = useScoreboard(
    firstLeague?.sport ?? 'cricket',
    firstLeague?.league ?? '',   // empty until leagues load → query stays disabled
  );
  const { setLiveCount } = useLiveGames();

  useEffect(() => {
    if (data !== undefined) {
      const count = data.filter(g => g.status === 'live' || g.status === 'halftime').length;
      setLiveCount('cricket', count);
    }
  }, [data, setLiveCount]);

  return null;
}

interface LiveTabIconProps {
  sport: SportConfig;
  color: string;
  focused: boolean;
  hasLive: boolean;
}

function LiveTabIcon({ sport, color, focused, hasLive }: LiveTabIconProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!hasLive || focused) {
      pulseAnim.setValue(1);
      return;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.2, duration: 550, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 550, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [hasLive, focused, pulseAnim]);

  const iconColor = !focused && hasLive ? Colors.tabLive : color;
  const iconName = focused ? sport.icon : sport.iconOutline;

  return (
    <View style={styles.iconWrap}>
      {sport.iconFamily === 'MaterialCommunityIcons' ? (
        <MaterialCommunityIcons name={iconName as MCIName} size={22} color={iconColor} />
      ) : (
        <Ionicons name={iconName as IoniconName} size={22} color={iconColor} />
      )}
      {!focused && hasLive && (
        <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
      )}
    </View>
  );
}

export default function TabLayout() {
  const { liveCounts } = useLiveGames();
  const { C } = useTheme();

  return (
    <>
      <CricketLiveTracker />
      <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
          shadowColor: 'transparent',
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTintColor: Colors.textPrimary,
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 17,
          letterSpacing: 0.3,
        },
        tabBarStyle: {
          backgroundColor: Colors.tabBarBackground,
          borderTopWidth: 0,
          height: 58,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
          elevation: 16,
        },
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 0.3,
        },
        // Fixed width per item so no tab ever wraps its label to a second line
        tabBarItemStyle: {
          height: 56,
          width: 64,
          justifyContent: 'center',
        },
        tabBarScrollEnabled: true,
        sceneStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      {SPORTS.map(sport => (
        <Tabs.Screen
          key={sport.id}
          name={sport.id}
          options={{
            title: sport.label,
            tabBarActiveTintColor: sport.tabColor,
            tabBarIcon: ({ color, focused }) => (
              <LiveTabIcon
                sport={sport}
                color={color}
                focused={focused}
                hasLive={(liveCounts[sport.id] ?? 0) > 0}
              />
            ),
          }}
        />
      ))}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarActiveTintColor: C.accent,
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveDot: {
    position: 'absolute',
    top: -3,
    right: -5,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.tabLive,
  },
});
