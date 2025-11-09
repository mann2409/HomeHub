# 🎫 Promo Code System - Quick Start Guide

## ✅ What's Been Added

Your app now has a complete promo code system where you can:
1. **Generate codes** that give users premium access
2. **Users redeem codes** to unlock premium features
3. **No payment required** - perfect for giveaways, beta testers, or partners

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run Prebuild
```bash
npx expo prebuild --clean
```

### Step 2: Install iOS Pods
```bash
cd ios && pod install && cd ..
```

### Step 3: Build & Run
```bash
npx expo run:ios
```

---

## 🎯 How to Use

### For You (Admin) - Generating Codes

1. **Access Admin Screen:**
   ```typescript
   // Navigate to:
   import AdminPromoCodeScreen from './src/screens/AdminPromoCodeScreen';
   ```

2. **Generate a Code:**
   - Select type: Lifetime, Monthly, or Yearly
   - Click "Generate Single Code"
   - Share the code with your user!

3. **Code Example:**
   ```
   ABCD-EFGH-JKLM
   ```

### For Users - Redeeming Codes

1. **Add to Settings:**
   Add this button to your Settings screen:

   ```typescript
   import RedeemPromoCodeScreen from './src/screens/RedeemPromoCodeScreen';
   import useSubscriptionStore from './src/state/subscriptionStore';
   
   const [showPromo, setShowPromo] = useState(false);
   const { isPremium } = useSubscriptionStore();

   <Pressable onPress={() => setShowPromo(true)}>
     <Text>{isPremium ? 'Premium Active ✓' : 'Have a Promo Code?'}</Text>
   </Pressable>

   <Modal visible={showPromo} onClose={() => setShowPromo(false)}>
     <RedeemPromoCodeScreen onClose={() => setShowPromo(false)} />
   </Modal>
   ```

2. **User Flow:**
   - User enters code
   - Clicks "Validate & Redeem"
   - Instant premium access! 🎉

---

## 📱 Checking Premium Status

Use this anywhere in your app:

```typescript
import useSubscriptionStore from './src/state/subscriptionStore';

const { isPremium, isPromoUser } = useSubscriptionStore();

if (isPremium) {
  // Show premium features
  // Hide ads
} else {
  // Show ads
  // Limit features
}
```

---

## 🎨 Example: Hide Ads for Premium Users

```typescript
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import useSubscriptionStore from './src/state/subscriptionStore';

function MyScreen() {
  const { isPremium } = useSubscriptionStore();

  return (
    <View>
      {/* Your content */}
      
      {/* Show ads only for non-premium users */}
      {!isPremium && (
        <BannerAd
          unitId="YOUR_AD_UNIT_ID"
          size={BannerAdSize.BANNER}
        />
      )}
    </View>
  );
}
```

---

## 🔥 Code Types

### Lifetime
- One-time code
- Permanent premium access
- Perfect for: Team members, beta testers

### Monthly
- 30 days premium
- Perfect for: Promotions, trials

### Yearly
- 365 days premium
- Perfect for: Partners, influencers

---

## 🎁 Use Cases

### 1. **Beta Testing**
Generate lifetime codes for your beta testers:
```
BETA-2024-ABCD
```

### 2. **Social Media Giveaway**
Generate 50 monthly codes and give them away:
```
GIVEAWAY-XXXX
```

### 3. **Partner Program**
Give yearly codes to partners:
```
PARTNER-XXXX
```

### 4. **Customer Support**
Compensate users with premium access:
```
SUPPORT-XXXX
```

---

## 📊 Firestore Structure

Codes are stored in Firebase:

```
promoCodes/
  └── ABCD-EFGH-JKLM/
      ├── code: "ABCD-EFGH-JKLM"
      ├── type: "lifetime"
      ├── used: false
      ├── createdAt: timestamp

users/
  └── {userId}/
      ├── isPremium: true
      ├── isPromoUser: true
      ├── promoCode: "ABCD-EFGH-JKLM"
```

---

## 🔒 Security

### Protect Admin Screen
Only show to authorized users:

```typescript
const ADMIN_EMAILS = ['your@email.com'];
const isAdmin = ADMIN_EMAILS.includes(user?.email || '');

if (!isAdmin) {
  return <Text>Access Denied</Text>;
}
```

### Code Validation
- Each code can only be used once
- Validated server-side in Firebase
- Automatic tracking of who redeemed what

---

## 🎉 That's It!

You're ready to start giving out premium access codes!

### Quick Actions:
1. ✅ Generate your first code in AdminPromoCodeScreen
2. ✅ Test redemption in RedeemPromoCodeScreen
3. ✅ Add promo button to Settings
4. ✅ Hide ads for premium users

---

## 📝 Notes

- **Test codes** are using Google's test Ad IDs
- Replace with **your actual** AdMob IDs for production
- Replace **RevenueCat API keys** for subscriptions
- Codes are **case-insensitive** and **auto-formatted**

---

## 🆘 Need Help?

Check the full guide: `MONETIZATION_PROMO_SETUP.md`

Questions? Issues? Let me know!


