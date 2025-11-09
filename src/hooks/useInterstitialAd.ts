import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { getInterstitialAdUnitId } from '../services/adMobService';
import useSubscriptionStore from '../state/subscriptionStore';

/**
 * Hook for Interstitial Ads
 * Use this for full-screen ads between screens or actions
 * 
 * Example:
 * const { showAd, isLoaded } = useInterstitialAd();
 * 
 * // Show ad when user completes an action
 * if (isLoaded) {
 *   showAd();
 * }
 */
export const useInterstitialAd = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const { isPremium } = useSubscriptionStore();

  useEffect(() => {
    // iOS-only; don't load on Android or for premium users
    if (isPremium || Platform.OS !== 'ios') {
      return;
    }

    const ad = InterstitialAd.createForAdRequest(getInterstitialAdUnitId(), {
      requestNonPersonalizedAdsOnly: false,
    });

    // Load the interstitial ad
    const loadAd = () => {
      ad.load();
    };

    // Event listeners
    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      console.log('✅ Interstitial ad loaded');
      setIsLoaded(true);
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('❌ Interstitial ad error:', error);
      setIsLoaded(false);
    });

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('👋 Interstitial ad closed');
      setIsLoaded(false);
      // Reload ad for next time
      loadAd();
    });

    setInterstitial(ad);
    loadAd();

    // Cleanup
    return () => {
      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeClosed();
    };
  }, [isPremium]);

  const showAd = () => {
    if (isPremium || Platform.OS !== 'ios') {
      console.log('🌟 User is premium, skipping ad');
      return;
    }

    if (isLoaded && interstitial) {
      interstitial.show();
    } else {
      console.log('⚠️ Interstitial ad not ready yet');
    }
  };

  return { showAd, isLoaded };
};

