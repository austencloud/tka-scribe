/**
 * Batch Re-Render Gallery Sequences Script
 *
 * Re-renders all gallery sequences with:
 * 1. Word + difficulty badge baked into the image (at the top)
 * 2. Multiple prop type variants for each sequence
 * 3. Uploads to Firebase Storage with naming: {word}_ver{N}_{propType}.webp
 * 4. Updates Firestore metadata with new image URLs
 *
 * Prerequisites:
 *   - Dev server must be running (npm run dev) on port 5173
 *   - Service account key must be in config/serviceAccountKey.json
 *
 * Usage:
 *   node scripts/batch-rerender-gallery.js --prop-types=all
 *   node scripts/batch-rerender-gallery.js --prop-types=staff,fan,hoop
 *   node scripts/batch-rerender-gallery.js --dry-run
 *   node scripts/batch-rerender-gallery.js --resume=<resumeId>
 *   node scripts/batch-rerender-gallery.js --api-url=http://localhost:5173/api/batch-render
 */

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const args = process.argv.slice(2);
const propTypesArg = args.find((arg) => arg.startsWith("--prop-types="))?.split("=")[1];
const dryRun = args.includes("--dry-run");
const resumeArg = args.find((arg) => arg.startsWith("--resume="))?.split("=")[1];

// Initialize Firebase Admin
const serviceAccountPath = resolve(__dirname, "../config/serviceAccountKey.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: serviceAccount.project_id + ".appspot.com",
});

const db = getFirestore();
const storage = getStorage().bucket();

// Define all prop types (matches PropType enum)
const ALL_PROP_TYPES = [
  "staff",
  "simple_staff",
  "bigstaff",
  "staff_v2",
  "club",
  "bigclub",
  "fan",
  "bigfan",
  "triad",
  "bigtriad",
  "minihoop",
  "bighoop",
  "buugeng",
  "bigbuugeng",
  "fractalgeng",
  "hand",
  "triquetra",
  "triquetra2",
  "sword",
  "chicken",
  "bigchicken",
  "guitar",
  "ukulele",
  "doublestar",
  "bigdoublestar",
  "eightrings",
  "bigeightrings",
  "quiad",
];

/**
 * Parse prop types from command line argument
 */
function getPropTypes() {
  if (!propTypesArg || propTypesArg === "all") {
    return ALL_PROP_TYPES;
  }
  return propTypesArg.split(",").map((pt) => pt.trim());
}

/**
 * Query all sequences from Firestore
 */
async function getAllSequences() {
  console.log("📦 Querying all sequences from Firestore...");
  const sequencesRef = db.collection("sequences");
  const snapshot = await sequencesRef.get();

  const sequences = [];
  snapshot.forEach((doc) => {
    sequences.push({
      id: doc.id,
      ...doc.data(),
    });
  });

  console.log(`✅ Found ${sequences.length} sequences`);
  return sequences;
}

/**
 * Render a sequence with specific prop type override
 * Calls the batch-render API endpoint
 */
async function renderSequence(sequence, propType, apiUrl = "http://localhost:5173/api/batch-render") {
  console.log(`  🎨 Rendering ${sequence.word || sequence.name} with prop type: ${propType}`);

  if (dryRun) {
    return Buffer.from(""); // Return empty buffer in dry run mode
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sequence,
        propType,
        beatSize: 120,
        format: "WebP",
        quality: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error || response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error(`    ❌ Rendering failed:`, error.message);
    throw error;
  }
}

/**
 * Upload image blob to Firebase Storage
 */
async function uploadToStorage(blob, filename) {
  if (dryRun) {
    console.log(`  [DRY RUN] Would upload: ${filename}`);
    return `https://storage.googleapis.com/${storage.name}/sequences/${filename}`;
  }

  const file = storage.file(`sequences/${filename}`);
  await file.save(blob, {
    metadata: {
      contentType: "image/webp",
    },
  });

  await file.makePublic();
  const url = `https://storage.googleapis.com/${storage.name}/sequences/${filename}`;
  console.log(`  ✅ Uploaded: ${url}`);
  return url;
}

/**
 * Update Firestore metadata with new image URLs
 */
async function updateSequenceMetadata(sequenceId, propType, imageUrl) {
  if (dryRun) {
    console.log(`  [DRY RUN] Would update Firestore for ${sequenceId}`);
    return;
  }

  const sequenceRef = db.collection("sequences").doc(sequenceId);

  // Store prop-type specific images in a subcollection or map field
  await sequenceRef.update({
    [`propTypeImages.${propType}`]: imageUrl,
    updatedAt: new Date().toISOString(),
  });

  console.log(`  ✅ Updated Firestore metadata for ${sequenceId}`);
}

/**
 * Generate filename for a sequence + prop type
 */
function generateFilename(sequence, propType) {
  const word = (sequence.word || sequence.name).replace(/\s+/g, "-").toLowerCase();
  const version = sequence.version || 1;
  return `${word}_ver${version}_${propType}.webp`;
}

/**
 * Main batch processing function
 */
async function batchRerender() {
  console.log("🚀 Starting batch re-render process");
  console.log(`   Prop types: ${getPropTypes().join(", ")}`);
  console.log(`   Dry run: ${dryRun}`);
  console.log();

  const sequences = await getAllSequences();
  const propTypes = getPropTypes();

  const totalJobs = sequences.length * propTypes.length;
  let completed = 0;
  let failed = 0;

  console.log(`📊 Total jobs: ${totalJobs} (${sequences.length} sequences × ${propTypes.length} prop types)`);
  console.log();

  for (const sequence of sequences) {
    console.log(`\n📝 Processing: ${sequence.word || sequence.name} (${sequence.id})`);

    for (const propType of propTypes) {
      try {
        // 1. Render sequence with prop type override
        const blob = await renderSequence(sequence, propType);

        if (!blob && !dryRun) {
          console.log(`  ⚠️  Skipping ${propType} - rendering not implemented yet`);
          continue;
        }

        // 2. Generate filename
        const filename = generateFilename(sequence, propType);

        // 3. Upload to Storage
        const imageUrl = await uploadToStorage(blob, filename);

        // 4. Update Firestore
        await updateSequenceMetadata(sequence.id, propType, imageUrl);

        completed++;
        console.log(`  ✅ ${completed}/${totalJobs} complete`);
      } catch (error) {
        failed++;
        console.error(`  ❌ Failed to process ${propType}:`, error.message);
      }
    }
  }

  console.log("\n" + "=".repeat(70));
  console.log(`✅ Batch re-render complete!`);
  console.log(`   Completed: ${completed}/${totalJobs}`);
  console.log(`   Failed: ${failed}`);
  console.log("=".repeat(70));
}

// Run the script
batchRerender().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
