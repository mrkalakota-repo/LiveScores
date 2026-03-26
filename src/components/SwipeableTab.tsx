import React, { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import {
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import { useRouter, usePathname, type Href } from 'expo-router';
import { SPORTS } from '@/constants/sports';
import { useSportPreferences } from '@/contexts/SportPreferencesContext';

const SWIPE_THRESHOLD = 50;
const VELOCITY_THRESHOLD = 500;

/**
 * Wraps a tab screen's content so horizontal swipes navigate
 * to the previous / next visible tab.
 */
export function SwipeableTab({ children }: { children: React.ReactNode }) {
  if (Platform.OS === 'web') return <>{children}</>;

  return <SwipeableTabInner>{children}</SwipeableTabInner>;
}

function SwipeableTabInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSelected } = useSportPreferences();

  // Build ordered list of visible tab routes
  const visibleTabs = useMemo(() => {
    const tabs = SPORTS.filter(s => isSelected(s.id)).map(s => s.id);
    // "more" tab is visible when some sports are hidden
    if (SPORTS.some(s => !isSelected(s.id))) {
      tabs.push('more');
    }
    tabs.push('settings');
    return tabs;
  }, [isSelected]);

  // Current tab id from pathname (e.g. "/nfl" -> "nfl")
  const currentTab = pathname.replace(/^\//, '');
  const currentIndex = visibleTabs.indexOf(currentTab);

  const navigateToTab = useCallback(
    (direction: 'left' | 'right') => {
      if (currentIndex === -1) return;
      const nextIndex =
        direction === 'left' ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex < 0 || nextIndex >= visibleTabs.length) return;
      router.navigate(`/(tabs)/${visibleTabs[nextIndex]}` as Href);
    },
    [currentIndex, visibleTabs, router],
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const isSwipe =
        Math.abs(translationX) > SWIPE_THRESHOLD ||
        Math.abs(velocityX) > VELOCITY_THRESHOLD;
      if (!isSwipe) return;

      if (translationX < 0) {
        // Swiped left → go to next tab
        navigateToTab('left');
      } else {
        // Swiped right → go to previous tab
        navigateToTab('right');
      }
    })
    .runOnJS(true);

  return <GestureDetector gesture={pan}>{children}</GestureDetector>;
}
