# App Store Submission Checklist for HomeHub

**Use this checklist to ensure you're ready for App Store submission.**

---

## ✅ Pre-Submission Checklist

### Phase 1: Privacy & Legal (MUST COMPLETE)

- [ ] **Update email address in documents**
  - [ ] Open `PRIVACY_POLICY.md` → Replace `[YOUR EMAIL ADDRESS]` with your support email
  - [ ] Open `TERMS_OF_SERVICE.md` → Replace `[YOUR EMAIL ADDRESS]` and `[YOUR STATE]`
  
- [ ] **Host Privacy Policy online**
  - [ ] Choose hosting method (GitHub Pages, Gist, Google Sites, or Notion)
  - [ ] Upload `PRIVACY_POLICY.md`
  - [ ] Get public URL and test it works
  - [ ] **Privacy Policy URL:** `_______________________________`
  
- [ ] **Host Terms of Service online (optional but recommended)**
  - [ ] Upload `TERMS_OF_SERVICE.md`
  - [ ] Get public URL
  - [ ] **Terms of Service URL:** `_______________________________`

- [ ] **Test account deletion feature**
  - [ ] Create a test account
  - [ ] Go to Settings → Account → Delete Account
  - [ ] Verify account and data are deleted
  - [ ] Verify you can't log back in with deleted credentials

- [ ] **Privacy Info file is updated**
  - [x] `ios/homehub/PrivacyInfo.xcprivacy` has been updated ✓

### Phase 2: App Information

- [ ] **App Store Connect Account**
  - [ ] Apple Developer account active ($99/year)
  - [ ] Paid and in good standing
  
- [ ] **App Information**
  - [ ] App Name: **HomeHub** (or your chosen name)
  - [ ] Bundle ID: `com.manishsandil.vibecode`
  - [ ] Primary Language: **English**
  - [ ] Category: **Productivity**
  - [ ] Secondary Category (optional): **Lifestyle**

- [ ] **Pricing & Availability**
  - [ ] Price: **Free** (or your chosen price)
  - [ ] Territories: **All territories** (or your selection)
  
### Phase 3: App Description & Metadata

- [ ] **App Description** (write a compelling description)
  ```
  Example:
  HomeHub is your all-in-one family organization app. Manage tasks, 
  plan meals, track expenses, create shopping lists, and keep notes - 
  all in one beautiful app. Share with family members to stay organized together.
  
  FEATURES:
  • Task Management - Create, organize, and complete tasks
  • Meal Planning - Plan weekly meals and save recipes
  • Expense Tracking - Monitor spending by category
  • Shopping Lists - Never forget an item
  • Quick Notes - Capture thoughts quickly
  • Family Sharing - Collaborate with family members
  • Beautiful Dark Theme - Easy on the eyes
  • Offline Support - Works without internet
  • Data Export - Backup your data anytime
  ```

- [ ] **Keywords** (100 characters max)
  ```
  Example: family organizer,task manager,meal planner,expense tracker,
  shopping list,notes,family sharing,productivity,calendar
  ```

- [ ] **Support URL**
  - [ ] Create a support page or use privacy policy URL
  - [ ] **Support URL:** `_______________________________`

- [ ] **Marketing URL** (optional)
  - [ ] Create app website or landing page
  - [ ] **Marketing URL:** `_______________________________`

### Phase 4: Screenshots & Assets

- [ ] **App Icon**
  - [x] 1024x1024px icon created
  - [ ] Icon uploaded to App Store Connect
  
- [ ] **iPhone Screenshots** (Required)
  - [ ] 6.7" display (iPhone 15 Pro Max): At least 3 screenshots
    - [ ] Screenshot 1: Dashboard/Home screen
    - [ ] Screenshot 2: Task management
    - [ ] Screenshot 3: Meal planning
    - [ ] Screenshot 4: Finance tracking (optional)
    - [ ] Screenshot 5: Family sharing (optional)
  
- [ ] **iPad Screenshots** (If supporting iPad)
  - [ ] 12.9" display: At least 3 screenshots

**Screenshot Tips:**
- Show key features
- Use device frames
- Add text overlays explaining features
- Make them visually appealing

