# Supabase Setup Guide

## Quick Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the project to be ready

2. **Get Your Credentials**
   - Go to Settings > API
   - Copy your Project URL and anon public key

3. **Update Configuration**
   - Open `src/config/supabase.ts`
   - Replace the placeholder values:
     ```typescript
     const supabaseUrl = 'YOUR_PROJECT_URL';
     const supabaseAnonKey = 'YOUR_ANON_KEY';
     const isDevelopment = false; // Set to false after setup
     ```

4. **Enable Authentication**
   - In Supabase dashboard, go to Authentication > Settings
   - Enable email authentication
   - Configure any additional settings you need

## Features Included

- ✅ Email/Password authentication
- ✅ User registration with names
- ✅ Password reset functionality
- ✅ Persistent sessions with AsyncStorage
- ✅ Automatic auth state management

## Testing

The app will work with placeholder credentials for testing the UI, but you'll need real Supabase credentials for actual authentication to work.
