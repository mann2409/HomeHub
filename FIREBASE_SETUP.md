# Firebase Authentication Setup

This guide will help you set up Firebase Authentication for your HomeHub app.

## Prerequisites

- Firebase project created
- Firebase Authentication enabled in your Firebase console
- Email/Password authentication method enabled

## Setup Steps

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "homehub-app")
4. Follow the setup wizard

### 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### 3. Get Firebase Configuration

1. In your Firebase project, go to "Project settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (</>)
4. Register your app with a nickname
5. Copy the Firebase configuration object

### 4. Update Firebase Configuration

Replace the placeholder values in `src/config/firebase.ts` with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

### 5. Test the Authentication

1. Run your app: `npm start` or `expo start`
2. You should see the Sign In screen
3. Click "Create Account" to test sign up
4. Try signing in with the created account

## Features Included

- ✅ Email/Password Authentication
- ✅ User Registration
- ✅ User Login
- ✅ Persistent Login (stays logged in)
- ✅ Logout Functionality
- ✅ User Account Display in Settings
- ✅ Error Handling
- ✅ Loading States
- ✅ Dark Theme Integration

## Security Notes

- All authentication is handled securely by Firebase
- User data is stored in Firebase Auth
- Local app data is stored separately using AsyncStorage
- No sensitive data is stored in plain text

## Troubleshooting

### Common Issues

1. **"Firebase not initialized" error**
   - Make sure you've updated the Firebase configuration with your actual values

2. **"Authentication failed" error**
   - Check that Email/Password authentication is enabled in Firebase Console
   - Verify your Firebase configuration is correct

3. **App crashes on startup**
   - Ensure all Firebase dependencies are properly installed
   - Check that AsyncStorage is working correctly

### Getting Help

- Check the [Firebase Documentation](https://firebase.google.com/docs/auth)
- Review the [React Native Firebase Guide](https://rnfirebase.io/)
- Check the console for error messages

## Next Steps

After setting up authentication, you can:

1. Add password reset functionality
2. Implement social login (Google, Apple, etc.)
3. Add user profile management
4. Sync user data with Firestore
5. Add email verification
