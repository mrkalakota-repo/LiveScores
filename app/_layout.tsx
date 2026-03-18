import React, { useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { LiveGamesProvider } from '@/contexts/LiveGamesContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'online',
      gcTime: 5 * 60_000,
    },
  },
});

// Refetch on app foreground resume (native only)
function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === 'active');
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      // On web, TanStack Query uses window focus/blur by default
      return;
    }
    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LiveGamesProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </LiveGamesProvider>
    </QueryClientProvider>
  );
}
