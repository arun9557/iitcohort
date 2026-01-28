import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase, ref, set, update } from 'firebase/database';
// Firebase configuration using environment variables with fallback
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAKLqd9z98nRFTbM5YtPHisPrpc1Bwcx8c",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "iitcohort-75b1d.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "iitcohort-75b1d",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "iitcohort-75b1d.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "319591295433",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:319591295433:web:b99386c388f2432e85e018",
    measurementId: "G-YWKC0WB5BP",
    databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://iitcohort-75b1d-default-rtdb.firebaseio.com"
};
// Initialize Firebase - ensure we always have an app instance
let app;
if (getApps().length === 0) {
    try {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully');
    }
    catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        // Create a minimal app with default config to prevent crashes
        app = initializeApp({
            apiKey: "dummy-key",
            authDomain: "dummy.firebaseapp.com",
            projectId: "dummy",
            storageBucket: "dummy.appspot.com",
            messagingSenderId: "123456789",
            appId: "1:123456789:web:dummy"
        });
    }
}
else {
    app = getApps()[0];
}
// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
// Initialize Realtime Database with error handling
let realtimeDb = null;
try {
    realtimeDb = getDatabase(app);
}
catch (error) {
    console.warn('Realtime Database not available:', error);
}
// Helper to sync user to Realtime Database
export function syncUserToDatabase(user) {
    console.log('syncUserToDatabase called for:', user?.email);
    if (!realtimeDb || !user)
        return;
    set(ref(realtimeDb, 'users/' + user.uid), {
        name: user.displayName || user.email,
        status: 'online',
        role: 'member', // You can customize this logic
    });
}
// Helper to set user offline in Realtime Database
export function setUserOffline(user) {
    if (!realtimeDb || !user)
        return;
    update(ref(realtimeDb, 'users/' + user.uid), {
        status: 'offline',
    });
}
export { realtimeDb };
export default app;
