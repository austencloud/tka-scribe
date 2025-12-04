/**
 * Script to add v0.1.0 changelog to Firestore
 *
 * Run with: node scripts/add-v010-changelog.js
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../serviceAccountKey.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Human-readable changelog for v0.1.0
const changelogEntries = [
  // Bug Fixes
  {
    category: 'fixed',
    text: 'Sequences now load correctly when you open them from the gallery'
  },
  {
    category: 'fixed',
    text: 'The app no longer freezes when switching between modules'
  },
  {
    category: 'fixed',
    text: 'Your progress is now saved properly when you close the app'
  },

  // New Features
  {
    category: 'added',
    text: 'You can now see version history and release notes right here!'
  },
  {
    category: 'added',
    text: 'Submit feedback directly from the app - tap the Feedback tab'
  },
  {
    category: 'added',
    text: 'Track the status of your submitted feedback'
  },
  {
    category: 'added',
    text: 'Get notified when your reported issues are fixed'
  },

  // Improvements
  {
    category: 'improved',
    text: 'Navigation is smoother and more responsive'
  },
  {
    category: 'improved',
    text: 'The app loads faster on first visit'
  },
  {
    category: 'improved',
    text: 'Better error messages when something goes wrong'
  }
];

async function addChangelog() {
  try {
    const versionRef = db.collection('versions').doc('0.1.0');

    // Check if version exists
    const docSnap = await versionRef.get();

    if (!docSnap.exists) {
      // Create the version document
      console.log('Creating v0.1.0 version document...');
      await versionRef.set({
        version: '0.1.0',
        releaseNotes: 'The first official beta release! This version introduces the feedback system so you can help us make the app better.',
        feedbackCount: 0,
        feedbackSummary: { bugs: 0, features: 0, general: 0 },
        changelogEntries: changelogEntries,
        releasedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log('Created v0.1.0 with changelog!');
    } else {
      // Update existing with changelog
      console.log('Updating v0.1.0 with changelog...');
      await versionRef.update({
        changelogEntries: changelogEntries,
        releaseNotes: 'The first official beta release! This version introduces the feedback system so you can help us make the app better.'
      });
      console.log('Updated v0.1.0 with changelog!');
    }

    console.log('\nChangelog entries added:');
    const fixed = changelogEntries.filter(e => e.category === 'fixed');
    const added = changelogEntries.filter(e => e.category === 'added');
    const improved = changelogEntries.filter(e => e.category === 'improved');

    console.log(`  - ${fixed.length} bug fixes`);
    console.log(`  - ${added.length} new features`);
    console.log(`  - ${improved.length} improvements`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addChangelog();
