import { Platform } from 'react-native';

let TestIds: any = null;

try {
  TestIds = require('react-native-google-mobile-ads').TestIds;
} catch {
  // Native module not available (e.g. Expo Go)
}

// ── Use test IDs during development, replace with real ones for production ──
// To get real IDs: create ad units at https://apps.admob.google.com
//
// Before publishing, replace placeholder IDs in TWO places:
//   1. app.json → androidAppId / iosAppId (app-level IDs)
//   2. Below → BANNER / INTERSTITIAL (ad unit IDs)

const USE_TEST_ADS = __DEV__;

export const AD_UNIT_IDS = {
  BANNER: USE_TEST_ADS
    ? (TestIds?.ADAPTIVE_BANNER ?? '')
    : Platform.select({
        ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',       // TODO: replace
        android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',   // TODO: replace
        default: '',
      }) ?? '',
  INTERSTITIAL: USE_TEST_ADS
    ? (TestIds?.INTERSTITIAL ?? '')
    : Platform.select({
        ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',       // TODO: replace
        android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',   // TODO: replace
        default: '',
      }) ?? '',
};

// Minimum seconds between interstitial ads to avoid annoying users
export const INTERSTITIAL_COOLDOWN_MS = 3 * 60 * 1000; // 3 minutes
