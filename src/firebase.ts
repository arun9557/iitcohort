import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Temporary hardcoded config to bypass env variable issues
const firebaseConfig = {
  apiKey: "AIzaSyAKLqd9z98nRFTbM5YtPHisPrpc1Bwcx8c",
  authDomain: "iitcohort-75b1d.firebaseapp.com",
  projectId: "iitcohort-75b1d",
  storageBucket: "iitcohort-75b1d.appspot.com",
  messagingSenderId: "319591295433",
  appId: "1:319591295433:web:b99386c388f2432e85e018",
  measurementId: "G-YWKC0WB5BP",
  databaseURL: "https://iitcohort-75b1d-default-rtdb.firebaseio.com"
};

// Initialize Firebase - ensure we always have an app instance
let app;
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
  } catch (error) {
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
} else {
  app = getApps()[0];
}

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Realtime Database with error handling
let realtimeDb: ReturnType<typeof getDatabase> | null = null;
try {
  realtimeDb = getDatabase(app);
} catch (error) {
  console.warn('Realtime Database not available:', error);
}

export { realtimeDb };
export default app;
