/**
 * Update v0.2.0 changelog in Firestore with user-facing details
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

const changelog = {
  added: [
    'Added auto-save feedback drafts',
    '🎯 Quick BPM Selection - Tap preset speed buttons (15, 30, 60, 90, 120, 150 BPM) for instant tempo changes',
    'Tap the BPM display repeatedly to set speed by feel (tap tempo)',
    'Fine-tune with +/- buttons',
    '📸 Screenshot Support - Attach screenshots when submitting feedback to show exactly what you\'re seeing'
  ],
  improved: [
    'My Feedback status sorting',
    '💪 Easier Mobile Experience - Buttons are now bigger and easier to tap on phones and tablets',
    '🏃 Practice Mode Redesigned - Cleaner, more organized practice interface with better visual feedback',
    '🎬 Better Sharing - Improved sharing experience for animations and images with cleaner share dialogs'
  ],
  fixed: []
};

async function updateChangelog() {
  try {
    await db.collection('versions').doc('v0.2.0').set({
      version: 'v0.2.0',
      releaseDate: new Date('2025-12-06'),
      changelog: changelog
    });
    console.log('✅ Created v0.2.0 version record in Firestore');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

updateChangelog();
