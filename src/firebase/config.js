import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
const firebaseConfig = {
    // Your web app's Firebase configuration
    // Replace with your actual Firebase config
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
// Initialize Firebase
let app;
let db;
let auth;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
}
else {
    app = getApp();
    db = getFirestore(app);
    auth = getAuth(app);
}
export { app, db, auth };
// For backward compatibility
const firebaseExports = { app, db, auth };
export default firebaseExports;
