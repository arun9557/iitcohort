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
  let nextPageToken;
  do {
    const listUsersResult = await getAuth().listUsers(1000, nextPageToken);
    for (const userRecord of listUsersResult.users) {
      const user = userRecord.toJSON();
      await db.ref('users/' + user.uid).set({
        name: user.displayName || user.email,
        status: 'offline',
        role: 'member'
      });
      console.log('Synced:', user.email);
    }
    nextPageToken = listUsersResult.pageToken;
  } while (nextPageToken);
  console.log('All users synced!');
}

syncAllUsers(); 