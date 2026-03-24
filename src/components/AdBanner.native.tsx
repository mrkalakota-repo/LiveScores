import React, { memo, useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '@/constants/ads';

const MAX_RETRIES = 3;

/** Adaptive banner ad anchored at the bottom of a screen. Hidden on web. */
export const AdBanner = memo(function AdBanner() {
  const [retries, setRetries] = useState(0);

  const handleError = useCallback((err: Error) => {
    console.warn('[AdBanner] Failed to load:', err?.message);
    setRetries(prev => prev + 1);
  }, []);

  // Ads not supported on web; give up after MAX_RETRIES
  if (Platform.OS === 'web' || retries >= MAX_RETRIES) return null;

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
