import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useSportPreferences } from '@/contexts/SportPreferencesContext';
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
 */
function CricketLiveTracker() {
  const { data: leagues } = useCricketLeagues();
  const firstLeague = leagues?.[0];
  const { data } = useScoreboard(
    firstLeague?.sport ?? 'cricket',
    firstLeague?.league ?? '',
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
        <MaterialCommunityIcons name={iconName as MCIName} size={24} color={iconColor} />
      ) : (
        <Ionicons name={iconName as IoniconName} size={24} color={iconColor} />
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
  const { isSelected } = useSportPreferences();
  const insets = useSafeAreaInsets();

  // Does any unselected sport have live games?
  const morHasLive = SPORTS.some(s => !isSelected(s.id) && (liveCounts[s.id] ?? 0) > 0);

  // Account for Android gesture nav / 3-button nav bar
  const tabBarHeight = 62 + (Platform.OS === 'android' ? insets.bottom : 0);

  return (
    <>
      <CricketLiveTracker />
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: C.background,
            shadowColor: 'transparent',
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: C.border,
          },
          headerTintColor: C.textPrimary,
          headerTitleStyle: {
            fontWeight: '900',
            fontSize: 20,
            letterSpacing: -0.3,
          },
          tabBarStyle: {
            backgroundColor: C.tabBarBackground,
            borderTopWidth: 0,
            height: tabBarHeight,
            paddingBottom: Platform.OS === 'android' ? insets.bottom : 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -8 },
            shadowOpacity: C.isDark ? 0.6 : 0.08,
            shadowRadius: 20,
            elevation: 20,
          },
          tabBarInactiveTintColor: C.tabInactive,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.2,
            marginTop: -2,
          },
          tabBarItemStyle: {
            height: 60,
            width: 68,
            justifyContent: 'center',
          },
          tabBarScrollEnabled: true,
          sceneStyle: {
            backgroundColor: C.background,
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
              // href: null hides the tab but keeps the route navigable
              href: isSelected(sport.id) ? undefined : null,
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

        {/* "More" tab — only visible when at least one sport is hidden */}
        <Tabs.Screen
          name="more"
          options={{
            title: 'More',
            href: SPORTS.some(s => !isSelected(s.id)) ? undefined : null,
            tabBarActiveTintColor: C.accent,
            tabBarIcon: ({ color }) => (
              <View style={styles.iconWrap}>
                <Ionicons name="ellipsis-horizontal" size={24} color={color} />
                {morHasLive && <View style={styles.liveDot} />}
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarActiveTintColor: C.accent,
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings-outline" size={24} color={color} />
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
    top: -2,
    right: -6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.tabLive,
  },
});