### Phase 5: App Review Information

- [ ] **Test Account Credentials** (REQUIRED for review)
  - [ ] Create a demo account with sample data
  - [ ] **Email:** `_______________________________`
  - [ ] **Password:** `_______________________________`
  - [ ] Add sample tasks, meals, expenses to showcase features

- [ ] **Review Notes**
  ```
  Example notes for Apple reviewers:
  
  Test Account: See credentials above
  
  Key Features to Test:
  1. Task Management - Create and complete tasks
  2. Meal Planning - Add meals and view weekly plan
  3. Expense Tracking - Add expenses and view charts
  4. Shopping Lists - Create and check off items
  5. Notes - Quick note taking
  6. Family Sharing - Available in Settings (requires 2 accounts)
  
  Data Storage:
  - Uses Firebase for authentication and cloud sync
  - Local storage with AsyncStorage for offline use
  - Account deletion available in Settings → Account
  
  Privacy:
  - No tracking or analytics
  - No ads
  - Data only shared with family members user invites
  ```

- [ ] **Contact Information**
  - [ ] Phone number: `_______________________________`
  - [ ] Email: `_______________________________`

### Phase 6: App Privacy Questionnaire

Complete in App Store Connect:

- [ ] **Data Collection - Contact Info**
  - [x] Email Address: **YES**
    - Linked to user: **YES**
    - Used for tracking: **NO**
    - Purpose: **App Functionality**
  - [x] Name: **YES**
    - Linked to user: **YES**
    - Used for tracking: **NO**
    - Purpose: **App Functionality**

- [ ] **Data Collection - User Content**
  - [x] Other User Content: **YES** (tasks, meals, expenses, notes, shopping lists)
    - Linked to user: **YES**
    - Used for tracking: **NO**
    - Purpose: **App Functionality**

- [ ] **Data Collection - Other Categories**
  - Location: **NO**
  - Health & Fitness: **NO**
  - Financial Info: **NO** (expense tracking is user content, not financial accounts)
  - Contacts: **NO**
  - User Content (Photos, Videos): **NO**
  - Browsing History: **NO**
  - Search History: **NO**
  - Identifiers: **NO**
  - Usage Data: **NO**
  - Diagnostics: **NO**

- [ ] **Privacy Policy URL**
  - [ ] Added to App Store Connect
  - [ ] URL is accessible and working

### Phase 7: Age Rating

- [ ] **Age Rating Questionnaire**
  - Cartoon or Fantasy Violence: **None**
  - Realistic Violence: **None**
  - Sexual Content or Nudity: **None**
  - Profanity or Crude Humor: **None**
  - Horror or Fear Themes: **None**
  - Medical/Treatment Information: **None**
  - Alcohol, Tobacco, or Drug Use: **None**
  - Gambling: **None**
  - Unrestricted Web Access: **No**
  - **Expected Rating: 4+**

### Phase 8: Build & Testing

- [ ] **Build the app**
  - [ ] Run `npx expo prebuild` (if needed)
  - [ ] Run `npx expo run:ios --configuration Release`
  - [ ] Test on physical device
  - [ ] Verify all features work

- [ ] **Create Archive**
  - [ ] Open Xcode
  - [ ] Select "Any iOS Device" as destination
  - [ ] Product → Archive
  - [ ] Wait for archive to complete

- [ ] **Upload to App Store Connect**
  - [ ] Distribute App → App Store Connect
  - [ ] Upload
  - [ ] Wait for processing (can take 15-60 minutes)

- [ ] **Select Build**
  - [ ] Go to App Store Connect
  - [ ] Select your app
  - [ ] Select the build you uploaded

### Phase 9: Testing Before Submission

Test these critical features:

- [ ] **Authentication**
  - [ ] Sign up works
  - [ ] Sign in works
  - [ ] Forgot password works
  - [ ] Sign out works

- [ ] **Core Features**
  - [ ] Tasks - Create, edit, complete, delete
  - [ ] Meals - Add, edit, delete
  - [ ] Expenses - Add, edit, delete, view charts
  - [ ] Shopping - Create lists, check off items
  - [ ] Notes - Create, edit, delete

