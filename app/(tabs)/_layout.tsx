import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { SPORTS } from '@/constants/sports';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export default function TabLayout() {
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
        },
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
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
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={sport.icon as IoniconName} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
