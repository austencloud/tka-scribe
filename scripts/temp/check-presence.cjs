const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, remove } = require('firebase/database');

const firebaseConfig = {
  apiKey: 'AIzaSyAPJyM6VKgVHqL61cqzC_F1YFzqJMzV0bg',
  authDomain: 'the-kinetic-alphabet.firebaseapp.com',
  databaseURL: 'https://the-kinetic-alphabet-default-rtdb.firebaseio.com',
  projectId: 'the-kinetic-alphabet',
  storageBucket: 'the-kinetic-alphabet.firebasestorage.app',
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

async function listPresence() {
  const presenceRef = ref(database, 'presence');
  const snapshot = await get(presenceRef);
  const data = snapshot.val();

  if (!data) {
    console.log('No presence data found');
    return;
  }

  console.log('Users in presence:');
  for (const [userId, presence] of Object.entries(data)) {
    console.log(`  ${userId}: ${presence.email || presence.displayName || 'unknown'}`);
  }

  // Find Flow Taco
  const flowTaco = Object.entries(data).find(([_, p]) =>
    p.email === 'flowtacocat@gmail.com' || p.displayName === 'Flow Taco'
  );

  if (flowTaco) {
    console.log('\nFound Flow Taco:', flowTaco[0]);
  }
}

listPresence().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
