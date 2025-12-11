/**
 * Archive remaining completed items as part of v0.3.0
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf8'));
if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db = admin.firestore();

async function archiveItems() {
  // Get all completed items
  const snapshot = await db.collection('feedback')
    .where('status', '==', 'completed')
    .get();

  if (snapshot.empty) {
    console.log('No completed items to archive');
    return;
  }

  console.log(`Found ${snapshot.docs.length} items to archive\n`);

  // Archive each item
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      fixedInVersion: '0.3.0',
      status: 'archived',
      archivedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });
  await batch.commit();
  console.log(`Archived ${snapshot.docs.length} items\n`);

  // Now update the v0.3.0 version record with additional changelog entries
  const newEntries = [
    { category: 'added', text: 'Feedback cards show visual styling by type' },
    { category: 'added', text: 'Voice recording stops after silence timeout' },
    { category: 'fixed', text: 'Alphabetical sorting works correctly in gallery' },
    { category: 'added', text: 'Clear cache option in profile settings' },
    { category: 'improved', text: 'Renamed "reverse" to "mirror" for clarity' },
    { category: 'added', text: 'Earn XP and achievements for feedback' },
    { category: 'added', text: 'Record and attach videos to sequences' },
    { category: 'added', text: 'Edit your submitted feedback' },
    { category: 'fixed', text: 'Word labels copy correctly to clipboard' }
  ];

  // Get existing changelog entries
  const versionDoc = await db.collection('versions').doc('0.3.0').get();
  const existingEntries = versionDoc.data()?.changelogEntries || [];

  // Merge entries
  const mergedEntries = [...existingEntries, ...newEntries];

  // Update version document
  await db.collection('versions').doc('0.3.0').update({
    changelogEntries: mergedEntries,
    feedbackCount: admin.firestore.FieldValue.increment(snapshot.docs.length)
  });

  console.log(`Added ${newEntries.length} new changelog entries`);
  console.log(`Total changelog entries: ${mergedEntries.length}`);
}

archiveItems()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
