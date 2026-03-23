import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// ── Use test IDs during development, replace with real ones for production ──
// To get real IDs: create ad units at https://apps.admob.google.com
//
// Replace these with your real AdMob unit IDs before publishing:
//   BANNER:       ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx
//   INTERSTITIAL: ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx

const USE_TEST_ADS = __DEV__;

export const AD_UNIT_IDS = {
  BANNER: USE_TEST_ADS
    ? TestIds.ADAPTIVE_BANNER
    : Platform.select({
        ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',       // TODO: replace
        android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',   // TODO: replace
        default: '',
      }) ?? '',
  INTERSTITIAL: USE_TEST_ADS
    ? TestIds.INTERSTITIAL
    : Platform.select({
        ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',       // TODO: replace
        android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',   // TODO: replace
        default: '',
      }) ?? '',
};

// Minimum seconds between interstitial ads to avoid annoying users
export const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes
