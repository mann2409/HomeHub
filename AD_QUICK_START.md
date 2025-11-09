# 🚀 Ad Integration - Quick Start

## ✅ What's Done

Your app is now **ready for ads**! Here's what's already implemented:

1. ✅ AdMob package installed (`react-native-google-mobile-ads`)
2. ✅ AdMob initialized in `App.tsx`
3. ✅ Plugin configured in `app.json`
4. ✅ Reusable ad components created:
   - `BannerAd.tsx` - Banner ads (bottom of screen)
   - `useInterstitialAd.ts` - Full-screen ads
   - `useRewardedAd.ts` - Watch-to-earn ads
5. ✅ Banner ad implemented on Dashboard
6. ✅ Premium users automatically skip ads
7. ✅ Test ads working in development mode

## 🎯 3 Steps to Go Live

### Step 1: Create AdMob Account (5 minutes)
1. Go to [AdMob](https://admob.google.com/)
2. Sign in with Google
3. Create account and accept terms

### Step 2: Create Your Apps & Ad Units (10 minutes)

#### For iOS:
1. Click **"Apps"** → **"Add App"** → Select **iOS**
2. Name: **HomeHub** → Get your **iOS App ID**
3. Click **"Ad Units"** → Create:
   - **Banner**: "HomeHub iOS Banner"
   - **Interstitial**: "HomeHub iOS Interstitial"
   - **Rewarded** (optional): "HomeHub iOS Rewarded"

#### For Android:
1. Click **"Apps"** → **"Add App"** → Select **Android**
2. Name: **HomeHub** → Get your **Android App ID**
3. Click **"Ad Units"** → Create:
   - **Banner**: "HomeHub Android Banner"
   - **Interstitial**: "HomeHub Android Interstitial"
   - **Rewarded** (optional): "HomeHub Android Rewarded"

### Step 3: Update Your Config (2 minutes)

#### 3a. Update `app.json`:
```json
{
  "expo": {
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

#### 3b. Update `src/services/adMobService.ts`:
```typescript
export const AD_UNIT_IDS = {
  ios: {
    banner: __DEV__ 
      ? 'ca-app-pub-3940256099942544/2934735716' 
      : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your iOS Banner ID
    interstitial: __DEV__ 
      ? 'ca-app-pub-3940256099942544/4411468910' 
      : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your iOS Interstitial ID
  },
  android: {
    banner: __DEV__ 
      ? 'ca-app-pub-3940256099942544/6300978111' 
      : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your Android Banner ID
    interstitial: __DEV__ 
      ? 'ca-app-pub-3940256099942544/1033173712' 
      : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your Android Interstitial ID
  },
};
```

#### 3c. (Optional) Update `src/hooks/useRewardedAd.ts` if using rewarded ads:
```typescript
const REWARDED_AD_UNIT_ID = Platform.select({
  ios: __DEV__ 
    ? 'ca-app-pub-3940256099942544/1712485313' 
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your iOS Rewarded ID
  android: __DEV__ 
    ? 'ca-app-pub-3940256099942544/5224354917' 
    : 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Your Android Rewarded ID
}) || '';
```

## 🧪 Test Your Ads

### Development Mode (Now)
```bash
# Rebuild after changing app.json
npx expo run:ios
# or
npx expo run:android
```

- Test ads will show automatically
- Safe to click (won't affect your revenue)
- Look for "Test Ad" label

### Production Mode (Before Launch)
1. Build production version
2. Test on real device
3. **DO NOT** click your own ads (you'll get banned!)
4. Ask friends/family to test

## 📱 Where Ads Are Shown

### Currently Implemented:
- ✅ **Dashboard** - Banner at bottom

### Add to More Screens (Easy):
Just add one line to any screen:

```typescript
import BannerAdComponent from "../components/BannerAd";

export default function YourScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Your content */}
      <BannerAdComponent /> {/* That's it! */}
    </View>
  );
}
```

**Recommended screens:**
- Calendar
- Meals
- Shopping
- Settings

## 💰 Expected Revenue

With 1,000 daily active users:
- **Banner ads only:** ~$50-150/month
- **Banner + Interstitial:** ~$150-300/month
- **All three types:** ~$200-400/month

Revenue depends on:
- User location (US/Europe = higher)
- App category
- User engagement
- Ad placement strategy

## 📚 Need More Info?

- **Full guide:** See `AD_INTEGRATION_GUIDE.md`
- **Code examples:** See `AD_IMPLEMENTATION_EXAMPLES.md`
- **AdMob dashboard:** https://admob.google.com/

## ⚠️ Important Notes

1. **Test IDs in Dev**: The app uses test ad IDs in development mode automatically
2. **Real IDs in Prod**: Make sure to add your real IDs before publishing
3. **Premium Users**: Ads automatically hidden for premium subscribers
4. **AdMob Approval**: Can take 24-48 hours for your app to be reviewed
5. **Don't Click Own Ads**: You'll get banned from AdMob permanently!

## 🎉 You're Ready!

Your app is now monetized! Just:
1. Create your AdMob account
2. Get your IDs
3. Update the config files
4. Rebuild and test
5. Launch! 🚀

---

**Questions?**
- AdMob Support: https://support.google.com/admob
- Package Docs: https://docs.page/invertase/react-native-google-mobile-ads

