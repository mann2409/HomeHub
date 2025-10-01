# 📱 iOS App Store Deployment Guide - HomeHub

Complete step-by-step guide to deploy your HomeHub app to the iOS App Store.

---

## 🎯 Prerequisites

### 1. Apple Developer Account
- **Cost:** $99/year
- **Sign up:** https://developer.apple.com/programs/
- **Required for:** App Store submission

### 2. Mac Computer
- Required for iOS builds and Xcode
- macOS 12 (Monterey) or later recommended

### 3. Software Installed
- ✅ Xcode (latest version from App Store)
- ✅ Node.js and npm (already installed)
- ✅ EAS CLI (already installed)

---

## 📋 Step-by-Step Deployment Process

### **STEP 1: Configure Your App Information**

#### 1.1 Update `app.json` with App Store Details

Open `app.json` and update these fields:

```json
{
  "expo": {
    "name": "HomeHub",
    "slug": "homehub",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#1A1B2E"
    },
    "ios": {
      "bundleIdentifier": "com.yourcompany.homehub",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses the camera to...",
        "NSPhotoLibraryUsageDescription": "This app accesses your photos to..."
      }
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_PROJECT_ID"
      }
    }
  }
}
```

**Important:** Replace `com.yourcompany.homehub` with your unique bundle identifier.

---

### **STEP 2: Login to Expo Account**

Run in your terminal:

```bash
eas login
```

- If you don't have an Expo account, create one at https://expo.dev
- Enter your email and password when prompted

---

### **STEP 3: Configure EAS Build**

Initialize EAS in your project:

```bash
eas build:configure
```

This will create an `eas.json` file with build configurations.

---

### **STEP 4: Update eas.json Configuration**

Your `eas.json` should look like this:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "simulator": false,
        "bundleIdentifier": "com.yourcompany.homehub"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your.apple.id@email.com",
        "ascAppId": "YOUR_ASC_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

---

### **STEP 5: Prepare App Assets**

#### 5.1 App Icon (1024x1024px)
- Create a high-quality PNG icon
- Place it in `assets/icon.png`
- No rounded corners or transparency

#### 5.2 Splash Screen (1284x2778px recommended)
- Create a splash screen image
- Place it in `assets/splash.png`

#### 5.3 Screenshots (Required for App Store)
Prepare screenshots for:
- iPhone 6.7" (1290 x 2796 pixels)
- iPhone 6.5" (1242 x 2688 pixels)
- iPad Pro 12.9" (2048 x 2732 pixels) - if supporting tablets

---

### **STEP 6: Create App Store Connect Listing**

1. Go to https://appstoreconnect.apple.com/
2. Click **"My Apps"**
3. Click **"+"** and select **"New App"**
4. Fill in:
   - **Platform:** iOS
   - **Name:** HomeHub (or your app name)
   - **Primary Language:** English
   - **Bundle ID:** Select the one you created (com.yourcompany.homehub)
   - **SKU:** homehub-001 (unique identifier)
   - **User Access:** Full Access

5. Click **"Create"**

---

### **STEP 7: Build Your App for Production**

Run the build command:

```bash
eas build --platform ios --profile production
```

**What happens:**
- EAS will build your app in the cloud
- Build takes 15-30 minutes
- You'll get a `.ipa` file (iOS app package)

**Monitor your build:**
- Check status at: https://expo.dev/accounts/[your-account]/projects/homehub/builds

---

### **STEP 8: Configure Apple Credentials**

During the build, EAS will ask for:

#### Option 1: Let EAS Manage (Recommended for first-time)
```bash
? How would you like to upload your credentials?
> Let EAS handle the process
```

#### Option 2: Provide Your Own Credentials
- Apple ID
- App-specific password
- Apple Team ID

**To create an app-specific password:**
1. Go to https://appleid.apple.com
2. Sign in with your Apple ID
3. Go to **Security** → **App-Specific Passwords**
4. Click **"+"** and create a new password
5. Save it securely

---

### **STEP 9: Submit to App Store**

Once the build is complete:

```bash
eas submit --platform ios --latest
```

Or manually:

1. Download the `.ipa` file from the EAS build page
2. Open **Xcode**
3. Go to **Window** → **Organizer**
4. Drag the `.ipa` file into Organizer
5. Click **"Distribute App"**
6. Select **"App Store Connect"**
7. Follow the prompts

---

### **STEP 10: Complete App Store Connect Information**

1. Go to https://appstoreconnect.apple.com/
2. Select your app
3. Fill in required information:

#### App Information
- **Category:** Productivity (or appropriate category)
- **Content Rights:** Check if you own all rights

#### Pricing and Availability
- **Price:** Free or set a price
- **Availability:** All territories or select specific countries

#### App Privacy
- Fill out the privacy questions
- Based on your app, you're collecting:
  - Email addresses (for authentication)
  - Name (for user profile)
  - Usage Data (tasks, expenses, meals, shopping lists)

#### Prepare for Submission
- **Screenshots:** Upload your prepared screenshots
- **App Description:** Write a compelling description
- **Keywords:** Add relevant keywords (max 100 characters)
- **Support URL:** Your website or support page
- **Marketing URL:** (optional)
- **Promotional Text:** Brief description (170 characters)

#### Version Information
- **What's New in This Version:** Describe new features
- **Build:** Select the build you uploaded

#### Rating
- Complete the age rating questionnaire

---

### **STEP 11: Submit for Review**

1. Review all information
2. Click **"Add for Review"**
3. Click **"Submit to App Review"**

