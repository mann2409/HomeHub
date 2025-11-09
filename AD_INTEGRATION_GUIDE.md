# 📱 Google AdMob Integration Guide

This guide will help you integrate ads into your HomeHub app and start earning revenue.

## ✅ What's Already Set Up

- ✅ `react-native-google-mobile-ads` package installed
- ✅ AdMob service initialized
- ✅ Plugin configured in `app.json`
- ✅ Reusable ad components created
- ✅ Premium user ad-free experience

## 🚀 Quick Start (3 Steps)

### Step 1: Create Your AdMob Account

1. Go to [AdMob](https://admob.google.com/)
2. Sign in with your Google account
3. Click "Get Started" and create a new account
4. Accept the AdMob Terms & Conditions

### Step 2: Create Your App in AdMob

1. In AdMob dashboard, click **"Apps"** → **"Add App"**
2. Select your platform (iOS/Android)
3. Choose **"Yes"** if your app is published (or **"No"** if not yet)
4. Enter your app name: **"HomeHub"**
5. Click **"Add"** and note down your **App ID**

**You'll get an App ID like:** `ca-app-pub-1234567890123456~1234567890`

### Step 3: Create Ad Units

For each platform (iOS and Android), create these ad units:

#### Banner Ad Unit
1. Click **"Ad units"** → **"Get started"**
2. Select **"Banner"**
3. Name it: **"HomeHub Banner"**
4. Click **"Create ad unit"**
5. Copy the **Ad Unit ID**

#### Interstitial Ad Unit
1. Click **"Add ad unit"** → **"Interstitial"**
2. Name it: **"HomeHub Interstitial"**
3. Click **"Create ad unit"**
4. Copy the **Ad Unit ID**

#### Rewarded Ad Unit (Optional)
1. Click **"Add ad unit"** → **"Rewarded"**
2. Name it: **"HomeHub Rewarded"**
3. Click **"Create ad unit"**
4. Copy the **Ad Unit ID**

---

## 🔧 Configure Your App

### 1. Update `app.json` with your AdMob App IDs

Replace the test IDs in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-google-mobile-ads",
        {
          "androidAppId": "ca-app-pub-YOUR_ANDROID_APP_ID~XXXXXXXXXXXX",
          "iosAppId": "ca-app-pub-YOUR_IOS_APP_ID~XXXXXXXXXXXX"
        }
      ]
    ]
  }
}
```

### 2. Update `src/services/adMobService.ts` with your Ad Unit IDs

Replace the placeholder IDs:

```typescript
export const AD_UNIT_IDS = {
  ios: {
    banner: __DEV__ ? 'ca-app-pub-3940256099942544/2934735716' : 'ca-app-pub-YOUR_IOS_BANNER_ID',
    interstitial: __DEV__ ? 'ca-app-pub-3940256099942544/4411468910' : 'ca-app-pub-YOUR_IOS_INTERSTITIAL_ID',
  },
  android: {
    banner: __DEV__ ? 'ca-app-pub-3940256099942544/6300978111' : 'ca-app-pub-YOUR_ANDROID_BANNER_ID',
    interstitial: __DEV__ ? 'ca-app-pub-3940256099942544/1033173712' : 'ca-app-pub-YOUR_ANDROID_INTERSTITIAL_ID',
  },
};
```

### 3. Update `src/hooks/useRewardedAd.ts` (if using rewarded ads)

Replace the placeholder IDs:

```typescript
const REWARDED_AD_UNIT_ID = Platform.select({
  ios: __DEV__ ? 'ca-app-pub-3940256099942544/1712485313' : 'ca-app-pub-YOUR_IOS_REWARDED_ID',
  android: __DEV__ ? 'ca-app-pub-3940256099942544/5224354917' : 'ca-app-pub-YOUR_ANDROID_REWARDED_ID',
}) || '';
```

### 4. Uncomment AdMob initialization in `App.tsx`

Already done! Just make sure these lines are uncommented:

```typescript
import { initializeAdMob } from "./src/services/adMobService";
import useSubscriptionStore from "./src/state/subscriptionStore";

// Inside your component:
useEffect(() => {
  if (!isPremium) {
    initializeAdMob();
  }
}, [isPremium]);
```

---

## 💡 How to Use the Ads

### 1. Banner Ads (Bottom of Screen)

Add to any screen:

```typescript
import BannerAdComponent from '../components/BannerAd';

export default function YourScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Your screen content */}
      
      {/* Banner ad at the bottom */}
      <BannerAdComponent />
    </View>
  );
}
```

**Best places for banner ads:**
- Bottom of Dashboard
- Bottom of Calendar screen
- Bottom of Meals screen
- Bottom of Shopping list

### 2. Interstitial Ads (Full Screen)

Show between screens or after actions:

```typescript
import { useInterstitialAd } from '../hooks/useInterstitialAd';

