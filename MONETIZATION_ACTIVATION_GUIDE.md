# 🔧 Monetization Activation Guide

## Current Status: ⚠️ Temporarily Disabled

The monetization features (subscriptions and ads) are **installed but disabled** to prevent errors while you're setting up API keys.

---

## ✅ What's Working Now

Your app is fully functional with:
- ✅ **Recipe Search** - TheMealDB integration (working!)
- ✅ **All Core Features** - Tasks, meals, expenses, shopping, calendar
- ✅ **Premium Screen** - UI ready, just needs API keys
- ✅ **Settings Integration** - Premium section visible
- ✅ **No Crashes** - App runs smoothly

**Monetization is ready to activate** once you add API keys!

---

## 🎯 What's Disabled (Temporarily)

These features are **commented out** until you configure API keys:

### In `App.tsx`:
```typescript
// Initialize AdMob only if configured
// Uncomment when you have AdMob IDs set up
// if (!isPremium) {
//   initializeAdMob();
// }

// Initialize subscriptions when user is logged in
// Uncomment when you have RevenueCat keys set up
// if (user?.uid) {
//   initializePurchases(user.uid);
// }
```

### In `src/components/AdBanner.tsx`:
- Banner ads disabled (returns null)
- Ready to enable when AdMob is configured

### In `src/components/InterstitialAdManager.tsx`:
- Interstitial ads disabled (returns false)
- Ready to enable when AdMob is configured

---

## 🚀 How to Activate Monetization

### Step 1: Get AdMob App IDs

