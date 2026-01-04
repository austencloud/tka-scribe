/**
 * Remove Stale Start Position Script
 *
 * The sequence-index.json was incorrectly normalized to include startPosition
 * fields in the OLD format (blueAttributes/redAttributes). The rendering pipeline
 * expects the MODERN format (motions.blue/motions.red with MotionData).
 *
 * The correct approach is to NOT store startPosition in the JSON, and instead
 * let the StartPositionDeriver derive it dynamically from the first beat at
 * render time.
 *
 * This script removes the stale startPosition fields so that derivation works.
 *
 * Usage:
 *   node scripts/remove-stale-start-positions.cjs              # Preview changes
 *   node scripts/remove-stale-start-positions.cjs --confirm    # Apply changes
 */

const fs = require("fs");
const path = require("path");

const SEQUENCE_INDEX_PATH = path.join(
  __dirname,
  "..",
  "static",
  "data",
  "sequence-index.json"
);

// Main function
async function main() {
  const confirmMode = process.argv.includes("--confirm");

  console.log("=".repeat(60));
  console.log("Remove Stale Start Position Script");
  console.log("=".repeat(60));
  console.log();

  // Read sequence index
  if (!fs.existsSync(SEQUENCE_INDEX_PATH)) {
    console.error(
      `Error: sequence-index.json not found at ${SEQUENCE_INDEX_PATH}`
    );
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(SEQUENCE_INDEX_PATH, "utf8"));
  const sequences = data.sequences || [];

  console.log(`Total sequences: ${sequences.length}`);
  console.log();

  // Find sequences with startPosition fields
  const withStartPos = sequences.filter(
    (seq) => seq.startPosition !== undefined
  );
  const withOldFormat = sequences.filter(
    (seq) =>
      seq.startPosition &&
      (seq.startPosition.blueAttributes || seq.startPosition.redAttributes)
  );

  console.log(`Sequences with startPosition field: ${withStartPos.length}`);
  console.log(
    `Sequences with OLD format startPosition: ${withOldFormat.length}`
  );
  console.log();

  if (withStartPos.length === 0) {
    console.log("No startPosition fields found - nothing to remove.");
    return;
  }

  // Show examples
  console.log("Examples of startPosition fields to remove:");
  console.log("-".repeat(40));
  for (const seq of withStartPos.slice(0, 5)) {
    console.log(`  - ${seq.word || seq.name || seq.id}`);
    console.log(
      `    Has blueAttributes: ${!!seq.startPosition?.blueAttributes}`
    );
    console.log(`    Has motions.blue: ${!!seq.startPosition?.motions?.blue}`);
  }
  if (withStartPos.length > 5) {
    console.log(`  ... and ${withStartPos.length - 5} more`);
  }
  console.log();

  if (!confirmMode) {
    console.log("Preview mode - no changes made.");
    console.log("Run with --confirm to remove startPosition fields.");
    return;
  }

  // Remove startPosition from all sequences
  console.log("Removing startPosition fields...");

  const cleanedSequences = sequences.map((seq) => {
    if (seq.startPosition !== undefined) {
      const { startPosition, startingPositionGroup, beats, ...rest } = seq;
      // Keep beats field (the normalized beats array)
      return { ...rest, beats };
    }
    return seq;
  });

  // Write back
  const outputData = { ...data, sequences: cleanedSequences };

  // Backup (different name from first backup)
  const backupPath = SEQUENCE_INDEX_PATH.replace(
    ".json",
    ".before-startpos-removal.json"
  );
  fs.copyFileSync(SEQUENCE_INDEX_PATH, backupPath);
  console.log(`Backup created: ${backupPath}`);

  // Write cleaned data
  fs.writeFileSync(SEQUENCE_INDEX_PATH, JSON.stringify(outputData, null, 2));
  console.log(`Removed startPosition from ${withStartPos.length} sequences.`);
  console.log(`Updated: ${SEQUENCE_INDEX_PATH}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
