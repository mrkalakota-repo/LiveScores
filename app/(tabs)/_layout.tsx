import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { SPORTS } from '@/constants/sports';
import { useLiveGames } from '@/contexts/LiveGamesContext';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface LiveTabIconProps {
  name: IoniconName;
  nameOutline: IoniconName;
  color: string;
  focused: boolean;
  hasLive: boolean;
}

function LiveTabIcon({ name, nameOutline, color, focused, hasLive }: LiveTabIconProps) {
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

  return (
    <View style={styles.iconWrap}>
      <Ionicons name={focused ? name : nameOutline} size={22} color={iconColor} />
      {!focused && hasLive && (
        <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
      )}
    </View>
  );
}

export default function TabLayout() {
  const { liveCounts } = useLiveGames();

  return (
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
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 56,
        },
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
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
                name={sport.icon as IoniconName}
                nameOutline={sport.iconOutline as IoniconName}
                color={color}
                focused={focused}
                hasLive={(liveCounts[sport.id] ?? 0) > 0}
              />
            ),
          }}
        />
      ))}
    </Tabs>
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
