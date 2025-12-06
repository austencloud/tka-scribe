/**
 * Fix Versions Script
 *
 * Lists all version documents in Firestore and offers to delete ones with
 * auto-generated IDs (not semantic version numbers).
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

/**
 * Check if a string is a valid semantic version
 */
function isValidVersion(str) {
  // Matches: 0.1.0, 1.2.3, 0.1.0-beta, etc.
  return /^v?\d+\.\d+\.\d+(-\w+)?$/.test(str);
}

/**
 * List all version documents
 */
async function listVersions() {
  const snapshot = await db.collection('versions').get();

  const versions = snapshot.docs.map(doc => ({
    id: doc.id,
    data: doc.data(),
    isValid: isValidVersion(doc.id)
  }));

  return versions;
}

/**
 * Delete a version document
 */
async function deleteVersion(docId) {
  await db.collection('versions').doc(docId).delete();
}

async function main() {
  console.log('📋 Checking versions collection...\n');

  const versions = await listVersions();

  if (versions.length === 0) {
    console.log('No version documents found.\n');
    process.exit(0);
  }

  console.log(`Found ${versions.length} version document(s):\n`);

  const validVersions = versions.filter(v => v.isValid);
  const invalidVersions = versions.filter(v => !v.isValid);

  if (validVersions.length > 0) {
    console.log('✅ Valid versions:');
    validVersions.forEach(v => {
      const date = v.data.releasedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date';
      const count = v.data.feedbackCount || v.data.changelogEntries?.length || 0;
      console.log(`   ${v.id} - ${count} items - ${date}`);
    });
    console.log('');
  }

  if (invalidVersions.length > 0) {
    console.log('❌ Invalid versions (auto-generated IDs):');
    invalidVersions.forEach(v => {
      const date = v.data.releasedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date';
      const count = v.data.feedbackCount || v.data.changelogEntries?.length || 0;
      const versionField = v.data.version || 'No version field';
      console.log(`   ${v.id}`);
      console.log(`      → version field: ${versionField}`);
      console.log(`      → ${count} items - ${date}`);
    });
    console.log('');

    // Show what we would delete
    console.log(`This will delete ${invalidVersions.length} invalid version document(s).`);
    console.log('Run with --confirm to proceed.');
    console.log('');

    // Check for --confirm flag
    if (process.argv.includes('--confirm')) {
      console.log('🗑️  Deleting invalid versions...\n');

      for (const v of invalidVersions) {
        console.log(`   Deleting ${v.id}...`);
        await deleteVersion(v.id);
      }

      console.log('\n✅ Cleanup complete!\n');
    }
  } else {
    console.log('✅ All version documents have valid IDs!\n');
  }

  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
