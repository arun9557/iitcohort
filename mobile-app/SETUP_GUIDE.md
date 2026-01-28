# 📱 IITCohort Mobile App - Setup Guide

This guide will help you set up the IITCohort mobile app that perfectly syncs with your existing web platform.

## 🎯 **What You'll Get**

✅ **Real-time Chat Sync** - Messages sent on mobile appear instantly on web  
✅ **Voice Chat Integration** - Join voice rooms from mobile  
✅ **Push Notifications** - Get notified of new messages and activities  
✅ **Cross-platform User Status** - See who's online across all devices  
✅ **Project Management** - Sync all project updates  
✅ **File Sharing** - Access shared files on mobile  

## 🛠 **Prerequisites**

### **Required Software**
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **React Native CLI**: `npm install -g react-native-cli`
- **Android Studio** (for Android development)
- **Xcode** (for iOS development - macOS only)
- **Firebase Project** (same as your web app)

### **Development Environment**
- **Android**: Android Studio with SDK 33+
- **iOS**: Xcode 14+ with iOS 13+ simulator
- **Code Editor**: VS Code (recommended)

## 🚀 **Step-by-Step Setup**

### **Step 1: Clone and Install Dependencies**

```bash
# Navigate to your project directory
cd mobile-app

# Install dependencies
npm install

# For iOS, install CocoaPods dependencies
cd ios && pod install && cd ..
```

### **Step 2: Firebase Configuration**

#### **2.1 Get Firebase Config Files**

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your existing IITCohort project
3. Go to **Project Settings** → **General**
4. Scroll down to **Your apps** section

#### **2.2 Android Configuration**

1. Click **Add app** → **Android**
2. Package name: `com.iitcohort.mobile`
3. Download `google-services.json`
4. Place it in `android/app/google-services.json`

#### **2.3 iOS Configuration**

1. Click **Add app** → **iOS**
2. Bundle ID: `com.iitcohort.mobile`
3. Download `GoogleService-Info.plist`
4. Place it in `ios/IITCohort/GoogleService-Info.plist`

#### **2.4 Enable Firebase Services**

In Firebase Console, enable these services:
- ✅ **Authentication** (Email/Password)
- ✅ **Firestore Database**
- ✅ **Cloud Messaging** (FCM)
- ✅ **Storage** (for file uploads)
- ✅ **Analytics**

### **Step 3: Environment Configuration**

Create `.env` file in the mobile-app root:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# App Configuration
APP_NAME=IITCohort
APP_VERSION=1.0.0
```

### **Step 4: Update Firebase Config**

Update `src/firebase/config.ts` with your Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,z
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};
```

### **Step 5: Platform-Specific Setup**

#### **Android Setup**

1. **Update `android/app/build.gradle`:**
```gradle
android {
    compileSdkVersion 33
    defaultConfig {
        applicationId "com.iitcohort.mobile"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0"
    }
}
```

2. **Update `android/build.gradle`:**
```gradle
dependencies {
    classpath 'com.google.gms:google-services:4.3.15'
}
```

3. **Add to `android/app/build.gradle`:**
```gradle
apply plugin: 'com.google.gms.google-services'
```

#### **iOS Setup**

1. **Update `ios/IITCohort/Info.plist`:**
```xml
<key>CFBundleIdentifier</key>
<string>com.iitcohort.mobile</string>
```

2. **Add permissions to `ios/IITCohort/Info.plist`:**
```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for voice chat</string>
<key>NSCameraUsageDescription</key>
<string>This app needs camera access for file uploads</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access for file sharing</string>
```

### **Step 6: Run the App**

#### **Android**
```bash
# Start Metro bundler
npm start

# In another terminal, run Android
npm run android
```

#### **iOS**
```bash
# Start Metro bundler
npm start

# In another terminal, run iOS
npm run ios
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Metro bundler issues**
```bash
# Clear Metro cache
npx react-native start --reset-cache
```

#### **2. Android build issues**
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm run android
```

#### **3. iOS build issues**
```bash
# Clean and rebuild
cd ios
xcodebuild clean
cd ..
npm run ios
```

#### **4. Firebase connection issues**
- Verify `google-services.json` and `GoogleService-Info.plist` are in correct locations
- Check Firebase project settings
- Ensure all required services are enabled

#### **5. Push notifications not working**
- Verify FCM is enabled in Firebase Console
- Check device permissions
- Test with Firebase Console messaging

### **Debug Mode**

Enable debug logging by adding to your app:

```typescript
// In App.tsx
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore specific warnings
```

## 📱 **Testing the Sync**

### **1. Chat Synchronization**
1. Open web app in browser
2. Open mobile app
3. Send message from mobile → Should appear on web instantly
4. Send message from web → Should appear on mobile instantly

### **2. Voice Chat**
1. Join voice room from mobile
2. Join same room from web
3. Test audio communication

### **3. Push Notifications**
1. Send message from web to mobile user
2. Mobile should receive push notification
3. Tap notification → Should open chat

### **4. User Status**
1. Login on mobile → Should show as online on web
2. Login on web → Should show as online on mobile
3. Logout from one → Should show as offline on other

## 🚀 **Deployment**

### **Android (Google Play Store)**

1. **Generate signed APK:**
```bash
cd android
./gradlew assembleRelease
```

2. **Generate AAB (recommended):**
```bash
cd android
./gradlew bundleRelease
```

3. **Upload to Google Play Console**

### **iOS (App Store)**

1. **Open Xcode:**
```bash
open ios/IITCohort.xcworkspace
```

2. **Archive and upload:**
- Product → Archive
- Distribute App → App Store Connect

## 🔐 **Security Considerations**

### **1. API Keys**
- Never commit `.env` files to version control
- Use environment variables in production
- Rotate API keys regularly

### **2. Firebase Rules**
Update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Chat messages
    match /rooms/{roomId}/messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 📊 **Monitoring & Analytics**

### **Firebase Analytics**
- User engagement tracking
- Feature usage analytics
- Crash reporting

### **Performance Monitoring**
- App startup time
- Network request performance
- Memory usage

## 🆘 **Support**

### **Getting Help**
1. Check this setup guide first
2. Review Firebase documentation
3. Check React Native documentation
4. Open an issue on GitHub

### **Useful Resources**
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [React Navigation](https://reactnavigation.org/)
- [React Native Paper](https://reactnativepaper.com/)

---

## 🎉 **You're All Set!**

Your IITCohort mobile app is now ready with:
- ✅ Real-time chat synchronization
- ✅ Voice chat integration  
- ✅ Push notifications
- ✅ Cross-platform user status
- ✅ Project management sync
- ✅ File sharing capabilities

**Happy coding! 🚀**
