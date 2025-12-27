# How to Create an Updated IPA for App Store

## Quick Answer

Run this command to create a new production build:

```bash
eas build --platform ios --profile production
```

This will:
1. Package your app
2. Build it for iOS
3. Sign it with your Apple Developer certificate
4. Generate an `.ipa` file ready for App Store submission
5. Upload it to EAS servers

**Build time:** ~15-30 minutes

---

## Step-by-Step Guide

### 1. Make Sure You're Logged In

```bash
eas whoami
```

If not logged in:
```bash
eas login
```

### 2. Create the Build

```bash
cd /Users/manishsandil/Desktop/Github_projects/XCODE/vibecode/HomeHub
eas build --platform ios --profile production
```

### 3. Monitor Build Progress

The build will run in the cloud. You can:

**Option A: Watch in Terminal**
- The command will show progress
- Wait for "Build finished" message

**Option B: Check Online**
- Visit: https://expo.dev/accounts/manishsandil/projects/homehub/builds
- Or run: `eas build:list --platform ios --limit 1`

### 4. Download the IPA

Once the build finishes, you'll get:

- **IPA URL** in the terminal output
- **Download link** in the build logs
- Or download from: https://expo.dev/accounts/manishsandil/projects/homehub/builds

---

## Current Build Status

**Latest Build:**
- Build ID: `c470bd8f-74ca-4a36-849a-c299da8edbc2`
- Status: ✅ Finished
- Version: `1.0.1`
- Build Number: `6`
- IPA URL: https://expo.dev/artifacts/eas/qfVxKXECkyh6RMsPLxR5ys.ipa
- Commit: `2023cbf` (includes receipt scanner update)

**If you've made changes since this build**, create a new one with the command above.

---

## After Building

### Option A: Automatic Submission

If you've set up your App Store Connect App ID in `eas.json`:

```bash
eas submit --platform ios --latest
```

### Option B: Manual Upload

1. Download the IPA file from the build URL
2. Go to App Store Connect → Your App
3. Upload via web interface or use Transporter app

---

## Troubleshooting

### "Build failed"
- Check the build logs: `eas build:view [BUILD_ID]`
- Common issues:
  - Missing environment variables
  - Code signing errors
  - Build configuration issues

### "No credentials found"
- Run: `eas credentials`
- Follow prompts to set up certificates

### "Build expired"
- Builds expire after 90 days
- Just create a new build: `eas build --platform ios --profile production`

---

## Quick Reference

```bash
# Create new build
eas build --platform ios --profile production

# Check build status
eas build:list --platform ios --limit 1

# View build logs
eas build:view [BUILD_ID]

# Submit to App Store (if configured)
eas submit --platform ios --latest

# Download IPA manually
# Visit: https://expo.dev/accounts/manishsandil/projects/homehub/builds
```

---

## What Gets Built

The build includes:
- ✅ All your code changes
- ✅ Version `1.0.1`, Build `6`
- ✅ Production optimizations
- ✅ App Store signing
- ✅ All dependencies bundled

**Note:** Make sure to commit any code changes before building, or the build will use the latest committed code.

