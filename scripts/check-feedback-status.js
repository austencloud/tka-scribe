const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkFeedback() {
  console.log('Checking feedback database...\n');

  // Check in-review
  const inReview = await db.collection('feedback')
    .where('status', '==', 'in-review')
    .get();

  console.log(`In-review items: ${inReview.size}`);
  inReview.docs.forEach(doc => {
    const data = doc.data();
    const id = doc.id.slice(0, 8);
    console.log(`  - ${id}: ${data.title || 'No title'}`);
  });

  // Check completed
  const completed = await db.collection('feedback')
    .where('status', '==', 'completed')
    .get();

  console.log(`\nCompleted items: ${completed.size}`);
  completed.docs.forEach(doc => {
    const data = doc.data();
    const id = doc.id.slice(0, 8);
    console.log(`  - ${id}: ${data.title || 'No title'}`);
  });

  // Check archived
  const archived = await db.collection('feedback')
    .where('status', '==', 'archived')
    .get();

  console.log(`\nArchived items: ${archived.size}`);
  archived.docs.forEach(doc => {
    const data = doc.data();
    const id = doc.id.slice(0, 8);
    console.log(`  - ${id}: ${data.title || 'No title'} (version: ${data.fixedInVersion || 'none'})`);
  });

  // Check all statuses
  const all = await db.collection('feedback').get();
  console.log(`\nTotal feedback items: ${all.size}`);

  const statusCounts = {};
  all.docs.forEach(doc => {
    const status = doc.data().status || 'no-status';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  console.log('\nStatus breakdown:');
  Object.entries(statusCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  process.exit(0);
}

checkFeedback().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
