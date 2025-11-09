import { useEffect, useState } from 'react';
import { RewardedAd, RewardedAdEventType } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';

// Rewarded Ad Unit IDs (using test IDs - replace with your own)
const REWARDED_AD_UNIT_ID = Platform.select({
  ios: __DEV__ ? 'ca-app-pub-3940256099942544/1712485313' : 'ca-app-pub-3934441448605262/4090440434',
  android: __DEV__ ? 'ca-app-pub-3940256099942544/5224354917' : 'YOUR_ANDROID_REWARDED_ID',
}) || '';

/**
 * Hook for Rewarded Ads
 * Use this when you want to give users rewards for watching ads
 * 
 * Example:
 * const { showAd, isLoaded } = useRewardedAd((reward) => {
 *   console.log('User earned reward:', reward.amount, reward.type);
 *   // Give user their reward (coins, premium feature access, etc.)
 * });
 */
export const useRewardedAd = (onRewarded?: (reward: { type: string; amount: number }) => void) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [rewarded, setRewarded] = useState<RewardedAd | null>(null);

  useEffect(() => {
    const ad = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: false,
    });

    const loadAd = () => {
      ad.load();
    };

    // Event listeners
    const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      console.log('✅ Rewarded ad loaded');
      setIsLoaded(true);
    });

    const unsubscribeError = ad.addAdEventListener(RewardedAdEventType.ERROR, (error) => {
      console.log('❌ Rewarded ad error:', error);
      setIsLoaded(false);
    });

    const unsubscribeEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward) => {
        console.log('🎉 User earned reward:', reward);
        if (onRewarded) {
          onRewarded(reward);
        }
      }
    );

    const unsubscribeClosed = ad.addAdEventListener(RewardedAdEventType.CLOSED, () => {
      console.log('👋 Rewarded ad closed');
      setIsLoaded(false);
      // Reload ad for next time
      loadAd();
    });

    setRewarded(ad);
    loadAd();

    // Cleanup
    return () => {
      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, [onRewarded]);

  const showAd = () => {
    if (isLoaded && rewarded) {
      rewarded.show();
    } else {
      console.log('⚠️ Rewarded ad not ready yet');
    }
  };

  return { showAd, isLoaded };
};