**Review Timeline:**
- Typically takes 24-48 hours
- Can take up to 1 week during busy periods

---

## 🚀 Quick Commands Reference

```bash
# Login to EAS
eas login

# Configure EAS build
eas build:configure

# Build for iOS production
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --latest

# Check build status
eas build:list

# View project info
eas project:info
```

---

## 📝 App Store Information Template

### App Name
**HomeHub** - Daily Task & Expense Manager

### Subtitle (30 characters)
Organize your life effortlessly

### Description (4000 characters max)
```
HomeHub is your all-in-one daily life management app that helps you stay organized and productive. Manage your tasks, track expenses, plan meals, and organize shopping lists - all in one beautiful, intuitive app.

KEY FEATURES:

📋 Task Management
• Create and organize tasks with priorities
• Set due dates and recurring tasks
• Categorize tasks (personal, work, health, home, finance)
• Track completed tasks and stay productive

💰 Finance Tracking
• Track expenses and income
• Categorize transactions
• View spending analytics
• Multiple payment methods support

🍽️ Meal Planning
• Weekly meal planner
• Dietary badges (vegetarian, vegan, gluten-free, etc.)
• Prep time and serving tracking
• Recipe notes and ingredients

🛒 Shopping Lists
• Smart shopping list management
• Auto-categorization
• Priority levels
• Price estimation
• Mark items as purchased

✨ Additional Features
• Beautiful dark theme
• Calendar view
• Quick notes
• Daily summaries
• Sync across devices
• Secure Firebase authentication

Perfect for busy professionals, students, families, and anyone looking to simplify their daily routines.

Download HomeHub today and take control of your daily life!
```

### Keywords (100 characters max)
```
task,todo,expense,budget,meal,planner,shopping,list,productivity,organizer,finance,tracker
```

### Support URL
```
https://yourwebsite.com/support
```

### Privacy Policy URL
```
https://yourwebsite.com/privacy
```

---

## 🔒 Privacy Policy Requirements

You'll need a privacy policy. Here's what to include:

1. **Data Collection:**
   - Email address (for authentication)
   - Name (for user profile)
   - Tasks, expenses, meals, shopping lists (user-generated content)

2. **Data Usage:**
   - To provide app functionality
   - To sync across devices
   - To send password reset emails

3. **Data Storage:**
   - Stored securely in Firebase
   - Encrypted in transit
   - Only accessible by the user

4. **Third-Party Services:**
   - Firebase (Google)
   - Expo

5. **User Rights:**
   - Right to access data
   - Right to delete account
   - Right to export data

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Bundle Identifier Already in Use"
**Solution:** Choose a unique bundle identifier in `app.json`

### Issue 2: "Missing Compliance Information"
**Solution:** In App Store Connect, go to **App Privacy** and complete all questions

### Issue 3: "Build Failed"
**Solution:** 
- Check `eas build:list` for error details
- Common causes: Missing credentials, syntax errors, dependencies issues

### Issue 4: "App Rejected"
**Solution:** 
- Read rejection notes carefully
- Common reasons: Missing privacy policy, incomplete metadata, crashes
- Fix issues and resubmit

---

## 📊 After Approval

### Monitor Your App
- **Analytics:** Check App Store Connect analytics
- **Crashes:** Monitor crash reports
- **Reviews:** Respond to user reviews

### Updates
To release updates:
1. Update version in `app.json`
2. Build new version: `eas build --platform ios --profile production`
3. Submit: `eas submit --platform ios --latest`
4. Update "What's New" in App Store Connect
5. Submit for review

---

## 💡 Best Practices

1. **Test Thoroughly**
   - Test on real devices
   - Test all features
   - Check for crashes

2. **App Store Optimization (ASO)**
   - Use clear, descriptive screenshots
   - Write compelling description
   - Choose relevant keywords
   - Encourage positive reviews

3. **Version Management**
   - Increment version number for each release
   - Keep "What's New" section updated
   - Maintain changelog

4. **User Feedback**
   - Respond to reviews
   - Fix reported bugs quickly
   - Consider feature requests

---

## 📞 Support Resources

- **Expo Documentation:** https://docs.expo.dev/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **EAS Submit:** https://docs.expo.dev/submit/introduction/
- **Apple Developer:** https://developer.apple.com/support/
- **App Store Connect:** https://help.apple.com/app-store-connect/

---

## ✅ Pre-Submission Checklist

- [ ] Apple Developer account active ($99/year)
- [ ] Unique bundle identifier configured
- [ ] App icon (1024x1024px) ready
- [ ] Screenshots prepared for all required sizes
- [ ] Privacy policy created and hosted
- [ ] Support URL active
- [ ] App description written
- [ ] Keywords selected
- [ ] Pricing decided
- [ ] Age rating completed
- [ ] All Firebase credentials secured
- [ ] App tested on real iOS devices
- [ ] No crashes or major bugs
- [ ] EAS build successful
- [ ] App Store Connect listing complete

---

## 🎉 Next Steps

1. **Review this guide**
2. **Prepare all assets** (icon, screenshots, descriptions)
3. **Run:** `eas login`
4. **Run:** `eas build:configure`
5. **Update:** `app.json` with correct bundle identifier
6. **Build:** `eas build --platform ios --profile production`
7. **Submit:** `eas submit --platform ios --latest`
8. **Complete App Store Connect information**
9. **Submit for review**
10. **Wait for approval** (24-48 hours typically)

---

**Good luck with your App Store submission! 🚀**

If you need help at any step, refer to this guide or contact Expo/Apple support.

