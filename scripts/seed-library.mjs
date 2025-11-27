/**
 * Seed Library Script
 *
 * Seeds all sequences from sequence-index.json to a user's Firestore library.
 *
 * Usage: node scripts/seed-library.mjs <userId>
 * Example: node scripts/seed-library.mjs PBp3GSBO6igCKPwJyLZNmVEmamI3
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Get user ID from command line
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Usage: node scripts/seed-library.mjs <userId>');
  console.error('   Example: node scripts/seed-library.mjs PBp3GSBO6igCKPwJyLZNmVEmamI3');
  process.exit(1);
}

console.log(`\n🌱 Seeding library for user: ${userId}\n`);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(projectRoot, 'serviceAccountKey.json'), 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Load sequence index
const sequenceIndex = JSON.parse(
  readFileSync(join(projectRoot, 'static/sequence-index.json'), 'utf8')
);

console.log(`📚 Found ${sequenceIndex.sequences.length} sequences in index\n`);

// Seed sequences
async function seedSequences() {
  const batch = db.batch();
  let count = 0;
  let batchCount = 0;
  const BATCH_SIZE = 500; // Firestore batch limit

  for (const raw of sequenceIndex.sequences) {
    const sequenceId = raw.word || raw.id || `seq-${count}`;
    const docRef = db.collection('users').doc(userId).collection('sequences').doc(sequenceId);

    const librarySequence = {
      // Core sequence data
      id: sequenceId,
      name: raw.name || raw.word || 'Unnamed',
      word: raw.word || raw.name || '',
      beats: [], // Will be loaded lazily from static files
      thumbnails: raw.thumbnails || [],
      isFavorite: false,
      isCircular: raw.isCircular || false,
      tags: raw.tags || ['flow', 'practice'],
      metadata: raw.metadata || { source: 'tka_dictionary' },
      author: raw.author || 'TKA Dictionary',
      gridMode: raw.gridMode || 'box',
      difficultyLevel: raw.difficultyLevel || 'beginner',
      sequenceLength: raw.sequenceLength || 0,
      level: raw.level || 1,
      dateAdded: raw.dateAdded ? new Date(raw.dateAdded) : new Date(),
      propType: raw.propType || 'Staff',
      startingPositionGroup: raw.startingPosition || 'alpha',

      // Library-specific fields
      ownerId: userId,
      source: 'created',
      visibility: 'public',
      collectionIds: [],
      tagIds: [],
      forkCount: 0,
      viewCount: 0,
      starCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    batch.set(docRef, librarySequence, { merge: true });
    count++;

    // Commit batch every 500 documents
    if (count % BATCH_SIZE === 0) {
      console.log(`  📦 Committing batch ${++batchCount} (${count} sequences)...`);
      await batch.commit();
    }
  }

  // Commit remaining
  if (count % BATCH_SIZE !== 0) {
    console.log(`  📦 Committing final batch...`);
    await batch.commit();
  }

  console.log(`\n✅ Successfully seeded ${count} sequences to user ${userId}'s library!`);
  console.log(`\n📍 Firestore path: users/${userId}/sequences/`);
}

// Also sync to public index for discoverability
async function syncToPublicIndex() {
  console.log('\n🌐 Syncing to public sequences index...\n');

  const batch = db.batch();
  let count = 0;
  const BATCH_SIZE = 500;

  for (const raw of sequenceIndex.sequences) {
    const sequenceId = raw.word || raw.id || `seq-${count}`;
    const docRef = db.collection('publicSequences').doc(sequenceId);

    const publicEntry = {
      id: sequenceId,
      name: raw.name || raw.word || 'Unnamed',
      word: raw.word || '',
      thumbnails: raw.thumbnails || [],
      author: raw.author || 'TKA Dictionary',
      creatorId: userId,
      creatorName: 'Austen', // You can change this
      difficultyLevel: raw.difficultyLevel || 'beginner',
      sequenceLength: raw.sequenceLength || 0,
      gridMode: raw.gridMode || 'box',
      propType: raw.propType || 'Staff',
      startingPositionGroup: raw.startingPosition || 'alpha',
      isCircular: raw.isCircular || false,
      tags: raw.tags || [],
      forkCount: 0,
      viewCount: 0,
      starCount: 0,
      sourceRef: `users/${userId}/sequences/${sequenceId}`,
      publishedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    batch.set(docRef, publicEntry, { merge: true });
    count++;

    if (count % BATCH_SIZE === 0) {
      console.log(`  📦 Committing public batch (${count} sequences)...`);
      await batch.commit();
    }
  }

  if (count % BATCH_SIZE !== 0) {
    await batch.commit();
  }

  console.log(`✅ Synced ${count} sequences to publicSequences collection!`);
}

// Run
try {
  await seedSequences();
  await syncToPublicIndex();
  console.log('\n🎉 Seeding complete!\n');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Seeding failed:', error);
  process.exit(1);
}
