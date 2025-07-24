# Firebase Authentication User Sync

## Overview
This system syncs all users who have signed in through Firebase Authentication to the Realtime Database, making them visible in the "All Members" section of the application.

## How it works

### 1. User Authentication Flow
- Users sign in through Firebase Authentication
- When a user signs in, their data is automatically synced to the Realtime Database
- The `MemberList` component reads from the Realtime Database to display all members

### 2. Manual Sync Process
To sync ALL users who have ever signed in (including those who haven't signed in recently):

```bash
npm run sync-users
```

This command runs the `sync-auth-to-db.js` script which:
- Fetches all users from Firebase Authentication
- Syncs them to the Realtime Database with status 'offline'
- Includes additional user information (email, last sign in time, etc.)

### 3. What gets synced
For each authenticated user, the following data is stored in the Realtime Database:

```json
{
  "name": "User's display name or email",
  "email": "user@example.com",
  "status": "offline",
  "role": "member",
  "lastSignInTime": "2024-01-01T00:00:00.000Z",
  "creationTime": "2024-01-01T00:00:00.000Z",
  "photoURL": "https://example.com/photo.jpg",
  "uid": "user-uid"
}
```

### 4. Display in All Members
The `MemberList` component shows:
- **Online users**: Currently active users (status: 'online')
- **Offline users**: All other authenticated users (status: 'offline')
- **Admin users**: Users with role 'admin' (shown with crown icon 👑)
- **Regular members**: Users with role 'member' (shown with person icon 👤)

## Setup Requirements

### 1. Firebase Admin SDK
Make sure you have the `serviceAccountKey.json` file in your project root. This file contains your Firebase Admin SDK credentials.

### 2. Firebase Configuration
Ensure your Firebase project has:
- Authentication enabled
- Realtime Database enabled
- Proper security rules

### 3. Running the Sync
```bash
# Install dependencies (if not already done)
npm install

# Run the sync script
npm run sync-users
```

## Security Rules
Make sure your Realtime Database has appropriate security rules:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "system": {
      ".read": "auth != null",
      ".write": false
    }
  }
}
```

## Troubleshooting

### Sync not working?
1. Check if `serviceAccountKey.json` exists and is valid
2. Verify Firebase Admin SDK permissions
3. Check console logs for error messages

### Users not showing up?
1. Run the sync script: `npm run sync-users`
2. Check if users exist in Firebase Authentication
3. Verify Realtime Database connection

### Real-time updates not working?
1. Ensure Realtime Database is properly configured
2. Check Firebase configuration in `src/firebase.ts`
3. Verify network connectivity

## Notes
- The sync script should be run periodically to keep the member list updated
- Users who sign in after the sync will be automatically added to the database
- The system shows both online and offline users for a complete member list 