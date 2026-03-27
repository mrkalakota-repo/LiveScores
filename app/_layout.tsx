import React, { useEffect } from 'react';
import { ActivityIndicator, AppState, AppStateStatus, Platform, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { LiveGamesProvider } from '@/contexts/LiveGamesContext';
import { LiveCountPoller } from '@/components/LiveCountPoller';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { SportPreferencesProvider, useSportPreferences } from '@/contexts/SportPreferencesContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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

/** Inner layout — only renders once preferences are loaded from storage. */
function AppContent() {
  const { ready: themeReady, C } = useTheme();
  const { ready: prefsReady } = useSportPreferences();

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
  }, []);

  if (!themeReady || !prefsReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.background }}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LiveGamesProvider>
        <LiveCountPoller />
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </LiveGamesProvider>
    </QueryClientProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <ThemeProvider>
          <SportPreferencesProvider>
            <AppContent />
          </SportPreferencesProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
