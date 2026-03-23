import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, INTERSTITIAL_COOLDOWN_MS } from '@/constants/ads';

// Shared timestamp so cooldown is global across all hook instances
let lastShownAt = 0;

/**
 * Preloads an interstitial ad and returns a `show()` function.
 * Respects a global cooldown so users aren't bombarded.
 * No-ops on web.
 */
export function useInterstitialAd() {
  const adRef = useRef<InterstitialAd | null>(null);
  const loadedRef = useRef(false);

  const loadAd = useCallback(() => {
    if (Platform.OS === 'web') return;
    loadedRef.current = false;
    const ad = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
      requestNonPersonalizedAdsOnly: true,
    });
    const unsubLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      loadedRef.current = true;
    });
    const unsubClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      // Preload next ad after user closes
      unsubLoaded();
      unsubClosed();
      loadAd();
    });
    ad.load();
    adRef.current = ad;
  }, []);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  const show = useCallback(() => {
    if (Platform.OS === 'web') return;
    const now = Date.now();
    if (now - lastShownAt < INTERSTITIAL_COOLDOWN_MS) return;
    if (!loadedRef.current || !adRef.current) return;
    lastShownAt = now;
    adRef.current.show();
  }, []);

  return { show };
}
