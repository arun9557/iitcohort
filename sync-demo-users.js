const { initializeApp } = require('firebase/app');
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
const db = getDatabase(app);

async function addDemoUsers() {
  try {
    console.log('🔄 Adding demo users to database...');
    
    // Get existing users from the database
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    const existingUsers = snapshot.val() || {};
    
    console.log(`📊 Found ${Object.keys(existingUsers).length} existing users in database`);
    
    // Create demo users
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
      },
      'demo-user-8': {
        name: 'Frank Miller',
        email: 'frank@iitj.ac.in',
        status: 'online',
        role: 'member',
        lastSignInTime: new Date().toISOString()
      },
      'demo-user-9': {
        name: 'Grace Lee',
        email: 'grace@iitj.ac.in',
        status: 'offline',
        role: 'member',
        lastSignInTime: new Date().toISOString()
      },
      'demo-user-10': {
        name: 'Henry Davis',
        email: 'henry@iitj.ac.in',
        status: 'online',
        role: 'member',
        lastSignInTime: new Date().toISOString()
      }
    };
    
    // Add demo users to database
    let addedCount = 0;
    for (const [uid, userData] of Object.entries(demoUsers)) {
      // Only add if user doesn't already exist
      if (!existingUsers[uid]) {
        await set(ref(db, `users/${uid}`), userData);
        console.log(`✅ Added demo user: ${userData.name} (${userData.email})`);
        addedCount++;
      } else {
        console.log(`⏭️  User already exists: ${userData.name}`);
      }
    }
    
    if (addedCount > 0) {
      console.log(`🎉 Successfully added ${addedCount} demo users!`);
    } else {
      console.log('📋 All demo users already exist in database');
    }
    
    // Update sync info
    await set(ref(db, 'system/syncInfo'), {
      lastSyncTime: new Date().toISOString(),
      totalUsers: Object.keys(existingUsers).length + addedCount,
      syncStatus: 'completed',
      syncMethod: 'demo-users'
    });
    
    console.log('✅ Demo users setup completed!');
    console.log('🌐 Check your "All Members" section to see the users');
    
  } catch (error) {
    console.error('❌ Error adding demo users:', error);
    
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

// Run the function
addDemoUsers().then(() => {
  console.log('🏁 Demo users process finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Demo users failed:', error);
  process.exit(1);
}); 