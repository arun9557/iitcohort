const { initializeApp } = require('firebase/app');
const { getAuth, signInAnonymously } = require('firebase/auth');
const { getDatabase, ref, set, get } = require('firebase/database');

// Use the same Firebase config as your app
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

async function syncUsersToDatabase() {
  try {
    console.log('🔄 Starting simple user sync...');
    
    // Sign in anonymously to access the database
    await signInAnonymously(auth);
    console.log('✅ Signed in anonymously');
    
    // Get existing users from the database
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    const existingUsers = snapshot.val() || {};
    
    console.log(`📊 Found ${Object.keys(existingUsers).length} existing users in database`);
    
    // Create some demo users if none exist
    if (Object.keys(existingUsers).length === 0) {
      console.log('📝 Creating demo users...');
      
      const demoUsers = {
        'demo-admin-1': {
          name: 'Admin User',
          email: 'admin@iitj.ac.in',
          status: 'online',
          role: 'admin',
          lastSignInTime: new Date().toISOString()
        },
        'demo-user-1': {
          name: 'John Doe',
          email: 'john@iitj.ac.in',
          status: 'online',
          role: 'member',
          lastSignInTime: new Date().toISOString()
        },
        'demo-user-2': {
          name: 'Jane Smith',
          email: 'jane@iitj.ac.in',
          status: 'offline',
          role: 'member',
          lastSignInTime: new Date().toISOString()
        },
        'demo-user-3': {
          name: 'Bob Wilson',
          email: 'bob@iitj.ac.in',
          status: 'online',
          role: 'member',
          lastSignInTime: new Date().toISOString()
        },
        'demo-user-4': {
          name: 'Alice Johnson',
          email: 'alice@iitj.ac.in',
          status: 'offline',
          role: 'member',
          lastSignInTime: new Date().toISOString()
        },
        'demo-user-5': {
          name: 'Charlie Brown',
          email: 'charlie@iitj.ac.in',
          status: 'online',
          role: 'member',
          lastSignInTime: new Date().toISOString()
        },
        'demo-user-6': {
          name: 'Diana Prince',
          email: 'diana@iitj.ac.in',
          status: 'online',
          role: 'admin',
          lastSignInTime: new Date().toISOString()
        },
        'demo-user-7': {
          name: 'Eve Adams',
          email: 'eve@iitj.ac.in',
          status: 'offline',
          role: 'member',
          lastSignInTime: new Date().toISOString()
        }
      };
      
      // Add demo users to database
      for (const [uid, userData] of Object.entries(demoUsers)) {
        await set(ref(db, `users/${uid}`), userData);
        console.log(`✅ Added demo user: ${userData.name} (${userData.email})`);
      }
      
      console.log('🎉 Demo users created successfully!');
    } else {
      console.log('📋 Users already exist in database');
      
      // List existing users
      for (const [uid, userData] of Object.entries(existingUsers)) {
        console.log(`👤 ${userData.name} (${userData.email}) - ${userData.status}`);
      }
    }
    
    // Update sync info
    await set(ref(db, 'system/syncInfo'), {
      lastSyncTime: new Date().toISOString(),
      totalUsers: Object.keys(existingUsers).length,
      syncStatus: 'completed',
      syncMethod: 'simple'
    });
    
    console.log('✅ Sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during sync:', error);
    
    // Log error to database
    try {
      await set(ref(db, 'system/syncErrors'), {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack
      });
    } catch (logError) {
      console.error('❌ Failed to log error:', logError);
    }
  }
}

// Run the sync
syncUsersToDatabase().then(() => {
  console.log('🏁 Sync process finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Sync failed:', error);
  process.exit(1);
}); 