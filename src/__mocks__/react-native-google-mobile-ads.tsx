import React from 'react';
import { View } from 'react-native';

export const TestIds = {
  ADAPTIVE_BANNER: 'ca-app-pub-test/banner',
  INTERSTITIAL: 'ca-app-pub-test/interstitial',
  BANNER: 'ca-app-pub-test/banner',
};

export const BannerAdSize = {
  ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
  BANNER: 'BANNER',
};

export const AdEventType = {
  LOADED: 'loaded',
  CLOSED: 'closed',
  ERROR: 'error',
};

export function BannerAd() {
  return <View testID="banner-ad" />;
}

export const InterstitialAd = {
  createForAdRequest: () => ({
    addAdEventListener: () => () => {},
    load: () => {},
    show: () => {},
  }),
};
