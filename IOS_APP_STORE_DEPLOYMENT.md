# iOS App Store Deployment Guide

This guide will walk you through deploying **FamOrganizer** to the iOS App Store.

## 📋 Pre-Deployment Checklist

### ✅ Configuration Status

- [x] **Version Numbers Synced**
  - App Version: `1.0.1` (in both `app.json` and `Info.plist`)
  - Build Number: `6` (in both `app.json` and `Info.plist`)
  - Bundle Identifier: `com.manishsandil.vibecode`

- [x] **Privacy Permissions Configured**
  - `NSPhotoLibraryUsageDescription` - ✅ Added for receipt scanning
  - `PrivacyInfo.xcprivacy` - ✅ Configured for iOS 17+ privacy manifest

- [x] **App Assets**
  - App Icon: `assets/icon.png` - ✅ Present
  - Splash Screen: Configured via Expo

- [x] **EAS Build Configuration**
  - Production build profile configured
  - Release build configuration set

---

## 🔐 Step 1: Set Up Environment Variables

Your app uses several API keys that need to be configured as EAS secrets for production builds.

### Required Environment Variables

1. **OpenAI API Key** (for receipt scanning, pantry scanning, transcription)
   ```bash
   eas secret:create --scope project --name EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY --value "your-openai-api-key"
   ```

2. **Firebase Configuration** (optional, if using environment variables)
   ```bash
   eas secret:create --scope project --name EXPO_PUBLIC_VIBECODE_FIREBASE_API_KEY --value "your-firebase-api-key"
   eas secret:create --scope project --name EXPO_PUBLIC_VIBECODE_FIREBASE_AUTH_DOMAIN --value "your-auth-domain"
   eas secret:create --scope project --name EXPO_PUBLIC_VIBECODE_FIREBASE_PROJECT_ID --value "your-project-id"
   eas secret:create --scope project --name EXPO_PUBLIC_VIBECODE_FIREBASE_STORAGE_BUCKET --value "your-storage-bucket"
   eas secret:create --scope project --name EXPO_PUBLIC_VIBECODE_FIREBASE_MESSAGING_SENDER_ID --value "your-sender-id"
   eas secret:create --scope project --name EXPO_PUBLIC_VIBECODE_FIREBASE_APP_ID --value "your-app-id"
   ```

3. **Other API Keys** (if used)
   ```bash
   eas secret:create --scope project --name EXPO_PUBLIC_VIBECODE_GROK_API_KEY --value "your-grok-key"
   eas secret:create --scope project --name EXPO_PUBLIC_VIBECODE_ANTHROPIC_API_KEY --value "your-anthropic-key"
   ```

**Note:** Currently, Firebase config has fallback values hardcoded, so Firebase env vars are optional. OpenAI API key is **required** for receipt/pantry scanning features.

### Verify Secrets
```bash
eas secret:list
```

---

## 🏗️ Step 2: Build for Production

### Install EAS CLI (if not already installed)
```bash
npm install -g eas-cli
```

### Login to Expo
```bash
eas login
```

### Build iOS Production App
```bash
eas build --platform ios --profile production
```

This will:
- Create a production build optimized for App Store submission
- Sign the app with your Apple Developer credentials
- Generate an `.ipa` file ready for submission

**Build Time:** ~15-30 minutes

### Monitor Build Progress
```bash
eas build:list
```

Or visit: https://expo.dev/accounts/[your-account]/projects/homehub/builds

---

## 📱 Step 3: Configure App Store Connect

### 3.1 Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to **My Apps** → **+** → **New App**
3. Fill in:
   - **Platform:** iOS
   - **Name:** FamOrganizer
   - **Primary Language:** English
   - **Bundle ID:** `com.manishsandil.vibecode`
   - **SKU:** `famorganizer-ios` (unique identifier)
   - **User Access:** Full Access (or Limited Access if using a team)

### 3.2 App Information

Fill in the required fields:

- **Category:** 
  - Primary: Productivity
  - Secondary: Lifestyle (optional)
- **Privacy Policy URL:** (Required - see Step 4)
- **Support URL:** (Required)
- **Marketing URL:** (Optional)

### 3.3 App Store Listing

**App Name:** FamOrganizer (30 characters max)

**Subtitle:** (30 characters max)
- Example: "Family Home Management Made Simple"

**Description:** (4000 characters max)
```
FamOrganizer is your all-in-one family home management app. Organize your household with ease.

Features:
• 📅 Calendar & Tasks - Manage family schedules and to-dos
• 💰 Finance Tracker - Track expenses, set budgets, scan receipts with AI
• 🏠 Household Management - Pantry tracking, meal planning, shopping lists
• 📝 Quick Notes - Capture thoughts and reminders instantly
• 🤖 AI-Powered Features - Smart receipt scanning and pantry management

Perfect for busy families who want to stay organized and in control.
```

**Keywords:** (100 characters max)
```
family, organizer, home, calendar, finance, budget, pantry, meals, shopping, tasks
```

**Promotional Text:** (170 characters max, optional)
```
New: AI-powered receipt scanning! Upload receipts and let AI extract expense details automatically.
```

**Support URL:** 
- Example: `https://yourwebsite.com/support`

**Marketing URL:** (Optional)
- Example: `https://yourwebsite.com`

