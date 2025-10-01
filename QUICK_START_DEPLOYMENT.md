# 🚀 Quick Start - iOS Deployment

## Prerequisites
1. ✅ Apple Developer Account ($99/year) - https://developer.apple.com/programs/
2. ✅ EAS CLI installed (already done)

## Quick Steps (30 minutes)

### Step 1: Login to Expo
```bash
eas login
```
Enter your Expo account credentials (create one at expo.dev if needed)

### Step 2: Link Project to EAS
```bash
eas build:configure
```
This will set up your project for EAS builds.

### Step 3: Update Bundle Identifier (if needed)
Your current bundle ID is: `com.manishsandil.vibecode`

To change it, edit `app.json` and `eas.json`

### Step 4: Build for iOS
```bash
eas build --platform ios --profile production
```

**This will:**
- Build your app in the cloud (15-30 minutes)
- Ask for Apple credentials
- Generate an `.ipa` file

**During build, you'll be asked:**
- Apple ID
- App-specific password (create at appleid.apple.com)
- Team ID

### Step 5: Create App Store Listing
While build is running:
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Name: vibecode (or your preferred name)
   - Bundle ID: com.manishsandil.vibecode
   - SKU: vibecode-001
4. Click "Create"

### Step 6: Submit to App Store
After build completes:
```bash
eas submit --platform ios --latest
```

Or download the `.ipa` and upload via Xcode.

### Step 7: Complete App Store Information
1. Go to App Store Connect
2. Fill in:
   - Screenshots
   - Description
   - Keywords
   - Privacy policy
   - Support URL
3. Click "Submit for Review"

## 📞 Need Help?

See the complete guide: `IOS_DEPLOYMENT_GUIDE.md`

## Common First-Time Issues

1. **"Apple ID authentication required"**
   - Create app-specific password at appleid.apple.com
   
2. **"Bundle identifier already in use"**
   - Change in `app.json` and `eas.json` to something unique

3. **"Build failed"**
   - Check `eas build:list` for errors
   - Usually: missing dependencies or syntax errors

## Next Commands

```bash
# Check build status
eas build:list

# View project info
eas project:info

# Build and submit in one command
eas build --platform ios --profile production --auto-submit
```

---

**Estimated Time:**
- Initial setup: 30 minutes
- Build time: 15-30 minutes  
- App Store review: 24-48 hours

**Total: Your app can be live in 2-3 days!** 🎉

