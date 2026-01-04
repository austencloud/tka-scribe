/**
 * Backfill LOOP Metadata Script
 *
 * Updates existing sequences in Firestore with:
 * - isCircular flag
 * - loopType (for circular sequences)
 * - orientationCycleCount (for circular sequences)
 *
 * Uses pagination to avoid Firestore quota limits.
 *
 * Usage: node scripts/backfill-loop-metadata.js [--dry-run] [--collection=publicSequences]
 */

import admin from "firebase-admin";
import { readFileSync } from "fs";

// Parse command line args
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const collectionArg = args.find((arg) => arg.startsWith("--collection="));
const targetCollection = collectionArg
  ? collectionArg.split("=")[1]
  : "publicSequences";

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync("./serviceAccountKey.json", "utf8")
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const PAGE_SIZE = 20; // Small page size to stay under quota
const DELAY_MS = 2000; // 2 second delay between pages

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if sequence is circular by comparing start and end positions
 */
function isCircular(sequence) {
  if (!sequence.beats || sequence.beats.length === 0) {
    return false;
  }

  const firstBeat = sequence.beats[0];
  const lastBeat = sequence.beats[sequence.beats.length - 1];

  // Get positions from first and last beat
  const startPos =
    sequence.startPosition?.endPosition ||
    sequence.startingPositionBeat?.endPosition ||
    firstBeat?.startPosition;

  const endPos = lastBeat?.endPosition;

  if (!startPos || !endPos) {
    return false;
  }

  // Circular if end matches start
  return startPos === endPos;
}

/**
 * Detect orientation cycle count for circular sequences
 * Returns 1, 2, or 4 based on how many reps needed to return to starting orientation
 */
function detectOrientationCycle(sequence) {
  const beats = sequence.beats;

  if (!beats || beats.length === 0) {
    return 1;
  }

  // Get starting orientations
  const startOrientations = getStartingOrientations(sequence);

  // Track orientations through repetitions
  let currentBlue = startOrientations.blue;
  let currentRed = startOrientations.red;

  // Simulate up to 4 repetitions
  for (let rep = 1; rep <= 4; rep++) {
    for (const beat of beats) {
      const blueMotion = beat.motions?.blue;
      const redMotion = beat.motions?.red;

      if (blueMotion?.endOrientation) {
        currentBlue = blueMotion.endOrientation;
      }
      if (redMotion?.endOrientation) {
        currentRed = redMotion.endOrientation;
      }
    }

    // Check if we're back to starting orientation
    if (
      currentBlue === startOrientations.blue &&
      currentRed === startOrientations.red
    ) {
      return rep;
    }
  }

  // Default to 4 if we haven't returned after 4 reps
  return 4;
}

function getStartingOrientations(sequence) {
  const startPos = sequence.startPosition || sequence.startingPositionBeat;

  if (startPos?.motions) {
    return {
      blue: startPos.motions.blue?.startOrientation || "in",
      red: startPos.motions.red?.startOrientation || "in",
    };
  }

  const firstBeat = sequence.beats?.[0];
  if (firstBeat?.motions) {
    return {
      blue: firstBeat.motions.blue?.startOrientation || "in",
      red: firstBeat.motions.red?.startOrientation || "in",
    };
  }

  return { blue: "in", red: "in" };
}

/**
 * Analyze a sequence and return LOOP metadata
 */
function analyzeSequence(sequence) {
  const circular = isCircular(sequence);

  const metadata = {
    isCircular: circular,
  };

  // Only analyze circular sequences for orientation cycle count
  if (circular) {
    try {
      const cycleCount = detectOrientationCycle(sequence);
      metadata.orientationCycleCount = cycleCount;
    } catch (error) {
      console.warn(
        `   ⚠️  Failed to detect orientation cycle: ${error.message}`
      );
    }
  }

  return metadata;
}

async function backfillInPages() {
  console.log(
    `\n📦 Starting LOOP metadata backfill for ${targetCollection}...`
  );
  console.log(
    `   Mode: ${isDryRun ? "DRY RUN (no changes)" : "LIVE UPDATE"}\n`
  );

  let lastDoc = null;
  let totalProcessed = 0;
  let totalUpdated = 0;
  let pageNum = 0;

  const stats = {
    circular: 0,
    nonCircular: 0,
    cycle1: 0,
    cycle2: 0,
    cycle4: 0,
  };

  while (true) {
    pageNum++;
    console.log(
      `\n📄 Page ${pageNum}: Fetching up to ${PAGE_SIZE} sequences...`
    );

    try {
      // Build query with pagination
      let query = db
        .collection(targetCollection)
        .orderBy("__name__")
        .limit(PAGE_SIZE);

      if (lastDoc) {
        query = query.startAfter(lastDoc);
      }

      const snapshot = await query.get();

      if (snapshot.empty) {
        console.log("\n✅ No more documents to process!");
        break;
      }

      console.log(`   Found ${snapshot.docs.length} documents`);

      // Analyze each sequence
      const updates = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        totalProcessed++;

        // Skip if already has metadata
        if (
          data.isCircular !== undefined &&
          data.orientationCycleCount !== undefined
        ) {
          continue;
        }

        // Analyze sequence
        const metadata = analyzeSequence(data);

        // Track stats
        if (metadata.isCircular) {
          stats.circular++;
          if (metadata.orientationCycleCount === 1) stats.cycle1++;
          else if (metadata.orientationCycleCount === 2) stats.cycle2++;
          else if (metadata.orientationCycleCount === 4) stats.cycle4++;
        } else {
          stats.nonCircular++;
        }

        updates.push({ ref: doc.ref, metadata });
      }

      console.log(`   ${updates.length} sequences need metadata`);

      // Apply updates
      if (updates.length > 0 && !isDryRun) {
        const batch = db.batch();
        updates.forEach(({ ref, metadata }) => {
          batch.update(ref, metadata);
        });

        await batch.commit();
        totalUpdated += updates.length;
        console.log(
          `   ✅ Updated ${updates.length} sequences (total: ${totalUpdated})`
        );
      } else if (updates.length > 0 && isDryRun) {
        console.log(`   🔍 Would update ${updates.length} sequences`);
        totalUpdated += updates.length;
      }

      // Save last document for pagination
      lastDoc = snapshot.docs[snapshot.docs.length - 1];

      // Check if this was the last page
      if (snapshot.docs.length < PAGE_SIZE) {
        console.log("\n✅ Reached end of collection!");
        break;
      }

      // Delay before next page to respect quota
      console.log(`   Waiting ${DELAY_MS}ms before next page...`);
      await sleep(DELAY_MS);
    } catch (error) {
      if (error.code === 8 || error.message.includes("RESOURCE_EXHAUSTED")) {
        console.log(`\n⏸️  Quota exceeded. Waiting 30 seconds before retry...`);
        await sleep(30000);
        pageNum--;
      } else {
        console.error("\n❌ Error:", error.message);
        throw error;
      }
    }
  }

  console.log(`\n🎉 Backfill Complete!\n`);
  console.log(`📊 Statistics:`);
  console.log(`   Total processed: ${totalProcessed}`);
  console.log(`   Total updated: ${totalUpdated}`);
  console.log(`   Circular sequences: ${stats.circular}`);
  console.log(`   Non-circular sequences: ${stats.nonCircular}`);
  console.log(`   Orientation cycles:`);
  console.log(`     - Returns in 1 rep: ${stats.cycle1}`);
  console.log(`     - Returns in 2 reps: ${stats.cycle2}`);
  console.log(`     - Returns in 4 reps: ${stats.cycle4}`);
  console.log("");
}

backfillInPages()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  });