- [ ] **Family Sharing**
  - [ ] Create family group
  - [ ] Invite family member
  - [ ] Accept invitation
  - [ ] Share data
  - [ ] Remove family member

- [ ] **Settings**
  - [ ] Change preferences
  - [ ] Export data works
  - [ ] Account deletion works

- [ ] **No Crashes**
  - [ ] App doesn't crash on any screen
  - [ ] Test on different device sizes
  - [ ] Test with no internet connection
  - [ ] Test with slow internet

### Phase 10: Final Checks

- [ ] **App doesn't contain:**
  - [ ] Placeholder content
  - [ ] "Lorem ipsum" text
  - [ ] Debug logs in console
  - [ ] Test data hardcoded
  - [ ] Broken links
  - [ ] Missing images
  - [ ] Development API keys (use production keys)

- [ ] **Compliance**
  - [ ] No copyright violations (images, fonts, etc.)
  - [ ] No trademark violations
  - [ ] Privacy policy is accurate
  - [ ] Terms of service is accurate

- [ ] **Localization** (if applicable)
  - [ ] All text is in correct language
  - [ ] Date formats are correct
  - [ ] Currency symbols are correct

---

## 📝 Submit to App Review

Once everything above is complete:

1. Go to App Store Connect
2. Navigate to your app
3. Click "Add for Review"
4. Answer all questions
5. Submit for Review

**Review Time:** Typically 24-48 hours, can be up to 7 days

---

## 🚫 Common Rejection Reasons (Avoid These!)

- ❌ Crashes or bugs
- ❌ Incomplete information
- ❌ Broken links (privacy policy, support)
- ❌ Missing test account credentials
- ❌ Privacy policy doesn't match actual data collection
- ❌ App doesn't work as described
- ❌ Placeholder content or dummy data
- ❌ No way to delete account
- ❌ Requires payment before viewing functionality

---

## ✅ If Approved

1. **Celebrate!** 🎉
2. App will be available on App Store within 24 hours
3. Share your app link
4. Monitor reviews and ratings
5. Respond to user feedback
6. Plan updates and improvements

---

## ❌ If Rejected

1. **Don't panic** - Most apps get rejected on first submission
2. Read rejection message carefully
3. Fix the specific issues mentioned
4. Respond to reviewer or resubmit
5. Most rejections are quick fixes

**Common fixes:**
- Update privacy policy
- Fix crashes
- Provide better demo account
- Clarify functionality in review notes

---

## 📞 Support During Review

If reviewers have questions:
- They'll contact you via App Store Connect
- Respond quickly (within 24 hours)
- Be helpful and professional
- Provide additional information if requested

---

## 📊 Post-Launch Checklist

After your app is live:

- [ ] **Monitor**
  - [ ] Check reviews daily
  - [ ] Respond to user feedback
  - [ ] Monitor crash reports
  - [ ] Track download numbers

- [ ] **Marketing**
  - [ ] Share on social media
  - [ ] Create landing page
  - [ ] Blog about launch
  - [ ] Reach out to press/bloggers

- [ ] **Updates**
  - [ ] Plan feature updates
  - [ ] Fix any bugs users report
  - [ ] Keep app current with iOS updates
  - [ ] Update privacy policy if data practices change

---

## 🔗 Important Links

- App Store Connect: https://appstoreconnect.apple.com
- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines/

---

## ✅ Ready to Submit?

Complete this final check:

- [ ] All items in Phase 1-10 are checked
- [ ] Privacy policy is live and accessible
- [ ] Test account works with sample data
- [ ] App has been tested thoroughly
- [ ] Screenshots look professional
- [ ] App description is compelling
- [ ] Build is uploaded and processed
- [ ] All App Store Connect fields are filled
- [ ] You've reviewed everything twice

**If all above are checked, you're ready to submit! Good luck! 🚀**

---

**Questions?**
Review the `APP_STORE_PRIVACY_CHECKLIST.md` and `HOSTING_PRIVACY_POLICY_GUIDE.md` files for more detailed information.

**Last Updated:** October 6, 2025

