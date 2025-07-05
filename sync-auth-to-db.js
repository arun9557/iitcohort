const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getDatabase } = require('firebase-admin/database');
const serviceAccount = require('./serviceAccountKey.json'); // Make sure this file is in the same folder

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://iitcohort-75b1d-default-rtdb.firebaseio.com"
});

const db = getDatabase();

async function syncAllUsers() {
  try {
    console.log('🔄 Starting user sync from Firebase Auth to Realtime Database...');
    
    let nextPageToken;
    let totalUsers = 0;
    
    do {
      const listUsersResult = await getAuth().listUsers(1000, nextPageToken);
      
      for (const userRecord of listUsersResult.users) {
        const user = userRecord.toJSON();
        
        // Prepare user data with more information
        const userData = {
          name: user.displayName || user.email || 'Unknown User',
          email: user.email || '',
          status: 'offline', // Default to offline, will be updated when they sign in
          role: 'member', // Default role, can be customized
          lastSignInTime: user.metadata?.lastSignInTime || null,
          creationTime: user.metadata?.creationTime || null,
          photoURL: user.photoURL || null,
          uid: user.uid
        };
        
        await db.ref('users/' + user.uid).set(userData);
        console.log(`✅ Synced: ${user.email || user.uid}`);
        totalUsers++;
      }
      
      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);
    
    console.log(`🎉 Sync completed! Total users synced: ${totalUsers}`);
    
    // Also create a summary in the database
    await db.ref('system/syncInfo').set({
      lastSyncTime: new Date().toISOString(),
      totalUsers: totalUsers,
      syncStatus: 'completed'
    });
    
  } catch (error) {
    console.error('❌ Error during sync:', error);
    
    // Log error to database
    await db.ref('system/syncErrors').push({
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    });
  }
}

// Function to get sync status
async function getSyncStatus() {
  try {
    const snapshot = await db.ref('system/syncInfo').once('value');
    const data = snapshot.val();
    if (data) {
      console.log('📊 Last sync info:', data);
    } else {
      console.log('📊 No sync info found');
    }
  } catch (error) {
    console.error('❌ Error getting sync status:', error);
  }
}

// Run the sync
syncAllUsers().then(() => {
  console.log('🏁 Sync process finished');
  return getSyncStatus();
}).catch(error => {
  console.error('💥 Sync failed:', error);
}); 