import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { SPORTS } from '@/constants/sports';
import { useLiveGames } from '@/contexts/LiveGamesContext';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

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
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        // Fixed item height prevents elongation when label/icon sizes differ
        tabBarItemStyle: {
          height: 56,
          justifyContent: 'center',
        },
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
            // Fixed size (no active/inactive size variation) prevents layout shift
            tabBarIcon: ({ color }) => (
              <Ionicons name={sport.icon as IoniconName} size={22} color={color} />
            ),
            // Show a red dot when live games are happening in this sport
            tabBarBadge: (liveCounts[sport.id] ?? 0) > 0 ? liveCounts[sport.id] : undefined,
            tabBarBadgeStyle: {
              backgroundColor: Colors.live,
              color: '#fff',
              fontSize: 9,
              fontWeight: '700',
              minWidth: 16,
              height: 16,
              borderRadius: 8,
              lineHeight: 16,
            },
          }}
        />
      ))}
    </Tabs>
  );
}