export default function YourScreen() {
  const { showAd, isLoaded } = useInterstitialAd();

  const handleActionComplete = () => {
    // Do your action
    saveTask();
    
    // Show ad (maybe every 3rd action to not annoy users)
    if (isLoaded && Math.random() > 0.7) {
      showAd();
    }
  };

  return (
    // Your UI
  );
}
```

**Best times to show interstitial ads:**
- After user adds a task
- After user completes a shopping trip
- Between calendar week switches
- After viewing 3-5 recipes

### 3. Rewarded Ads (Watch for Rewards)

Give users something for watching:

```typescript
import { useRewardedAd } from '../hooks/useRewardedAd';

export default function YourScreen() {
  const { showAd, isLoaded } = useRewardedAd((reward) => {
    console.log('User earned:', reward);
    // Give user premium feature for 24 hours
    // Or unlock special recipes
    // Or give them bonus features
  });

  return (
    <TouchableOpacity onPress={showAd} disabled={!isLoaded}>
      <Text>Watch ad to unlock premium feature for 24h</Text>
    </TouchableOpacity>
  );
}
```

**Rewarded ad ideas:**
- Unlock premium recipes temporarily
- Remove ads for 24 hours
- Get access to AI features for free
- Unlock special themes

---

## 🧪 Testing Your Ads

### Development Mode
- The app automatically uses **test ad IDs** in `__DEV__` mode
- Test ads will show and you won't violate AdMob policies
- You can click test ads without penalty

### Production Mode
- Make sure you've replaced all the IDs with your real ones
- Test on a real device before publishing
- **NEVER** click your own real ads (you'll get banned!)

### Verify Setup
```bash
# Rebuild the app after changing app.json
expo run:ios
# or
expo run:android
```

---

## 📊 Best Practices

### 1. Don't Annoy Users
- ❌ Don't show interstitial ads every action
- ✅ Show them every 3-5 actions
- ✅ Show them at natural break points

### 2. Premium Users
- The ad components automatically hide for premium users
- This is already handled in the components

### 3. Ad Placement
- **Banner ads:** Bottom of screen (always visible but not intrusive)
- **Interstitial ads:** Between screens or after completing tasks
- **Rewarded ads:** Optional for users who want rewards

### 4. Loading States
- Always check `isLoaded` before showing interstitial/rewarded ads
- Banner ads handle loading automatically

---

## 💰 Expected Revenue

Revenue depends on:
- **User location** (US/Europe = higher, developing countries = lower)
- **Ad type** (Interstitial > Banner > Rewarded)
- **User engagement** (more usage = more impressions)
- **Niche** (Family/productivity apps typically get $0.50-$3 RPM)

**Rough estimates:**
- 1,000 active users per day
- Each user sees 5 banner ads + 2 interstitial ads
- **Monthly revenue:** $50-$300

---

## 🐛 Troubleshooting

### Ads not showing?
1. Check your internet connection
2. Make sure AdMob app is approved (can take 24 hours)
3. Check console logs for errors
4. Verify your Ad Unit IDs are correct

### "App not found" error?
- Make sure you've added your app in AdMob dashboard
- Verify App IDs in `app.json` match your AdMob dashboard
- Rebuild your app after changing `app.json`

### Test ads showing in production?
- Make sure `__DEV__` is false in production builds
- Verify you've replaced all test IDs with real ones
- Do a clean build: `expo run:ios --clean` or `expo run:android --clean`

### Premium users still seeing ads?
- Check `subscriptionStore` is properly tracking premium status
- Verify `isPremium` is being checked in ad components

---

## 📝 Quick Reference

### File Locations
- **AdMob Service:** `src/services/adMobService.ts`
- **Banner Component:** `src/components/BannerAd.tsx`
- **Interstitial Hook:** `src/hooks/useInterstitialAd.ts`
- **Rewarded Hook:** `src/hooks/useRewardedAd.ts`
- **App Config:** `app.json`
- **App Initialization:** `App.tsx`

### AdMob Dashboard Links
- **Main Dashboard:** https://admob.google.com/
- **Apps:** https://apps.admob.com/
- **Ad Units:** https://apps.admob.com/ad-units
- **Reports:** https://apps.admob.com/reporting

---

## 🎯 Next Steps

1. ✅ Create AdMob account
2. ✅ Create your apps (iOS and Android)
3. ✅ Create ad units for each platform
4. ✅ Update `app.json` with App IDs
5. ✅ Update `adMobService.ts` with Ad Unit IDs
6. ✅ Rebuild your app
7. ✅ Test with test ads
8. ✅ Add banner ads to 2-3 key screens
9. ✅ Add interstitial ads strategically
10. ✅ (Optional) Add rewarded ads for premium features
11. ✅ Deploy and start earning!

---

## 🤝 Need Help?

- **AdMob Support:** https://support.google.com/admob
- **React Native Google Mobile Ads Docs:** https://docs.page/invertase/react-native-google-mobile-ads

Good luck with monetizing your app! 🚀