1. **Create AdMob Account**: https://admob.google.com/
2. **Create iOS App** in AdMob
3. **Create Android App** in AdMob
4. **Get App IDs** (format: `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)

### Step 2: Update app.json

Replace the placeholder IDs with your real AdMob App IDs:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-YOUR_REAL_IOS_APP_ID"
      }
    },
    "android": {
      "config": {
        "googleMobileAdsAppId": "ca-app-pub-YOUR_REAL_ANDROID_APP_ID"
      }
    },
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-YOUR_REAL_ANDROID_APP_ID",
          "iosAppId": "ca-app-pub-YOUR_REAL_IOS_APP_ID"
        }
      ]
    ]
  }
}
```

### Step 3: Get AdMob Ad Unit IDs

1. In AdMob, create **Banner** and **Interstitial** ad units
2. Get the Ad Unit IDs (format: `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

### Step 4: Update src/services/adMobService.ts

Replace placeholder Ad Unit IDs:

```typescript
export const AD_UNIT_IDS = {
  ios: {
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-YOUR_IOS_BANNER_ID',
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-YOUR_IOS_INTERSTITIAL_ID',
  },
  android: {
    banner: __DEV__ ? TestIds.BANNER : 'ca-app-pub-YOUR_ANDROID_BANNER_ID',
    interstitial: __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-YOUR_ANDROID_INTERSTITIAL_ID',
  },
};
```

### Step 5: Enable AdMob in App.tsx

Uncomment the AdMob initialization:

```typescript
// In App.tsx
useEffect(() => {
  // Uncomment these lines:
  if (!isPremium) {
    initializeAdMob();
  }
}, [isPremium]);
```

### Step 6: Enable Ads in Components

**In `src/components/AdBanner.tsx`:**
- Remove the `return null;` line
- Uncomment the BannerAd component

**In `src/components/InterstitialAdManager.tsx`:**
- Remove the `return false;` line
- Uncomment the ad loading logic

### Step 7: Rebuild Native Code

```bash
npx expo prebuild --clean
npx expo run:ios
```

### Step 8: Get RevenueCat API Keys (Optional - for subscriptions)

1. **Create RevenueCat Account**: https://app.revenuecat.com/
2. **Create Project** and add your apps
3. **Create subscription products** in App Store Connect / Play Console
4. **Get API Keys** from RevenueCat

### Step 9: Update src/state/subscriptionStore.ts

```typescript
const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_YOUR_IOS_API_KEY',
  android: 'goog_YOUR_ANDROID_API_KEY',
});
```

### Step 10: Enable RevenueCat in App.tsx

Uncomment the RevenueCat initialization:

```typescript
// In App.tsx
useEffect(() => {
  if (user?.uid) {
    initializePurchases(user.uid);
  }
}, [user?.uid]);
```

### Step 11: Final Rebuild

```bash
npx expo prebuild --clean
npx expo run:ios
```

---

## 🧪 Testing in Development

### Test Ads (Before Getting Real IDs):
AdMob automatically uses **test ads** when `__DEV__` is true:
- Test ads are safe to click
- They won't generate real revenue
- They help you test the ad placement

### Test Subscriptions:
- Use **Sandbox testers** (iOS) or **test accounts** (Android)
- Don't use real payment methods during testing

---

## 📋 Quick Checklist

Before activating monetization:

- [ ] AdMob account created
- [ ] iOS app added to AdMob
- [ ] Android app added to AdMob
- [ ] AdMob App IDs obtained
- [ ] Banner ad units created
- [ ] Interstitial ad units created
- [ ] Ad Unit IDs obtained
- [ ] app.json updated with real IDs
- [ ] adMobService.ts updated with real IDs
- [ ] AdBanner.tsx uncommented
- [ ] InterstitialAdManager.tsx uncommented
- [ ] App.tsx AdMob init uncommented
- [ ] Native code rebuilt (`npx expo prebuild --clean`)
- [ ] App tested on device

For subscriptions (optional):
- [ ] RevenueCat account created
- [ ] Subscription products created in stores
- [ ] RevenueCat API keys obtained
- [ ] subscriptionStore.ts updated with keys
- [ ] App.tsx RevenueCat init uncommented

---

## 🎯 Current State Summary

### ✅ Ready to Use Now:
- All core app features
- Recipe search functionality
- Beautiful UI with all screens
- Settings with Premium section (shows but not functional yet)

### ⏸️ Ready to Activate:
- AdMob advertisements (need App IDs)
- RevenueCat subscriptions (need API keys)
- Premium upgrade flow (need RevenueCat)

### 📚 Documentation:
- `MONETIZATION_SETUP.md` - Complete setup guide
- `MONETIZATION_EXAMPLES.md` - Code examples
- `MONETIZATION_SUMMARY.md` - Quick overview
- This file - Activation instructions

---

## 🆘 Troubleshooting

### Error: "ios_app_id key not found"
**Solution:** Update `app.json` with real AdMob App IDs (see Step 2 above)

### Error: "NativeEventEmitter requires non-null argument"
**Solution:** Make sure AdMob initialization is commented out OR you have real AdMob IDs configured

### Error: RevenueCat crashes
**Solution:** Comment out RevenueCat initialization until you have API keys

### Ads not showing after activation
**Solution:**
1. Verify AdMob App IDs in app.json
2. Verify Ad Unit IDs in adMobService.ts
3. Wait 1-2 hours for ads to go live (first time)
4. Check AdMob dashboard for approval status

---

## 💡 Development Workflow

### While Building (Current State):
```bash
# Just reload the app for code changes
Press 'r' in terminal
```

### After Adding API Keys:
```bash
# Rebuild native code
npx expo prebuild --clean
npx expo run:ios
```

### For Production:
```bash
# Build with EAS
eas build --platform ios --profile production
eas build --platform android --profile production
```

---

## ✨ Summary

**Your app is working perfectly right now!** 🎉

The monetization features are:
- ✅ **Installed** - All code is ready
- ⏸️ **Disabled** - To prevent errors without API keys
- 🚀 **Ready to Activate** - Follow steps above when ready

You can:
1. **Use the app now** - Everything works, including recipe search!
2. **Get API keys** - When ready to monetize
3. **Activate features** - Uncomment code and rebuild
4. **Deploy to App Store** - With full monetization enabled

No rush! The monetization is there when you need it. 😊

