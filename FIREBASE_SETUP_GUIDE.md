# Firebase Admin SDK Setup Guide

## 🔑 Getting Your Service Account Key

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `iitcohort-75b1d`

### Step 2: Navigate to Service Accounts
1. Click the **gear icon** (⚙️) in the top left corner
2. Select **"Project settings"**
3. Go to the **"Service accounts"** tab

### Step 3: Generate Private Key
1. Click **"Generate new private key"** button
2. Click **"Generate key"** in the popup
3. **Download the JSON file**

### Step 4: Place in Project
1. **Rename the downloaded file** to `serviceAccountKey.json`
2. **Move it to your project root** (same folder as `package.json`)

## 📁 File Structure
Your project should look like this:
```
iitjodhpur/
├── package.json
├── sync-auth-to-db.js
├── serviceAccountKey.json  ← Add this file here
├── src/
└── ...
```

## 🚀 Test the Setup
After placing the file, run:
```bash
npm run sync-users
```

You should see output like:
```
🔄 Starting user sync from Firebase Auth to Realtime Database...
✅ Synced: user1@example.com
✅ Synced: user2@example.com
🎉 Sync completed! Total users synced: 5
```

## 🔒 Security Important
- ✅ The `serviceAccountKey.json` is already added to `.gitignore`
- ✅ Never commit this file to version control
- ✅ Keep this file secure and private

## ❓ Troubleshooting

### "Cannot find module './serviceAccountKey.json'"
- Make sure the file is named exactly `serviceAccountKey.json`
- Make sure it's in the project root (same folder as `package.json`)

### "Permission denied" or "Authentication failed"
- Check that your Firebase project has the correct permissions
- Verify the service account has the necessary roles

### "No users found"
- Check if you have users in Firebase Authentication
- Verify the service account has access to read user data

## 📞 Need Help?
If you're still having issues:
1. Check the Firebase Console for any error messages
2. Verify your project ID matches: `iitcohort-75b1d`
3. Make sure Authentication is enabled in your Firebase project 