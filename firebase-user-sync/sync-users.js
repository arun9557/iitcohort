const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

async function syncAllUsersToFirestore() {
  let nextPageToken;
  let totalSynced = 0;
  do {
    const result = await auth.listUsers(1000, nextPageToken);
    for (const userRecord of result.users) {
      await db.collection('users').doc(userRecord.uid).set({
        email: userRecord.email,
        createdAt: userRecord.metadata.creationTime
      }, { merge: true });
      console.log('Synced:', userRecord.email);
      totalSynced++;
    }
    nextPageToken = result.pageToken;
  } while (nextPageToken);
  console.log('All users synced! Total:', totalSynced);

  // Firestore se users ka count print karo (automatic)
  const snapshot = await db.collection('users').get();
  console.log('Firestore users collection count:', snapshot.size);
}

syncAllUsersToFirestore().catch(err => {
  console.error('Sync failed:', err);
});