import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { getBannerAdUnitId } from '../services/adMobService';
import useSubscriptionStore from '../state/subscriptionStore';

interface BannerAdComponentProps {
  size?: BannerAdSize;
}

/**
 * Banner Ad Component
 * Displays a banner ad at the bottom or top of screens
 * Automatically hides for premium users
 */
export default function BannerAdComponent({ 
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER 
}: BannerAdComponentProps) {
  const { isPremium } = useSubscriptionStore();

  // iOS-only configuration; hide on Android and for premium users
  if (isPremium || Platform.OS !== 'ios') {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={getBannerAdUnitId()}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          console.log('✅ Banner ad loaded');
        }}
        onAdFailedToLoad={(error) => {
          console.log('❌ Banner ad failed to load:', error);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