**App Icon:** Upload 1024x1024 PNG (no transparency)
- Use: `assets/icon.png` (ensure it's 1024x1024)

**Screenshots:** Required sizes:
- 6.7" Display (iPhone 14 Pro Max): 1290 x 2796 pixels
- 6.5" Display (iPhone 11 Pro Max): 1242 x 2688 pixels
- 5.5" Display (iPhone 8 Plus): 1242 x 2208 pixels
- iPad Pro 12.9": 2048 x 2732 pixels

**App Preview Video:** (Optional but recommended)

---

## 📄 Step 4: Privacy & Legal Requirements

### 4.1 Privacy Policy

**Required** - You must host a privacy policy and provide the URL in App Store Connect.

**Privacy Policy Must Include:**
- What data you collect
- How you use the data
- Third-party services (Firebase, Supabase, OpenAI)
- User rights
- Contact information

**Example Sections:**
1. Data Collection (Firebase Auth, Supabase, photo library access)
2. Third-Party Services (OpenAI for receipt scanning, Firebase Analytics)
3. Data Storage (Supabase database, Firebase)
4. User Rights (data deletion, account deletion)
5. Contact Information

**Hosting Options:**
- GitHub Pages
- Netlify
- Vercel
- Your own domain

### 4.2 App Privacy Details (App Store Connect)

In App Store Connect, under **App Privacy**, you'll need to declare:

**Data Collection:**
- ✅ **User ID** (Firebase Auth) - Used for app functionality
- ✅ **Purchase History** (if using in-app purchases)
- ✅ **Photos** (for receipt scanning) - Used for app functionality
- ✅ **Usage Data** (Firebase Analytics) - Used for analytics

**Third-Party Data Sharing:**
- ✅ **OpenAI** - Receipt/pantry image processing
- ✅ **Firebase** - Authentication and analytics
- ✅ **Supabase** - Data storage

**Tracking:** 
- Set to **No** (unless you're using tracking for ads)

---

## 🚀 Step 4: Submit to App Store

### 4.1 Download Build from EAS

After your build completes:

```bash
eas build:list
```

Download the `.ipa` file, or use EAS Submit:

```bash
eas submit --platform ios --latest
```

This will automatically:
- Download the latest production build
- Upload to App Store Connect
- Create a new version in App Store Connect

### 4.2 Complete App Store Connect Submission

1. Go to App Store Connect → Your App → **App Store** tab
2. Select the version you want to submit (e.g., 1.0.1)
3. Fill in all required information:
   - Screenshots
   - Description
   - Keywords
   - Support URL
   - Privacy Policy URL
   - App Privacy details

4. **Version Information:**
   - Version: `1.0.1`
   - Build: Select the build you just uploaded

5. **Age Rating:**
   - Complete the questionnaire (typically 4+ for this app)

6. **App Review Information:**
   - **Contact Information:** Your contact details
   - **Demo Account:** (Optional) If your app requires login
   - **Notes:** Any special instructions for reviewers
     ```
     This app requires:
     - Photo library access for receipt scanning feature
     - Internet connection for AI-powered features
     
     Test Account (if applicable):
     Email: test@example.com
     Password: TestPassword123
     ```

7. **Version Release:**
   - **Automatic:** Release immediately after approval
   - **Manual:** Release manually after approval

### 4.3 Submit for Review

1. Click **Add for Review**
2. Review all sections (green checkmarks)
3. Click **Submit for Review**

**Review Time:** Typically 24-48 hours (can be up to 7 days)

---

## 🔍 Step 5: Post-Submission

### Monitor Submission Status

- Check App Store Connect regularly
- Respond to any reviewer questions promptly
- If rejected, address issues and resubmit

### Common Rejection Reasons

1. **Missing Privacy Policy URL** - Ensure it's accessible
2. **Incomplete App Privacy Details** - Double-check all data collection
3. **Crash on Launch** - Test thoroughly before submission
4. **Missing Functionality** - Ensure all features work as described
5. **Guideline Violations** - Review [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

---

## 📊 Step 6: After Approval

### Release Management

- **Automatic Release:** App goes live immediately after approval
- **Manual Release:** You control when to release

### Monitor Performance

- App Store Connect Analytics
- User reviews and ratings
- Crash reports (if using crash reporting)

### Update Process

For future updates:

1. Increment version in `app.json` and `Info.plist`
2. Increment build number
3. Build: `eas build --platform ios --profile production`
4. Submit: `eas submit --platform ios --latest`
5. Update App Store listing if needed
6. Submit for review

---

## 🛠️ Troubleshooting

### Build Issues

**"No provisioning profile found"**
- Ensure your Apple Developer account is linked: `eas device:create`
- Check bundle identifier matches App Store Connect

**"Code signing error"**
- Verify certificates in Apple Developer portal
- Run: `eas credentials`

### Submission Issues

**"Invalid binary"**
- Ensure build is for App Store (not ad-hoc)
- Check bundle identifier matches exactly

**"Missing compliance"**
- Complete Export Compliance questionnaire in App Store Connect
- Answer "No" to encryption questions (unless using custom encryption)

---

## 📝 Quick Reference Commands

```bash
# Login to Expo
eas login

# List all secrets
eas secret:list

# Create a secret
eas secret:create --scope project --name EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY --value "sk-..."

# Build for production
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --latest

# Check build status
eas build:list

# View credentials
eas credentials
```

---

## ✅ Final Checklist Before Submission

- [ ] All environment variables set in EAS secrets
- [ ] Production build completed successfully
- [ ] App Store Connect app created
- [ ] All screenshots uploaded (required sizes)
- [ ] App description, keywords, and metadata filled
- [ ] Privacy Policy URL added and accessible
- [ ] App Privacy details completed
- [ ] Support URL added
- [ ] Age rating questionnaire completed
- [ ] App review information filled (contact, demo account if needed)
- [ ] Version and build number match
- [ ] Build uploaded to App Store Connect
- [ ] All sections show green checkmarks
- [ ] Ready to submit for review

---

## 🎉 Success!

Once approved, your app will be available on the App Store! Monitor reviews and analytics to improve future versions.

**Good luck with your submission!** 🚀

