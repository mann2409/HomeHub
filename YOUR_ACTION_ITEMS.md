# 🎯 Your Action Items for App Store Submission

## ✅ What I've Done For You

1. ✅ **Synced version numbers** - App is at version `1.0.1`, build `6`
2. ✅ **Created new production build** - Build is ready and waiting!
3. ✅ **Verified configuration** - All settings are correct
4. ✅ **Created deployment guides** - Check `IOS_APP_STORE_DEPLOYMENT.md` for full details

---

## 🚨 What YOU Need to Do (In Order)

### Step 1: Set OpenAI API Key (2 minutes) ⚠️ CRITICAL

Your receipt scanning and pantry features need this:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY --value "sk-your-actual-key-here"
```

**Get your key from:** https://platform.openai.com/api-keys

**Why:** Without this, AI features won't work in production.

---

### Step 2: Create App in App Store Connect (10 minutes)

1. Go to: https://appstoreconnect.apple.com
2. Login with your Apple Developer account
3. Click **My Apps** → **+** → **New App**
4. Fill in:
   - Platform: **iOS**
   - Name: **FamOrganizer**
   - Primary Language: **English**
   - Bundle ID: **com.manishsandil.vibecode** (select from dropdown)
   - SKU: **famorganizer-ios** (any unique identifier)
5. Click **Create**

**Note the App ID** (a number like `1234567890`) - you'll need this later.

---

### Step 3: Upload Your Build (5 minutes)

**Option A: Manual Upload (Easiest for first time)**

1. Download the IPA file:
   - URL: https://expo.dev/artifacts/eas/qfVxKXECkyh6RMsPLxR5ys.ipa
   - Or visit: https://expo.dev/accounts/manishsandil/projects/homehub/builds/c470bd8f-74ca-4a36-849a-c299da8edbc2

2. **Install Apple Transporter** (if you don't have it):
   - Download from Mac App Store: https://apps.apple.com/app/transporter/id1450874784
   - Or use: `xcode-select --install` then `mas install 1450874784`

3. **Upload via Transporter:**
   - Open **Transporter** app
   - Click **+** or drag & drop the `.ipa` file
   - Sign in with your Apple Developer account
   - Click **Deliver** - it will upload to App Store Connect

4. **Wait for processing** (10-30 minutes):
   - Go to App Store Connect → Your App → **TestFlight** tab
   - Wait until you see your build appear under "Builds" with status "Complete"
   - Once processed, proceed to Step 5 below

5. **Create New Version in Distribution** (if build is version 1.0.1 but Distribution shows 1.0.0):
   - Go to **Distribution** → **App Store** tab
   - In the left sidebar, under "iOS App", you should see "1.0 Ready for Distribution"
   - Click the **blue "+" icon** next to "iOS App" (or click "Add Version" if visible)
   - Enter version number: **1.0.1**
   - Click **Create**
   - You'll now see "iOS App Version 1.0.1" in the main content area

6. **Select Your Build:**
   - In the "Build" section, click **"Select a build before you submit your app"** or the build dropdown
   - You should see Build 9 (1.0.1) available
   - Select **Build 9**
   - The build will now be associated with Version 1.0.1

**Option B: Automatic Upload (After Step 2)**

Once you have the App ID from Step 2, I can help you set it up for automatic submission.

---

### Step 4: Fill Out App Store Listing (30-45 minutes)

In App Store Connect, complete these sections:

#### A. App Information
- **Category:** Productivity (Primary), Lifestyle (Secondary)
- **Privacy Policy URL:** ⚠️ **REQUIRED** - See Step 5 below
- **Support URL:** ⚠️ **REQUIRED** - Your website or support email
- **Marketing URL:** (Optional)

#### B. App Store Listing
- **App Name:** FamOrganizer
- **Subtitle:** (30 chars) - e.g., "Family Home Management"
- **Description:** (4000 chars) - Describe your app's features
- **Keywords:** (100 chars) - e.g., "family, organizer, home, calendar, finance, budget"
- **Promotional Text:** (170 chars, optional)
- **App Icon:** Upload 1024x1024 PNG from `assets/icon.png`

#### C. Screenshots ⚠️ REQUIRED

You need screenshots in these exact sizes:

1. **iPhone 6.7" (iPhone 14 Pro Max):** 1290 x 2796 pixels
2. **iPhone 6.5" (iPhone 11 Pro Max):** 1242 x 2688 pixels  
3. **iPhone 5.5" (iPhone 8 Plus):** 1242 x 2208 pixels
4. **iPad Pro 12.9":** 2048 x 2732 pixels

**How to get them:**
- Run app on iOS Simulator
- Take screenshots of key screens (Dashboard, Finance, Household)
- Resize using Preview app or online tool

#### D. App Privacy
- Declare: User ID, Photos, Usage Data
- Third-party: OpenAI, Firebase, Supabase
- Tracking: **No**

#### E. Version Information
- Version: `1.0.1`
- Build: Select the build you uploaded

#### F. App Review Information
- **Contact Info:** Your email/phone
- **Demo Account:** (If app requires login)
- **Notes:**
  ```
  This app requires:
  - Photo library access for receipt scanning feature
  - Internet connection for AI-powered features
  ```

---

### Step 5: Create Privacy Policy (20-30 minutes) ⚠️ REQUIRED

You **must** host a privacy policy. Apple will reject your app without it.

**Quick Options:**
1. **GitHub Pages** (Free, easiest)
   - Create a repo
   - Add `privacy-policy.md`
   - Enable GitHub Pages
   - URL: `https://yourusername.github.io/repo-name/privacy-policy`

2. **Netlify Drop** (Free, drag & drop)
   - Go to: https://app.netlify.com/drop
   - Drag an HTML file
   - Get instant URL

3. **Your own website**

**What to Include:**
- Data collection (Firebase Auth, Supabase, photos)
- How data is used
- Third-party services (OpenAI, Firebase, Supabase)
- User rights (data deletion)
- Contact information

**Template:** See `IOS_APP_STORE_DEPLOYMENT.md` for detailed template.

---

### Step 6: Submit for Review (2 minutes)

1. In App Store Connect, ensure all sections have ✅ green checkmarks
2. Click **Add for Review**
3. Review the summary
4. Click **Submit for Review**

**Review Time:** 24-48 hours typically (can be up to 7 days)

---

## 📋 Quick Checklist

Before submitting, verify:

- [ ] OpenAI API key set: `eas secret:create ...`
- [ ] App created in App Store Connect
- [ ] Build uploaded to App Store Connect
- [ ] All screenshots uploaded (4 sizes)
- [ ] App description, keywords filled
- [ ] Privacy Policy URL added and working
- [ ] App Privacy details completed
- [ ] Support URL added
- [ ] Age rating completed
- [ ] App review info filled
- [ ] All sections show ✅ green checkmarks

---

## 🆘 Need Help?

- **Build Status:** https://expo.dev/accounts/manishsandil/projects/homehub/builds
- **App Store Connect:** https://appstoreconnect.apple.com
- **Full Guide:** See `IOS_APP_STORE_DEPLOYMENT.md`

---

## 🎉 You're Almost There!

The technical work is **100% complete**. Your build is ready. Now it's just:
1. Setting the API key
2. Filling out forms in App Store Connect
3. Creating a privacy policy
4. Uploading screenshots

**Estimated time:** 1-2 hours total

Good luck! 🚀

