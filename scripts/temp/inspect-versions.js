/**
 * Inspect Version Documents
 *
 * Shows detailed information about version documents and their associated feedback.
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

async function main() {
  const versionId = process.argv[2];

  if (!versionId) {
    console.error('Usage: node scripts/inspect-versions.js <version-id>');
    process.exit(1);
  }

  console.log(`📋 Inspecting version: ${versionId}\n`);
  console.log('='.repeat(70));

  // Get version document
  const versionDoc = await db.collection('versions').doc(versionId).get();

  if (!versionDoc.exists) {
    console.error(`❌ Version ${versionId} not found.`);
    process.exit(1);
  }

  const versionData = versionDoc.data();

  console.log('\n📦 Version Document:\n');
  console.log(`   Document ID: ${versionDoc.id}`);
  console.log(`   Version field: ${versionData.version || 'N/A'}`);
  console.log(`   Released: ${versionData.releasedAt?.toDate?.()?.toLocaleString() || 'Unknown'}`);
  console.log(`   Feedback count: ${versionData.feedbackCount || 0}`);

  if (versionData.feedbackSummary) {
    console.log(`   Summary:`);
    console.log(`      - Bugs: ${versionData.feedbackSummary.bugs || 0}`);
    console.log(`      - Features: ${versionData.feedbackSummary.features || 0}`);
    console.log(`      - General: ${versionData.feedbackSummary.general || 0}`);
  }

  if (versionData.changelogEntries && versionData.changelogEntries.length > 0) {
    console.log(`\n📝 Changelog Entries (${versionData.changelogEntries.length}):\n`);
    versionData.changelogEntries.forEach((entry, i) => {
      console.log(`   ${i + 1}. [${entry.category}] ${entry.text}`);
      if (entry.feedbackId) {
        console.log(`      └─ Feedback: ${entry.feedbackId}`);
      }
    });
  }

  // Query feedback items fixed in this version
  const feedbackSnapshot = await db.collection('feedback')
    .where('fixedInVersion', '==', versionId)
    .get();

  if (!feedbackSnapshot.empty) {
    console.log(`\n🔗 Associated Feedback Items (${feedbackSnapshot.size}):\n`);

    feedbackSnapshot.docs.forEach((doc, i) => {
      const data = doc.data();
      console.log(`   ${i + 1}. ${data.title || data.description?.substring(0, 60) || 'Untitled'}`);
      console.log(`      └─ ID: ${doc.id}`);
      console.log(`      └─ Type: ${data.type}`);
      console.log(`      └─ Status: ${data.status}`);
    });
  } else {
    console.log('\n⚠️  No feedback items reference this version.\n');
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
