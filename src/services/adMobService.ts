import { Platform } from 'react-native';
import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

export const initializeAdMob = async () => {
  try {
    // Only configure ads on iOS for now
    if (Platform.OS !== 'ios') {
      console.log('ℹ️ AdMob initialization skipped (iOS-only configuration)');
      return;
    }
    await mobileAds().initialize();
    
    // Set content rating (optional)
    await mobileAds().setRequestConfiguration({
      maxAdContentRating: MaxAdContentRating.PG,
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: false,
    });

    console.log('✅ AdMob initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing AdMob:', error);
  }
};

// Ad Unit IDs
// IMPORTANT: Replace these with your actual AdMob Ad Unit IDs
export const AD_UNIT_IDS = {
  ios: {
    banner: __DEV__ ? 'ca-app-pub-3940256099942544/2934735716' : 'ca-app-pub-3934441448605262/9125793627',
    interstitial: __DEV__ ? 'ca-app-pub-3940256099942544/4411468910' : 'ca-app-pub-3934441448605262/8208814694',
  },
  android: {
    // Android disabled for now; keep empty to avoid accidental requests
    banner: '',
    interstitial: '',
  },
};

export const getBannerAdUnitId = (): string => {
  return Platform.OS === 'ios' ? AD_UNIT_IDS.ios.banner : '';
};

export const getInterstitialAdUnitId = (): string => {
  return Platform.OS === 'ios' ? AD_UNIT_IDS.ios.interstitial : '';
};

