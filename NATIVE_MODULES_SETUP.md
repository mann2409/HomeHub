# 🔧 Native Modules Setup Guide

## What Happened?

You encountered this error:
```
ERROR  Invariant Violation: `new NativeEventEmitter()` requires a non-null argument.
```

This happens when **native modules** are added but not properly linked to the native code.

---

## 🎯 The Fix

### For iOS:
```bash
# 1. Clean and rebuild native code
npx expo prebuild --clean

# 2. Rebuild and run iOS
npx expo run:ios
```

### For Android:
```bash
# 1. Clean and rebuild native code
npx expo prebuild --clean

# 2. Rebuild and run Android
npx expo run:android
```

---

## 🤔 Why This Happens

When you add native modules like:
- `react-native-purchases` (RevenueCat)
- `react-native-google-mobile-ads` (AdMob)
- Any package with native code (iOS/Android)

You need to **rebuild the native code** so the modules are properly linked.

---

## 📋 When to Run Prebuild

**Always run `npx expo prebuild --clean` after:**

1. ✅ Installing new native modules
2. ✅ Updating native module versions
3. ✅ Changing `app.json` plugins configuration
4. ✅ Modifying native iOS/Android settings

**No need to run after:**
- ❌ Installing pure JavaScript packages
- ❌ Changing React/TypeScript code
- ❌ Updating state management
- ❌ Modifying screens/components (unless they use new native modules)

---

## 🚀 Complete Rebuild Process

### Full Clean Rebuild (if issues persist):

```bash
# 1. Clean everything
rm -rf node_modules
rm -rf ios
rm -rf android
rm bun.lock  # or package-lock.json or yarn.lock

# 2. Reinstall dependencies
bun install  # or npm install or yarn install

# 3. Rebuild native code
npx expo prebuild --clean

# 4. Run the app
npx expo run:ios     # For iOS
npx expo run:android # For Android
```

---

## 🔍 Common Native Module Errors

### Error: "NativeEventEmitter requires non-null argument"
**Solution:** Run `npx expo prebuild --clean` and rebuild

### Error: "Unable to resolve module"
**Solution:** 
1. Clear Metro bundler cache: `npx expo start -c`
2. Rebuild native code

### Error: Pod install failed (iOS)
**Solution:**
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx expo run:ios
```

### Error: Gradle build failed (Android)
**Solution:**
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

## 📦 Native Modules in Your App

Your app currently uses these native modules:

### Monetization:
- ✅ `react-native-purchases` - RevenueCat subscriptions
- ✅ `react-native-google-mobile-ads` - Google AdMob

### Core:
- ✅ `expo-*` modules (many have native code)
- ✅ `react-native-gesture-handler`
- ✅ `react-native-reanimated`
- ✅ `react-native-screens`
- ✅ `react-native-safe-area-context`
- ✅ And others...

---

## 💡 Best Practices

### Development Workflow:

1. **JavaScript Changes** → Just reload app (no rebuild needed)
   ```bash
   # In running app: Press 'r' to reload
   ```

2. **New Native Module** → Prebuild + rebuild
   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```

3. **Native Config Changes** → Prebuild + rebuild
   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```

### Testing Both Platforms:

```bash
# Build iOS
npx expo run:ios

# In another terminal, build Android
npx expo run:android
```

---

## 🎯 Quick Reference

### Commands You'll Use:

| Command | When to Use |
|---------|-------------|
| `npx expo start` | Normal development (no native changes) |
| `npx expo start -c` | Clear cache and restart |
| `npx expo prebuild --clean` | After adding native modules |
| `npx expo run:ios` | Build & run iOS |
| `npx expo run:android` | Build & run Android |
| `npx expo install [package]` | Install Expo-compatible packages |

---

## 🔧 Platform-Specific Rebuilds

### iOS Only:
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

### Android Only:
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

## ⚠️ Important Notes

1. **Prebuild replaces native folders**: Running `npx expo prebuild` will regenerate `ios/` and `android/` folders. If you've made manual changes, they'll be lost.

2. **Commit before prebuild**: Always commit your code before running prebuild in case you need to revert.

3. **Git ignore**: Your `ios/` and `android/` folders should be in `.gitignore` (they are generated).

4. **Development Client**: After adding native modules, you're using a development client (not Expo Go). This is normal and expected.

---

## 📱 App Store Builds

When ready for production:

### iOS:
```bash
eas build --platform ios --profile production
```

### Android:
```bash
eas build --platform android --profile production
```

EAS Build handles all native module linking automatically!

---

## ✅ Verification

After rebuilding, verify everything works:

1. ✅ App launches without errors
2. ✅ All screens accessible
3. ✅ Recipe search works
4. ✅ Dashboard loads
5. ✅ Settings accessible
6. ✅ No NativeEventEmitter errors

---

## 🆘 Still Having Issues?

If problems persist:

1. **Check Logs**: Look for specific error messages
2. **Clear Everything**: Run the "Full Clean Rebuild" process above
3. **Check Compatibility**: Ensure all packages are compatible with your React Native version
4. **Update Expo**: `npm install expo@latest`

---

**Your app is now rebuilding with properly linked native modules!** ✅

The build process takes 2-5 minutes. Once complete, your app will launch automatically with all features working, including:
- ✅ Monetization (RevenueCat + AdMob)
- ✅ Recipe Search
- ✅ All existing features

**No more NativeEventEmitter errors!** 🎉

