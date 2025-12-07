/**
 * Migrate Version Document
 *
 * Migrates a version document from an invalid ID to a proper semantic version.
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

async function migrateVersion(fromId, toId) {
  console.log(`🔄 Migrating version: ${fromId} → ${toId}\n`);
  console.log('='.repeat(70));

  // Get source document
  const sourceDoc = await db.collection('versions').doc(fromId).get();

  if (!sourceDoc.exists) {
    throw new Error(`Source version ${fromId} not found`);
  }

  // Check if target already exists
  const targetDoc = await db.collection('versions').doc(toId).get();
  if (targetDoc.exists) {
    throw new Error(`Target version ${toId} already exists`);
  }

  const sourceData = sourceDoc.data();

  console.log('\n📦 Source Version:\n');
  console.log(`   Document ID: ${fromId}`);
  console.log(`   Feedback count: ${sourceData.feedbackCount || 0}`);
  console.log(`   Changelog entries: ${sourceData.changelogEntries?.length || 0}`);

  // Update the version field in the data
  const newData = {
    ...sourceData,
    version: toId
  };

  console.log('\n✅ Creating new version document...');

  // Create new document with correct ID
  await db.collection('versions').doc(toId).set(newData);

  console.log(`   Created: ${toId}`);

  // Update all feedback items that reference the old version
  console.log('\n🔗 Updating feedback items...');

  const feedbackSnapshot = await db.collection('feedback')
    .where('fixedInVersion', '==', fromId)
    .get();

  if (!feedbackSnapshot.empty) {
    const batch = db.batch();

    feedbackSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { fixedInVersion: toId });
    });

    await batch.commit();
    console.log(`   Updated ${feedbackSnapshot.size} feedback item(s)`);
  } else {
    console.log('   No feedback items to update');
  }

  // Delete old document
  console.log('\n🗑️  Deleting old version document...');
  await db.collection('versions').doc(fromId).delete();
  console.log(`   Deleted: ${fromId}`);

  console.log('\n' + '='.repeat(70));
  console.log(`\n✅ Migration complete! ${fromId} → ${toId}\n`);
}

async function main() {
  const fromId = process.argv[2];
  const toId = process.argv[3];
  const confirm = process.argv.includes('--confirm');

  if (!fromId || !toId) {
    console.error('Usage: node scripts/migrate-version.js <from-id> <to-id> [--confirm]');
    console.error('');
    console.error('Example:');
    console.error('  node scripts/migrate-version.js sZL8FQah6o9XySmQ0Bwk 0.2.0 --confirm');
    process.exit(1);
  }

  if (!confirm) {
    console.log('🔍 Preview Mode\n');
    console.log(`Will migrate: ${fromId} → ${toId}`);
    console.log('');
    console.log('This will:');
    console.log('  1. Create a new version document with ID: ' + toId);
    console.log('  2. Update all feedback items to reference the new version');
    console.log('  3. Delete the old version document: ' + fromId);
    console.log('');
    console.log('Add --confirm to proceed.');
    process.exit(0);
  }

  await migrateVersion(fromId, toId);
}

main().catch(error => {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
});
