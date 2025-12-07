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

// User-focused changelog combining v0.1.1 and v0.2.0 changes
const changelogEntries = [
  // New Features
  { category: 'added', text: '🎯 Quick BPM Selection - Tap preset speed buttons (15, 30, 60, 90, 120, 150 BPM) for instant tempo changes' },
  { category: 'added', text: '⏱️ Tap Tempo - Tap the BPM display repeatedly to set speed by feel' },
  { category: 'added', text: '📸 Screenshot Support - Attach screenshots when submitting feedback' },
  { category: 'added', text: '🎬 GIF Export Panel - New dedicated panel for exporting your animations as GIFs' },
  { category: 'added', text: '⏯️ Play/Pause Button - Quick play/pause control for animations' },
  { category: 'added', text: '📏 Grid Scale Adjuster - Customize grid size in practice mode for better visibility' },
  { category: 'added', text: '💾 Auto-Save Drafts - Feedback drafts save automatically as you type' },

  // Improvements
  { category: 'improved', text: '💪 Bigger Touch Targets - All buttons are now easier to tap on phones and tablets' },
  { category: 'improved', text: '🏃 Practice Mode Redesign - Cleaner layout with better organized controls and feedback' },
  { category: 'improved', text: '🎬 Better Sharing - Streamlined sharing experience with cleaner dialogs' },
  { category: 'improved', text: '⚡ Faster Loading - Smoother load times throughout the app' },
  { category: 'improved', text: '🎨 Animation Rendering - Better quality and performance for pictograph animations' },
  { category: 'improved', text: '📝 Feedback Tracking - Easier to see status of your submitted feedback' }
];

async function updateChangelog() {
  try {
    // Update 0.2.0 with combined changelog from v0.1.1 and v0.2.0
    await db.collection('versions').doc('0.2.0').set({
      version: '0.2.0',
      releasedAt: new Date('2025-12-06'),
      feedbackCount: changelogEntries.length,
      feedbackSummary: { bugs: 0, features: 7, general: 6 },
      changelogEntries: changelogEntries
    });
    console.log('✅ Updated 0.2.0 with combined changelog (v0.1.1 + v0.2.0)');

    // Delete v0.1.1 (now consolidated into v0.2.0)
    await db.collection('versions').doc('0.1.1').delete();
    console.log('✅ Deleted v0.1.1 (consolidated into v0.2.0)');

    // Delete the duplicate with wrong ID if it exists
    try {
      await db.collection('versions').doc('v0.2.0').delete();
      console.log('✅ Deleted duplicate v0.2.0 record');
    } catch (err) {
      // Ignore if already deleted
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

updateChangelog();
