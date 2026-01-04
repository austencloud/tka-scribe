/**
 * Sequence Normalization Script
 *
 * Normalizes sequence data by separating start positions (beat 0) from actual beats.
 *
 * Problem: In the old format, beat 0 (start position) is mixed in with sequence beats
 * in the fullMetadata.sequence array. The modern format expects:
 * - startPosition field for beat 0 data
 * - beats array containing only beats 1+
 *
 * Usage:
 *   node scripts/normalize-sequences.cjs              # Preview changes
 *   node scripts/normalize-sequences.cjs --confirm    # Apply changes
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

// Type check: is this beat a start position?
function isStartPosition(beat) {
  if (!beat) return false;

  // Modern flag
  if (beat.isStartPosition === true) return true;

  // Legacy: beat number 0
  if (beat.beat === 0 || beat.beatNumber === 0) return true;

  // Has sequenceStartPosition field (old format indicator)
  if (beat.sequenceStartPosition) return true;

  return false;
}

// Normalize a single sequence's fullMetadata.sequence array
function normalizeSequenceBeats(sequenceArray) {
  if (!Array.isArray(sequenceArray)) return { beats: [], startPosition: null };

  // First element is often metadata, not a beat
  const metadataEntry = sequenceArray.find(
    (item) =>
      item.word !== undefined &&
      item.author !== undefined &&
      item.beat === undefined &&
      item.beatNumber === undefined
  );

  // Find start position
  const startPosition =
    sequenceArray.find((item) => isStartPosition(item)) || null;

  // Get actual beats (not metadata, not start position)
  const beats = sequenceArray.filter((item) => {
    // Skip metadata entries
    if (
      item.word !== undefined &&
      item.author !== undefined &&
      item.beat === undefined &&
      item.beatNumber === undefined
    ) {
      return false;
    }
    // Skip start position
    if (isStartPosition(item)) {
      return false;
    }
    // Keep actual beats
    return true;
  });

  return { beats, startPosition, metadata: metadataEntry };
}

// Check if a sequence needs normalization
function needsNormalization(sequence) {
  // Check if fullMetadata.sequence has beat 0 mixed in
  if (!sequence.fullMetadata?.sequence) return false;

  const seqArray = sequence.fullMetadata.sequence;

  // Find if there's a beat 0 / start position mixed in
  const hasStartPositionInArray = seqArray.some((item) =>
    isStartPosition(item)
  );

  // Also check if top-level startPosition is missing when it should exist
  const hasSeparateStartPosition = sequence.startPosition !== undefined;

  return hasStartPositionInArray && !hasSeparateStartPosition;
}

// Apply normalization to a sequence
function normalizeSequence(sequence) {
  if (!sequence.fullMetadata?.sequence) return sequence;

  const { beats, startPosition, metadata } = normalizeSequenceBeats(
    sequence.fullMetadata.sequence
  );

  // Create normalized fullMetadata.sequence (metadata + beats only, no start position)
  const normalizedSequenceArray = [];
  if (metadata) {
    normalizedSequenceArray.push(metadata);
  }
  normalizedSequenceArray.push(...beats);

  // Create normalized sequence object
  const normalized = {
    ...sequence,
    startPosition: startPosition,
    beats: beats,
    fullMetadata: {
      ...sequence.fullMetadata,
      sequence: normalizedSequenceArray,
    },
  };

  // Also add startingPositionGroup if we can derive it
  if (startPosition?.endPos) {
    const group = derivePositionGroup(startPosition.endPos);
    if (group) {
      normalized.startingPositionGroup = group;
    }
  }

  return normalized;
}

// Derive position group from position name (alpha1 -> alpha, beta2 -> beta, etc.)
function derivePositionGroup(posName) {
  if (!posName) return null;

  const match = posName.match(/^(alpha|beta|gamma)/i);
  return match ? match[1].toLowerCase() : null;
}

// Main function
async function main() {
  const confirmMode = process.argv.includes("--confirm");

  console.log("=".repeat(60));
  console.log("Sequence Normalization Script");
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

  // Find sequences needing normalization
  const needingNormalization = sequences.filter(needsNormalization);

  console.log(
    `Sequences needing normalization: ${needingNormalization.length}`
  );
  console.log();

  if (needingNormalization.length === 0) {
    console.log("All sequences are already normalized!");
    return;
  }

  // Show what will be changed
  console.log("Sequences to normalize:");
  console.log("-".repeat(40));

  for (const seq of needingNormalization.slice(0, 20)) {
    const seqArray = seq.fullMetadata?.sequence || [];
    const startPos = seqArray.find(isStartPosition);
    const beatCount = seqArray.filter(
      (item) => !isStartPosition(item) && item.beat !== undefined
    ).length;

    console.log(`  - ${seq.word || seq.name || seq.id}`);
    console.log(
      `    Start position: ${startPos?.sequenceStartPosition || startPos?.endPos || "unknown"}`
    );
    console.log(`    Beat count: ${beatCount}`);
  }

  if (needingNormalization.length > 20) {
    console.log(`  ... and ${needingNormalization.length - 20} more`);
  }
  console.log();

  if (!confirmMode) {
    console.log("Preview mode - no changes made.");
    console.log("Run with --confirm to apply normalization.");
    return;
  }

  // Apply normalization
  console.log("Applying normalization...");

  const normalizedSequences = sequences.map((seq) => {
    if (needsNormalization(seq)) {
      return normalizeSequence(seq);
    }
    return seq;
  });

  // Write back
  const outputData = { ...data, sequences: normalizedSequences };

  // Backup original
  const backupPath = SEQUENCE_INDEX_PATH.replace(".json", ".backup.json");
  fs.copyFileSync(SEQUENCE_INDEX_PATH, backupPath);
  console.log(`Backup created: ${backupPath}`);

  // Write normalized data
  fs.writeFileSync(SEQUENCE_INDEX_PATH, JSON.stringify(outputData, null, 2));
  console.log(`Normalized ${needingNormalization.length} sequences.`);
  console.log(`Updated: ${SEQUENCE_INDEX_PATH}`);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
