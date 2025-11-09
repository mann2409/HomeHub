# Monetization Setup Guide

Your app now has **both subscription/premium features** and **advertisement support** integrated! This guide will help you configure everything to start earning revenue.

## 📋 Overview

Your app now uses:
- **RevenueCat** for cross-platform subscription management
- **Google AdMob** for advertisements
- **Freemium Model**: Free users see ads, Premium users get ad-free experience

## 🚀 Quick Setup Steps

### 1. RevenueCat Setup (Subscriptions)

#### Step 1: Create RevenueCat Account
1. Go to [RevenueCat](https://app.revenuecat.com/)
2. Sign up for a free account
3. Create a new project for your app

#### Step 2: Configure App Stores
1. In RevenueCat dashboard, go to **Projects** → **App Settings**
2. Add your iOS app:
   - Bundle ID: `com.manishsandil.vibecode`
   - Upload your App Store Connect API Key
3. Add your Android app:
   - Package Name: `com.manishsandil.vibecode`
   - Upload your Google Play Service Account JSON

#### Step 3: Create Subscription Products
1. Go to App Store Connect (iOS) and Google Play Console (Android)
2. Create subscription products:
   
   **Recommended Products:**
   - **Monthly Premium**: `premium_monthly` - $4.99/month
   - **Annual Premium**: `premium_yearly` - $39.99/year (Best Value!)
   
3. In RevenueCat, go to **Products**:
   - Click **+ New Product**
   - Link your App Store/Play Store products

#### Step 4: Create Entitlements
1. In RevenueCat, go to **Entitlements**
2. Create an entitlement named: `premium`
3. Attach your subscription products to this entitlement

#### Step 5: Create Offerings
1. Go to **Offerings** in RevenueCat
2. Create a new offering (or use default "Current")
3. Add your subscription packages:
   - Add `premium_monthly` package
   - Add `premium_yearly` package (mark as featured)

#### Step 6: Get API Keys
1. In RevenueCat, go to **API Keys**
2. Copy your public API keys:
   - iOS API Key (starts with `appl_`)
   - Android API Key (starts with `goog_`)

3. Update them in `src/state/subscriptionStore.ts`:
```typescript
const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_YOUR_IOS_KEY_HERE',
  android: 'goog_YOUR_ANDROID_KEY_HERE',
});
```

---

### 2. Google AdMob Setup (Advertisements)

#### Step 1: Create AdMob Account
1. Go to [Google AdMob](https://admob.google.com/)
2. Sign in with your Google account
3. Create a new app for iOS and Android

#### Step 2: Create Ad Units
For **each platform** (iOS and Android), create:
1. **Banner Ad** - For bottom of screens
2. **Interstitial Ad** - Full-screen ads between actions
3. *(Optional)* **Rewarded Ad** - For future features

#### Step 3: Get Your App IDs and Ad Unit IDs

After creating your apps and ad units in AdMob, you'll have:
- **App IDs** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)
- **Ad Unit IDs** (format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

#### Step 4: Update Configuration Files

**A. Update `app.json`:**
```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
      }
    },
    "android": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
      }
    },
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX",
          "iosAppId": "ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"
        }
      ]
    ]
  }
}
```

**B. Update `src/services/adMobService.ts`:**
```typescript
export const AD_UNIT_IDS = {
  ios: {
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    rewarded: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  },
  android: {
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    rewarded: __DEV__ ? TestIds.REWARDED : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  },
};
```

---

## 🧪 Testing

### Test Subscriptions
1. **iOS**: Use Sandbox testers in App Store Connect
2. **Android**: Use test accounts in Google Play Console
3. **RevenueCat**: Use test mode to see purchases in the dashboard

### Test Ads
- Ads automatically use test IDs in development mode (`__DEV__`)
- Test ads will show until you replace with real Ad Unit IDs in production

---

## 📱 User Experience Flow

### Free Users:
- ✅ Full app functionality
- 📺 See banner ads on main screens
- 📺 Occasional interstitial ads between actions
- 💎 "Upgrade to Premium" prompts in Settings

### Premium Users:
- ✅ Full app functionality
- 🚫 **No advertisements**
- 👑 Premium badge in Settings
- ⭐ Early access to new features

---

## 🎨 Features Implemented

### 1. **Subscription Store** (`src/state/subscriptionStore.ts`)
- Manages premium status
- Handles purchase flow
- Syncs with RevenueCat

### 2. **Premium Screen** (`src/screens/PremiumScreen.tsx`)
- Beautiful subscription UI
- Package selection
- Restore purchases
- Premium benefits display

### 3. **Ad Components**
- **AdBanner** (`src/components/AdBanner.tsx`) - Banner ads
- **InterstitialAdManager** (`src/components/InterstitialAdManager.tsx`) - Full-screen ads
- Automatically hidden for premium users

### 4. **Settings Integration**
- Premium status display
- Upgrade prompts for free users
- Manage subscription for premium users

### 5. **Dashboard Integration**
- Banner ad at bottom (free users only)
- Clean, non-intrusive placement

---

## 💰 Monetization Strategy Tips

### Pricing Recommendations:
- **Monthly**: $4.99 - $9.99 (Lower for family apps)
- **Yearly**: 40-50% discount vs monthly (Best value!)
- **Example**: $4.99/mo or $39.99/yr saves $20/yr

### Ad Placement Best Practices:
- ✅ Banner ads at bottom of screens
- ✅ Interstitial ads between major actions (e.g., after adding 5 tasks)
- ❌ Avoid interrupting core workflows
- ❌ Don't show ads too frequently

### Optimize Conversions:
1. **Free Trial**: Consider offering 7-day free trial
2. **Timing**: Prompt upgrade after users see value (3-5 days of use)
3. **Benefits**: Emphasize "ad-free" and "unlimited" features
4. **Social Proof**: Show number of premium users

---

## 🔧 Advanced Customization

### Add Interstitial Ads Between Actions:
```typescript
import { showInterstitialAd } from '../components/InterstitialAdManager';

// Show ad after every 5 tasks created
if (taskCount % 5 === 0) {
  await showInterstitialAd();
}
```

### Check Premium Status Anywhere:
```typescript
import useSubscriptionStore from '../state/subscriptionStore';

const { isPremium } = useSubscriptionStore();

if (!isPremium) {
  // Show upgrade prompt or ad
}
```

### Add Premium-Only Features:
```typescript
if (isPremium) {
  // Enable advanced analytics, themes, etc.
} else {
  // Show upgrade prompt
  Alert.alert(
    'Premium Feature',
    'This feature is only available for premium members.',
    [
      { text: 'Maybe Later', style: 'cancel' },
      { text: 'Upgrade Now', onPress: () => navigation.navigate('Premium') }
    ]
  );
}
```

---

## 📊 Analytics & Monitoring

### RevenueCat Dashboard:
- Track subscription metrics
- Monitor churn rate
- View revenue analytics
- A/B test pricing

### AdMob Dashboard:
- Monitor ad impressions
- Track click-through rates (CTR)
- View ad revenue
- Optimize ad placement

---

## 🐛 Troubleshooting

### Subscriptions Not Working:
1. ✅ Verify RevenueCat API keys are correct
2. ✅ Check App Store/Play Store product IDs match
3. ✅ Ensure products are in "Ready to Submit" state
4. ✅ Test with sandbox/test accounts

### Ads Not Showing:
1. ✅ Verify AdMob App IDs in app.json
2. ✅ Check Ad Unit IDs in adMobService.ts
3. ✅ Ensure ads are active in AdMob dashboard
4. ✅ Wait 1-2 hours after initial setup for ads to go live
5. ✅ Check that user is not premium

### Premium Status Not Persisting:
1. ✅ Check AsyncStorage persistence
2. ✅ Verify RevenueCat webhook is set up
3. ✅ Call `checkSubscriptionStatus()` on app launch

---

## 🚀 Launch Checklist

Before releasing to production:

- [ ] RevenueCat account created and configured
- [ ] Subscription products created in App Store & Play Store
- [ ] RevenueCat API keys updated in code
- [ ] AdMob account created
- [ ] Ad units created for both platforms
- [ ] AdMob IDs updated in app.json and adMobService.ts
- [ ] Tested subscription flow with sandbox accounts
- [ ] Tested ad display for free users
- [ ] Verified ads hidden for premium users
- [ ] Updated privacy policy to mention ads and subscriptions
- [ ] Reviewed App Store/Play Store monetization policies
- [ ] Set up tax information in both stores

---

## 📚 Additional Resources

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [Google AdMob Documentation](https://developers.google.com/admob)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/)

---

## 💡 Need Help?

- RevenueCat Support: support@revenuecat.com
- AdMob Support: https://support.google.com/admob/
- React Native Purchases: https://github.com/RevenueCat/react-native-purchases

---

**Good luck with your monetization! 🎉**

Remember: Focus on providing value first, and users will be happy to support your app!

