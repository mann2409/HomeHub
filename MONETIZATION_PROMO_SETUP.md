# 🎫 Monetization + Promo Code System Setup Guide

## Overview

This app now supports:
1. ✅ **RevenueCat** - Subscription management
2. ✅ **Google AdMob** - Banner & Interstitial ads
3. ✅ **Promo Codes** - Free premium access codes

---

## 📋 Quick Setup Checklist

### 1️⃣ **RevenueCat Setup**

#### A. Create Account
1. Go to [revenuecat.com](https://www.revenuecat.com/)
2. Sign up for free account
3. Create a new project

#### B. Get API Keys
1. Go to **API Keys** in RevenueCat dashboard
2. Copy your **Public App-Specific API Key**
3. Update in `src/state/subscriptionStore.ts`:

```typescript
const REVENUECAT_API_KEY = __DEV__ 
  ? 'your_dev_api_key_here'  // Replace with dev key
  : 'your_prod_api_key_here'; // Replace with prod key
```

#### C. Configure Products
1. In RevenueCat: Create **Entitlement** named `premium`
2. Create **Products** (e.g., monthly, yearly)
3. Link products to `premium` entitlement

---

### 2️⃣ **Google AdMob Setup**

#### A. Create AdMob Account
1. Go to [admob.google.com](https://admob.google.com/)
2. Sign in with Google account
3. Add your app

#### B. Get Ad Unit IDs
1. Create **Banner Ad Unit**
2. Create **Interstitial Ad Unit**
3. Copy the IDs

#### C. Update Ad Unit IDs
In `src/services/adMobService.ts`:

```typescript
export const AD_UNIT_IDS = {
  ios: {
    banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  },
  android: {
    banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  },
};
```

#### D. Update app.json
Add AdMob configuration:

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

---

### 3️⃣ **Promo Code System**

#### Firestore Database Structure

```
promoCodes/
  └── {CODE}/
      ├── code: "XXXX-XXXX-XXXX"
      ├── type: "lifetime" | "monthly" | "yearly"
      ├── used: false
      ├── usedBy: null (userId when redeemed)
      ├── usedAt: null (timestamp when redeemed)
      ├── createdAt: timestamp
      └── expiresAt: null (optional expiry date)

users/
  └── {userId}/
      ├── isPremium: boolean
      ├── isPromoUser: boolean
      ├── promoCode: string
      ├── promoType: string
      └── promoRedeemedAt: timestamp
```

---

## 🎯 Using the Promo Code System

### For Admins (Generating Codes)

1. **Access Admin Screen:**
   - Add navigation to `AdminPromoCodeScreen`
   - Restrict access to admin users only

2. **Generate Codes:**
   - Select type: Lifetime, Monthly, or Yearly
   - Enter custom code OR leave empty for random
   - Click "Generate Single Code"
   - OR use "Generate Multiple Codes" for bulk

3. **Code Format:**
   - Auto-formatted: `XXXX-XXXX-XXXX`
   - Uses safe characters (no confusing ones)
   - Stored in Firestore immediately

### For Users (Redeeming Codes)

1. **Access Redemption:**
   - Users can access via Settings screen
   - Or add a "Have a code?" button

2. **Redeem Process:**
   - Enter code (auto-formatted)
   - Click "Validate & Redeem Code"
   - Instant premium access!

3. **What They Get:**
   - **Lifetime:** Permanent premium access
   - **Monthly:** 30 days premium
   - **Yearly:** 365 days premium

---

## 🔧 Integration Steps

### Step 1: Run Prebuild
```bash
npx expo prebuild --clean
```

### Step 2: Install Pods (iOS)
```bash
cd ios && pod install && cd ..
```

### Step 3: Build & Run
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

---

## 📱 Adding to Settings Screen

Add this to `src/screens/SettingsScreen.tsx`:

```typescript
import RedeemPromoCodeScreen from './RedeemPromoCodeScreen';
import useSubscriptionStore from '../state/subscriptionStore';

// In component:
const [showPromoCode, setShowPromoCode] = useState(false);
const { isPremium, isPromoUser } = useSubscriptionStore();

// Add this button:
<Pressable
  onPress={() => setShowPromoCode(true)}
  className="flex-row items-center justify-between p-4 bg-white/5 rounded-xl"
>
  <View className="flex-row items-center flex-1">
    <Ionicons name="ticket-outline" size={24} color="#10B981" />
    <View className="ml-3 flex-1">
      <Text className="text-white font-semibold">
        {isPremium ? 'Premium Active' : 'Redeem Promo Code'}
      </Text>
      {isPromoUser && (
        <Text className="text-green-400 text-xs">Code redeemed ✓</Text>
      )}
    </View>
  </View>
  <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
</Pressable>

// Add modal:
<Modal
  visible={showPromoCode}
  onClose={() => setShowPromoCode(false)}
  title="Promo Code"
  size="full"
>
  <RedeemPromoCodeScreen onClose={() => setShowPromoCode(false)} />
</Modal>
```

---

## 🛡️ Security Best Practices

### 1. **Protect Admin Screen**
```typescript
// Check if user is admin
const ADMIN_EMAILS = ['admin@yourdomain.com'];
const isAdmin = ADMIN_EMAILS.includes(user?.email || '');

if (!isAdmin) {
  return <Text>Access Denied</Text>;
}
```

### 2. **Server-Side Validation**
- Consider Firebase Cloud Functions for code validation
- Prevents code manipulation

### 3. **Rate Limiting**
- Limit redemption attempts per user
- Prevent brute force attacks

---

## 🎨 Ad Placement Examples

### Banner Ads
Place at bottom of free screens:

```typescript
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getBannerAdUnitId } from '../services/adMobService';
import useSubscriptionStore from '../state/subscriptionStore';

// In component:
const { isPremium } = useSubscriptionStore();

{!isPremium && (
  <BannerAd
    unitId={getBannerAdUnitId()}
    size={BannerAdSize.BANNER}
  />
)}
```

### Interstitial Ads
Show between actions:

```typescript
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { getInterstitialAdUnitId } from '../services/adMobService';

const interstitial = InterstitialAd.createForAdRequest(getInterstitialAdUnitId());

interstitial.addAdEventListener(AdEventType.LOADED, () => {
  interstitial.show();
});

interstitial.load();
```

---

## 🚀 Testing

### Test Mode
- Using test Ad Unit IDs in development
- Test RevenueCat purchases with sandbox

### Promo Code Testing
1. Generate test codes in admin screen
2. Try redeeming on different accounts
3. Verify premium features unlock
4. Check Firestore updates

---

## 📊 Monitoring

### RevenueCat Dashboard
- View active subscriptions
- Track revenue
- See churn rates

### AdMob Dashboard
- Ad impressions
- Click-through rates
- Revenue tracking

### Firebase Console
- Monitor promo code usage
- Track redemption rates
- User premium status

---

## 🎉 You're All Set!

Your app now has:
- ✅ Subscriptions via RevenueCat
- ✅ Ads via AdMob
- ✅ Promo code system
- ✅ Admin code generation
- ✅ User redemption flow

### Next Steps:
1. Replace API keys with your actual keys
2. Test on device
3. Submit to app stores
4. Start monetizing! 💰

---

## 🆘 Troubleshooting

### Ads Not Showing?
- Check Ad Unit IDs are correct
- Run `npx expo prebuild --clean`
- Verify app.json configuration

### RevenueCat Errors?
- Verify API key is correct
- Check product/entitlement setup
- Review RevenueCat dashboard

### Promo Codes Not Working?
- Check Firebase rules allow writes to promoCodes
- Verify user is authenticated
- Check Firestore console for code

---

Need help? Check the official docs:
- [RevenueCat Docs](https://docs.revenuecat.com/)
- [AdMob Docs](https://developers.google.com/admob)
- [Firebase Docs](https://firebase.google.com/docs)


