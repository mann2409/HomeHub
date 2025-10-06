# App Store Privacy & Data Compliance Checklist

## ✅ Completed
- [x] PrivacyInfo.xcprivacy configured with data collection disclosure
- [x] Firebase Authentication setup
- [x] Local data storage (AsyncStorage)
- [x] Family sharing capability

## 🚨 REQUIRED Before Submission

### 1. **Privacy Policy (MANDATORY)**
You **MUST** create and host a privacy policy that explains:
- What data you collect (email, name, tasks, meals, expenses, notes, shopping lists)
- How you use the data (app functionality, family sharing)
- Where data is stored (Firebase Firestore, device local storage)
- How users can delete their data
- Third-party services (Firebase/Google)

**Action Required:**
1. Create a privacy policy document
2. Host it on a public URL (website, GitHub Pages, etc.)
3. Add the URL to App Store Connect during submission

**Template sections your privacy policy should include:**
```
1. Information We Collect
   - Email address (for account creation)
   - Name (for personalization)
   - User-generated content (tasks, meals, expenses, notes, shopping lists)
   
2. How We Use Your Information
   - To provide app functionality
   - To enable family sharing features
   - To sync data across devices
   
3. Data Storage
   - Data is stored on your device (AsyncStorage)
   - Data is synced to Firebase Firestore (Google Cloud)
   - Authentication handled by Firebase Auth
   
4. Data Sharing
   - We do NOT sell your data
   - Data is only shared with family members you explicitly invite
   - Firebase (Google) processes data as a service provider
   
5. Data Retention & Deletion
   - Data is retained while your account is active
   - You can delete your account and all data at any time
   - Instructions for data deletion: [provide instructions]
   
6. Children's Privacy
   - App is not directed at children under 13
   
7. Changes to Privacy Policy
   - We will notify users of significant changes
   
8. Contact Information
   - [Your email for privacy questions]
```

### 2. **App Store Connect - Privacy Questionnaire**
When submitting, you'll need to answer Apple's privacy questions:

**Data Collection Declaration:**
- ✅ **Contact Info**
  - Email Address: YES (for authentication)
  - Name: YES (for personalization)
  
- ✅ **User Content**
  - Other User Content: YES (tasks, meals, expenses, notes, shopping lists)
  
- ❌ **Usage Data**: NO (you don't collect analytics)
- ❌ **Diagnostics**: NO (you don't collect crash data automatically)
- ❌ **Financial Info**: NO (expense tracking is user content, not actual financial accounts)
- ❌ **Location**: NO
- ❌ **Identifiers**: NO
- ❌ **Contacts**: NO

**For each data type, specify:**
- Purpose: App Functionality
- Linked to User: YES
- Used for Tracking: NO

### 3. **Data Deletion Capability (REQUIRED)**
You must provide a way for users to delete their account and data.

**Action Required:** Add account deletion functionality to your app settings.

### 4. **Terms of Service (Optional but Recommended)**
Create Terms of Service if you want to:
- Limit liability
- Define acceptable use
- Reserve rights to terminate accounts

### 5. **Firebase/Google Cloud Compliance**
Since you use Firebase:
- ✅ Firebase is GDPR compliant
- ✅ No additional Firebase privacy manifest needed (already included)
- ⚠️ Mention Firebase/Google in your privacy policy as a service provider

### 6. **App Store Metadata**
In App Store Connect, you'll need:
- Privacy Policy URL (mandatory)
- Support URL (mandatory)
- Marketing URL (optional)
- Category: Productivity
- Age Rating: 4+ (if no objectionable content)

### 7. **Review Preparation**
Provide Apple reviewers with:
- Test account credentials (email/password)
- Instructions on how to use family sharing
- Any special setup requirements

## 📝 Quick Implementation Checklist

### Priority 1 (Before Submission):
1. [ ] Create Privacy Policy
2. [ ] Host Privacy Policy online (get public URL)
3. [ ] Add account deletion feature in app
4. [ ] Test data deletion works properly
5. [ ] Complete App Store Connect privacy questionnaire
6. [ ] Provide test account for Apple reviewers

### Priority 2 (Recommended):
7. [ ] Create Terms of Service
8. [ ] Add support email/contact in app
9. [ ] Test family sharing thoroughly
10. [ ] Screenshot preparation for App Store
11. [ ] App description and keywords

### Priority 3 (Nice to Have):
12. [ ] Create marketing website
13. [ ] Add in-app privacy settings view
14. [ ] Add data export feature (JSON download)
15. [ ] Email verification for new accounts

## 🔐 Security Best Practices

### Current Status:
- ✅ Firebase Authentication (secure)
- ✅ Data encrypted in transit (HTTPS)
- ✅ Firebase Firestore security rules (should be configured)

### Recommended Actions:
1. **Configure Firestore Security Rules** (if not done):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Family data accessible to family members
    match /families/{familyId}/{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/families/$(familyId)/members/$(request.auth.uid));
    }
  }
}
```

2. **Remove hardcoded Firebase credentials** from firebase.ts:
   - Use only environment variables
   - Never commit actual API keys to public repos

3. **Enable Firebase App Check** (recommended):
   - Protects your Firebase resources from abuse

## 📧 Sample Support/Privacy Contact
Create a dedicated email like:
- privacy@yourdomain.com
- support@yourdomain.com
- Or use your personal email

## 🌐 Where to Host Privacy Policy
Free options:
1. **GitHub Pages** (free, easy)
2. **Google Sites** (free)
3. **Notion** (free, shareable)
4. Your personal website
5. **Termly.io** (free privacy policy generator)

## ⚠️ Common Rejection Reasons
Avoid these mistakes:
- ❌ No privacy policy
- ❌ Privacy policy not accessible
- ❌ Not disclosing Firebase/Google usage
- ❌ No way to delete account
- ❌ Privacy questionnaire doesn't match actual data collection
- ❌ App crashes on review
- ❌ Missing test account credentials

## 📱 Next Steps
1. Create privacy policy (use template above)
2. Add account deletion to SettingsScreen
3. Host privacy policy online
4. Test everything thoroughly
5. Submit to App Store Connect

## Resources
- [Apple Privacy Guidelines](https://developer.apple.com/app-store/review/guidelines/#privacy)
- [App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/)
- [Firebase Privacy & Security](https://firebase.google.com/support/privacy)
- [GDPR Compliance](https://gdpr.eu/)

---
**Status**: PrivacyInfo.xcprivacy ✅ Updated
**Next Action**: Create Privacy Policy & Add Account Deletion Feature

