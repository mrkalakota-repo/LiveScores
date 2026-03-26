import React, { memo, useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { AD_UNIT_IDS } from '@/constants/ads';

let BannerAd: any = null;
let BannerAdSize: any = null;

try {
  const ads = require('react-native-google-mobile-ads');
  BannerAd = ads.BannerAd;
  BannerAdSize = ads.BannerAdSize;
} catch {
  // Native module not available (e.g. Expo Go)
}

const MAX_RETRIES = 3;

/** Adaptive banner ad anchored at the bottom of a screen. Hidden on web. */
export const AdBanner = memo(function AdBanner() {
  const [retries, setRetries] = useState(0);

  const handleError = useCallback((err: Error) => {
    if (__DEV__) console.warn('[AdBanner] Failed to load:', err?.message);
    setRetries(prev => prev + 1);
  }, []);

  // No native module, web, or too many retries → render nothing
  if (!BannerAd || Platform.OS === 'web' || retries >= MAX_RETRIES) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        key={retries}
        unitId={AD_UNIT_IDS.BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={handleError}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
});
