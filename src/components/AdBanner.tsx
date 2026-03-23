import React, { memo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS } from '@/constants/ads';

/** Adaptive banner ad anchored at the bottom of a screen. Hidden on web. */
export const AdBanner = memo(function AdBanner() {
  const [hasError, setHasError] = useState(false);

  // Ads not supported on web
  if (Platform.OS === 'web' || hasError) return null;

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AD_UNIT_IDS.BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => setHasError(true)}
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
