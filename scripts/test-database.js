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

console.log('🔧 Testing Firebase Realtime Database connection...');
console.log('📊 Database URL:', firebaseConfig.databaseURL);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function testDatabase() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Try to write a test value
    const testRef = ref(db, 'test/connection');
    await set(testRef, {
      timestamp: new Date().toISOString(),
      message: 'Database connection test'
    });
    console.log('✅ Successfully wrote to database');
    
    // Try to read the test value
    const snapshot = await get(testRef);
    const data = snapshot.val();
    console.log('✅ Successfully read from database:', data);
    
    // Clean up test data
    await set(testRef, null);
    console.log('✅ Successfully cleaned up test data');
    
    console.log('🎉 Database connection test passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'PERMISSION_DENIED') {
      console.log('💡 This might be a security rules issue');
      console.log('💡 Check your Firebase Realtime Database security rules');
    }
    
    return false;
  }
}

// Run the test
testDatabase().then((success) => {
  if (success) {
    console.log('🚀 Database is working! You can now add demo users');
  } else {
    console.log('⚠️  Database connection failed. Check your Firebase configuration');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
}); 