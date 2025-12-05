/**
 * Archive completed feedback and create version record
 */
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync('./serviceAccountKey.json', 'utf8')
);

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function archiveFeedback() {
  const version = process.argv[2];

  if (!version) {
    console.error('Usage: node scripts/archive-feedback.js <version>');
    process.exit(1);
  }

  console.log(`📦 Archiving completed feedback for v${version}...\n`);

  // Get completed feedback
  const snapshot = await db.collection('feedback')
    .where('status', '==', 'completed')
    .get();

  if (snapshot.empty) {
    console.log('No completed feedback to archive.');
    process.exit(0);
  }

  const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  console.log(`Found ${items.length} completed items to archive:\n`);

  // Display items
  items.forEach(item => {
    const typeEmoji = item.type === 'bug' ? '🐛' : item.type === 'feature' ? '✨' : '🔧';
    console.log(`  ${typeEmoji} ${item.title || item.description?.substring(0, 50) || 'Untitled'}`);
  });

  // Calculate summary
  const summary = { bugs: 0, features: 0, general: 0 };
  items.forEach(item => {
    if (item.type === 'bug') summary.bugs++;
    else if (item.type === 'feature') summary.features++;
    else summary.general++;
  });

  // Create changelog entries
  const changelogEntries = items.map(item => {
    let category;
    switch (item.type) {
      case 'bug':
        category = 'fixed';
        break;
      case 'feature':
        category = 'added';
        break;
      default:
        category = 'improved';
    }

    let text = item.title || item.description?.substring(0, 100) || 'Untitled change';
    const lowerText = text.toLowerCase();

    if (category === 'fixed' && !lowerText.startsWith('fixed')) {
      text = 'Fixed ' + text.charAt(0).toLowerCase() + text.slice(1);
    } else if (category === 'added' && !lowerText.startsWith('added') && !lowerText.startsWith('new')) {
      text = 'Added ' + text.charAt(0).toLowerCase() + text.slice(1);
    }

    return { category, text, feedbackId: item.id };
  });

  // Execute batch update
  const batch = db.batch();

  // Archive feedback items
  items.forEach(item => {
    const ref = db.collection('feedback').doc(item.id);
    batch.update(ref, {
      fixedInVersion: version,
      status: 'archived',
      archivedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  // Create version document
  const versionRef = db.collection('versions').doc(version);
  batch.set(versionRef, {
    version,
    feedbackCount: items.length,
    feedbackSummary: summary,
    changelogEntries,
    releasedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  await batch.commit();

  console.log(`\n✓ Archived ${items.length} feedback items`);
  console.log(`✓ Created version record for v${version}`);
  console.log(`  (${summary.bugs} bugs, ${summary.features} features, ${summary.general} general)`);
}

archiveFeedback().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
