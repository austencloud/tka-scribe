/**
 * Update v0.2.0 to v0.1.0 in Firestore
 * One-time script to fix version number
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

async function updateVersion() {
  console.log('🔄 Updating version from 0.2.0 to 0.1.0...\n');

  try {
    // Check if v0.2.0 exists
    const v020Doc = await db.collection('versions').doc('0.2.0').get();

    if (!v020Doc.exists) {
      console.log('⚠️  No v0.2.0 document found in Firestore');
      console.log('   Nothing to update.');
      process.exit(0);
    }

    const v020Data = v020Doc.data();
    console.log('✓ Found v0.2.0 document');

    // Create new v0.1.0 document with updated data
    const v010Data = {
      ...v020Data,
      version: '0.1.0',
      changelogEntries: [
        {
          category: 'added',
          text: 'Full sequence editor with construct, record, and edit modes'
        },
        {
          category: 'added',
          text: 'Interactive animation playback with customizable trail effects'
        },
        {
          category: 'added',
          text: 'Gallery discovery with filtering and search'
        },
        {
          category: 'added',
          text: 'User authentication and profile management'
        },
        {
          category: 'added',
          text: 'Challenge system for guided practice'
        },
        {
          category: 'added',
          text: 'AI-powered feedback collection system'
        },
        {
          category: 'added',
          text: 'Six core modules: Animate, Create, Discover, Library, Train, Learn'
        },
        {
          category: 'added',
          text: 'Responsive mobile-first design with PWA support'
        }
      ]
    };

    console.log('✓ Creating v0.1.0 document...');
    await db.collection('versions').doc('0.1.0').set(v010Data);
    console.log('✓ Created v0.1.0 document');

    console.log('✓ Deleting v0.2.0 document...');
    await db.collection('versions').doc('0.2.0').delete();
    console.log('✓ Deleted v0.2.0 document');

    // Update any feedback items that were marked as fixed in v0.2.0
    console.log('✓ Checking for feedback items...');
    const feedbackSnapshot = await db.collection('feedback')
      .where('fixedInVersion', '==', '0.2.0')
      .get();

    if (feedbackSnapshot.empty) {
      console.log('  No feedback items to update');
    } else {
      console.log(`  Found ${feedbackSnapshot.size} feedback items to update`);
      const batch = db.batch();
      feedbackSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { fixedInVersion: '0.1.0' });
      });
      await batch.commit();
      console.log('✓ Updated feedback items');
    }

    console.log('\n🎉 Successfully updated version to 0.1.0!');
    console.log('   Check the What\'s New tab to see the changes.');

  } catch (error) {
    console.error('❌ Error updating version:', error);
    process.exit(1);
  }

  process.exit(0);
}

updateVersion();
