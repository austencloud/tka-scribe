/**
 * Update v0.1.0 changelog - Initial release
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

// Developer preview beta release message
const changelogEntries = [
  { category: 'added', text: '🎉 Developer Preview Beta - Create, animate, and share your flow choreography' }
];

async function updateChangelog() {
  try {
    await db.collection('versions').doc('0.1.0').set({
      version: '0.1.0',
      releasedAt: new Date('2025-12-05'),
      feedbackCount: changelogEntries.length,
      feedbackSummary: { bugs: 0, features: 1, general: 0 },
      changelogEntries: changelogEntries
    });
    console.log('✅ Updated 0.1.0 with initial release note');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

updateChangelog();
