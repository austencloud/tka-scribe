/**
 * Fix Thumbnail Paths Script
 *
 * Updates thumbnail paths from /Explore/ to /gallery/
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const userId = process.argv[2] || 'PBp3GSBO6igCKPwJyLZNmVEmamI3';

console.log(`\n🔧 Fixing thumbnail paths for user: ${userId}\n`);

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(join(projectRoot, 'serviceAccountKey.json'), 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function fixPaths() {
  // Fix user's library sequences
  const userSeqRef = db.collection('users').doc(userId).collection('sequences');
  const userSeqSnapshot = await userSeqRef.get();

  console.log(`📚 Found ${userSeqSnapshot.size} sequences in user library`);

  let fixedCount = 0;
  const batch = db.batch();

  for (const doc of userSeqSnapshot.docs) {
    const data = doc.data();
    const thumbnails = data.thumbnails || [];

    // Fix paths: /Explore/ -> /gallery/
    const fixedThumbnails = thumbnails.map(path =>
      path.replace('/Explore/', '/gallery/')
    );

    if (JSON.stringify(thumbnails) !== JSON.stringify(fixedThumbnails)) {
      batch.update(doc.ref, { thumbnails: fixedThumbnails });
      fixedCount++;
    }
  }

  if (fixedCount > 0) {
    await batch.commit();
    console.log(`✅ Fixed ${fixedCount} sequences in user library`);
  } else {
    console.log(`ℹ️  No paths needed fixing in user library`);
  }

  // Fix public sequences
  const publicSeqRef = db.collection('publicSequences');
  const publicSeqSnapshot = await publicSeqRef.get();

  console.log(`\n🌐 Found ${publicSeqSnapshot.size} public sequences`);

  let publicFixedCount = 0;
  const publicBatch = db.batch();

  for (const doc of publicSeqSnapshot.docs) {
    const data = doc.data();
    const thumbnails = data.thumbnails || [];

    const fixedThumbnails = thumbnails.map(path =>
      path.replace('/Explore/', '/gallery/')
    );

    if (JSON.stringify(thumbnails) !== JSON.stringify(fixedThumbnails)) {
      publicBatch.update(doc.ref, { thumbnails: fixedThumbnails });
      publicFixedCount++;
    }
  }

  if (publicFixedCount > 0) {
    await publicBatch.commit();
    console.log(`✅ Fixed ${publicFixedCount} public sequences`);
  } else {
    console.log(`ℹ️  No paths needed fixing in public sequences`);
  }

  console.log('\n🎉 Done!\n');
}

try {
  await fixPaths();
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
