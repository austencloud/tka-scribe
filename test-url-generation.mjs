/**
 * Test URL Generation
 * Simulates the encoding process to see what might be going wrong
 */

import LZString from "lz-string";

// Simulate a simple sequence with complete data
const testSequence = {
  id: "test",
  name: "Test Sequence",
  word: "TEST",
  startingPositionBeat: {
    beatNumber: 0,
    motions: {
      blue: {
        startLocation: "SOUTH",
        endLocation: "SOUTH",
        startOrientation: "IN",
        endOrientation: "IN",
        rotationDirection: "NO_ROTATION",
        turns: 0,
        motionType: "STATIC",
      },
      red: {
        startLocation: "NORTH",
        endLocation: "NORTH",
        startOrientation: "IN",
        endOrientation: "IN",
        rotationDirection: "NO_ROTATION",
        turns: 0,
        motionType: "STATIC",
      },
    },
    duration: 1,
    blueReversal: false,
    redReversal: false,
    isBlank: false,
    id: "start",
    letter: null,
    startPosition: null,
    endPosition: null,
  },
  beats: [
    {
      beatNumber: 1,
      motions: {
        blue: {
          startLocation: "SOUTH",
          endLocation: "WEST",
          startOrientation: "IN",
          endOrientation: "IN",
          rotationDirection: "CLOCKWISE",
          turns: 0,
          motionType: "PRO",
        },
        red: {
          startLocation: "NORTH",
          endLocation: "EAST",
          startOrientation: "IN",
          endOrientation: "IN",
          rotationDirection: "CLOCKWISE",
          turns: 0,
          motionType: "PRO",
        },
      },
      duration: 1,
      blueReversal: false,
      redReversal: false,
      isBlank: false,
      id: "beat1",
      letter: null,
      startPosition: null,
      endPosition: null,
    },
  ],
  thumbnails: [],
  isFavorite: false,
  isCircular: false,
  tags: [],
  metadata: {},
  sequenceLength: 1,
};

// Test 1: Check if encoding works with complete data
console.log("=" .repeat(80));
console.log("TEST 1: Encoding a valid sequence");
console.log("=".repeat(80));

// Manually encode like the actual code does
const LOCATION_ENCODE = {
  NORTH: "no", EAST: "ea", SOUTH: "so", WEST: "we",
  NORTHEAST: "ne", SOUTHEAST: "se", SOUTHWEST: "sw", NORTHWEST: "nw",
};

const ORIENTATION_ENCODE = {
  IN: "i", OUT: "o", CLOCK: "k", COUNTER: "t",
};

const ROTATION_ENCODE = {
  CLOCKWISE: "c", COUNTER_CLOCKWISE: "u", NO_ROTATION: "x",
};

const MOTION_TYPE_ENCODE = {
  PRO: "p", ANTI: "a", FLOAT: "l", DASH: "d", STATIC: "s",
};

function encodeMotion(motion) {
  if (!motion) return "";

  const startLoc = LOCATION_ENCODE[motion.startLocation];
  const endLoc = LOCATION_ENCODE[motion.endLocation];
  const startOrient = ORIENTATION_ENCODE[motion.startOrientation];
  const endOrient = ORIENTATION_ENCODE[motion.endOrientation];
  const rotation = ROTATION_ENCODE[motion.rotationDirection];
  const turns = motion.turns === "fl" ? "f" : String(motion.turns);
  const type = MOTION_TYPE_ENCODE[motion.motionType];

  if (!startLoc || !endLoc || !startOrient || !endOrient || !rotation || !type) {
    console.error("❌ Missing encoded value:", {
      startLoc, endLoc, startOrient, endOrient, rotation, type
    });
    return "ERROR";
  }

  return `${startLoc}${endLoc}${startOrient}${endOrient}${rotation}${turns}${type}`;
}

function encodeBeat(beat) {
  const blueMotion = encodeMotion(beat.motions.blue);
  const redMotion = encodeMotion(beat.motions.red);
  return `${blueMotion}:${redMotion}`;
}

// Encode start position
const startPosEncoded = encodeBeat(testSequence.startingPositionBeat);
console.log("Start Position Encoded:", startPosEncoded);

// Encode beats
const beatsEncoded = testSequence.beats.map(encodeBeat);
console.log("Beats Encoded:", beatsEncoded);

// Full encoding
const fullEncoded = `${startPosEncoded}|${beatsEncoded.join("|")}`;
console.log("\nFull Encoded String:");
console.log(fullEncoded);
console.log("Length:", fullEncoded.length);

// Compress
console.log("\n" + "=".repeat(80));
console.log("TEST 2: Compression");
console.log("=".repeat(80));

const compressed = LZString.compressToEncodedURIComponent(fullEncoded);
console.log("Compressed:", compressed);
console.log("Compressed Length:", compressed.length);
console.log("Compression Ratio:", ((fullEncoded.length - compressed.length) / fullEncoded.length * 100).toFixed(1) + "%");

// Test decompression
console.log("\n" + "=".repeat(80));
console.log("TEST 3: Decompression");
console.log("=".repeat(80));

const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
console.log("Decompressed:", decompressed);
console.log("Matches Original:", decompressed === fullEncoded ? "✅ YES" : "❌ NO");

// Now test with INCOMPLETE data (missing orientations)
console.log("\n" + "=".repeat(80));
console.log("TEST 4: Encoding with MISSING orientations");
console.log("=".repeat(80));

const brokenSequence = {
  ...testSequence,
  beats: [
    {
      ...testSequence.beats[0],
      motions: {
        blue: {
          ...testSequence.beats[0].motions.blue,
          startOrientation: undefined, // MISSING!
          endOrientation: undefined,   // MISSING!
        },
        red: {
          ...testSequence.beats[0].motions.red,
          startOrientation: undefined,
          endOrientation: undefined,
        },
      },
    },
  ],
};

try {
  const brokenStartEncoded = encodeBeat(brokenSequence.startingPositionBeat);
  const brokenBeatsEncoded = brokenSequence.beats.map(encodeBeat);
  const brokenFullEncoded = `${brokenStartEncoded}|${brokenBeatsEncoded.join("|")}`;

  console.log("Broken Encoded String:", brokenFullEncoded);

  if (brokenFullEncoded.includes("undefined") || brokenFullEncoded.includes("ERROR")) {
    console.log("❌ ENCODING PRODUCED INVALID DATA!");
    console.log("   This is what happens when orientations are missing!");
  }

  const brokenCompressed = LZString.compressToEncodedURIComponent(brokenFullEncoded);
  console.log("Broken Compressed:", brokenCompressed.substring(0, 100) + "...");

  const brokenDecompressed = LZString.decompressFromEncodedURIComponent(brokenCompressed);
  console.log("Broken Decompressed:", brokenDecompressed ? "✅ Succeeded" : "❌ Failed");

  if (brokenDecompressed) {
    console.log("Data:", brokenDecompressed);
  }
} catch (e) {
  console.log("❌ Exception:", e.message);
}

console.log("\n" + "=".repeat(80));
console.log("CONCLUSION");
console.log("=".repeat(80));
console.log("If the URL in your browser is failing to decompress, it likely means:");
console.log("1. The sequence being encoded has undefined/null orientation values");
console.log("2. The encoder is producing strings with 'undefined' in them");
console.log("3. The compressed data is then corrupted and won't decompress");
console.log("\nThe fix is to ensure orientations are ALWAYS calculated before encoding.");
