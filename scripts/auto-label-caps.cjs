/**
 * Auto-Label CAP Sequences
 *
 * Runs the CAP detection algorithm on all unlabeled circular sequences
 * and saves predictions to Firebase with needsVerification: true flag.
 *
 * Usage:
 *   node scripts/auto-label-caps.cjs              # Dry run - show what would be labeled
 *   node scripts/auto-label-caps.cjs --apply      # Actually write to Firebase
 *   node scripts/auto-label-caps.cjs --word XXXX  # Test single word
 */

const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, "..", "serviceAccountKey.json");
let db;

try {
  const serviceAccount = require(serviceAccountPath);
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  db = admin.firestore();
} catch (error) {
  console.error("Failed to initialize Firebase:", error.message);
  process.exit(1);
}

// ============================================================================
// CAP Detection Logic (from validate-cap-detection.cjs)
// ============================================================================

// Beat-pair graph transformation maps (includes 90° and 270° rotations)
const ROTATE_270_CCW = {
  n: "e", e: "s", s: "w", w: "n",
  ne: "se", se: "sw", sw: "nw", nw: "ne",
};

const ROTATE_180 = {
  n: "s", s: "n", e: "w", w: "e",
  ne: "sw", sw: "ne", nw: "se", se: "nw",
};

const ROTATE_90_CCW = {
  n: "w", w: "s", s: "e", e: "n",
  ne: "nw", nw: "sw", sw: "se", se: "ne",
};

const MIRROR_VERTICAL = {
  n: "n", s: "s", e: "w", w: "e",
  ne: "nw", nw: "ne", se: "sw", sw: "se",
};

const FLIP_HORIZONTAL = {
  n: "s", s: "n", e: "e", w: "w",
  ne: "se", se: "ne", nw: "sw", sw: "nw",
};

function invertMotionType(type) {
  if (type === "pro") return "anti";
  if (type === "anti") return "pro";
  return type;
}

function isCircular(sequence) {
  const beats = sequence.fullMetadata?.sequence?.filter((b) => b.beat >= 1);
  if (!beats || beats.length < 2) return false;
  const startPosition = sequence.fullMetadata?.sequence?.find((b) => b.beat === 0);
  const lastBeat = beats[beats.length - 1];
  if (!startPosition || !lastBeat) return false;
  const startPos = startPosition.endPos || startPosition.sequenceStartPosition;
  const endPos = lastBeat.endPos;
  return startPos === endPos;
}

function extractBeats(sequence) {
  const raw = sequence.fullMetadata?.sequence;
  if (!raw) return [];
  return raw
    .filter((b) => b.beat >= 1)
    .map((b) => ({
      beatNumber: b.beat,
      letter: b.letter,
      startPos: b.startPos,
      endPos: b.endPos,
      blue: {
        startLoc: b.blueAttributes?.startLoc?.toLowerCase(),
        endLoc: b.blueAttributes?.endLoc?.toLowerCase(),
        motionType: b.blueAttributes?.motionType?.toLowerCase(),
      },
      red: {
        startLoc: b.redAttributes?.startLoc?.toLowerCase(),
        endLoc: b.redAttributes?.endLoc?.toLowerCase(),
        motionType: b.redAttributes?.motionType?.toLowerCase(),
      },
    }));
}

function isRotated(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red, b2Blue = beat2.blue, b2Red = beat2.red;
  if (!b1Blue?.endLoc || !b2Blue?.endLoc || !b1Red?.endLoc || !b2Red?.endLoc) return false;
  return (
    ROTATE_180[b1Blue.startLoc] === b2Blue.startLoc &&
    ROTATE_180[b1Blue.endLoc] === b2Blue.endLoc &&
    ROTATE_180[b1Red.startLoc] === b2Red.startLoc &&
    ROTATE_180[b1Red.endLoc] === b2Red.endLoc
  );
}

function isSwapped(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red, b2Blue = beat2.blue, b2Red = beat2.red;
  if (!b1Blue?.endLoc || !b2Blue?.endLoc || !b1Red?.endLoc || !b2Red?.endLoc) return false;
  if (b1Blue.motionType === b1Red.motionType) return false;
  return (
    b1Blue.startLoc === b2Red.startLoc && b1Blue.endLoc === b2Red.endLoc &&
    b1Blue.motionType === b2Red.motionType &&
    b1Red.startLoc === b2Blue.startLoc && b1Red.endLoc === b2Blue.endLoc &&
    b1Red.motionType === b2Blue.motionType
  );
}

function isRepeated(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red, b2Blue = beat2.blue, b2Red = beat2.red;
  if (!b1Blue?.endLoc || !b2Blue?.endLoc || !b1Red?.endLoc || !b2Red?.endLoc) return false;
  return (
    b1Blue.startLoc === b2Blue.startLoc && b1Blue.endLoc === b2Blue.endLoc &&
    b1Blue.motionType === b2Blue.motionType &&
    b1Red.startLoc === b2Red.startLoc && b1Red.endLoc === b2Red.endLoc &&
    b1Red.motionType === b2Red.motionType
  );
}

function isMirrored(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red, b2Blue = beat2.blue, b2Red = beat2.red;
  if (!b1Blue?.endLoc || !b2Blue?.endLoc || !b1Red?.endLoc || !b2Red?.endLoc) return false;
  return (
    MIRROR_VERTICAL[b1Blue.startLoc] === b2Blue.startLoc &&
    MIRROR_VERTICAL[b1Blue.endLoc] === b2Blue.endLoc &&
    MIRROR_VERTICAL[b1Red.startLoc] === b2Red.startLoc &&
    MIRROR_VERTICAL[b1Red.endLoc] === b2Red.endLoc
  );
}

function isFlipped(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red, b2Blue = beat2.blue, b2Red = beat2.red;
  if (!b1Blue?.endLoc || !b2Blue?.endLoc || !b1Red?.endLoc || !b2Red?.endLoc) return false;
  return (
    FLIP_HORIZONTAL[b1Blue.startLoc] === b2Blue.startLoc &&
    FLIP_HORIZONTAL[b1Blue.endLoc] === b2Blue.endLoc &&
    FLIP_HORIZONTAL[b1Red.startLoc] === b2Red.startLoc &&
    FLIP_HORIZONTAL[b1Red.endLoc] === b2Red.endLoc
  );
}

function isInverted(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red, b2Blue = beat2.blue, b2Red = beat2.red;
  if (!b1Blue?.motionType || !b2Blue?.motionType) return false;
  const positionsMatch =
    b1Blue.startLoc === b2Blue.startLoc && b1Blue.endLoc === b2Blue.endLoc &&
    b1Red.startLoc === b2Red.startLoc && b1Red.endLoc === b2Red.endLoc;
  const motionsInverted =
    invertMotionType(b1Blue.motionType) === b2Blue.motionType &&
    invertMotionType(b1Red.motionType) === b2Red.motionType;
  return positionsMatch && motionsInverted;
}

function isRotatedThenSwapped(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red, b2Blue = beat2.blue, b2Red = beat2.red;
  if (!b1Blue?.endLoc || !b2Blue?.endLoc || !b1Red?.endLoc || !b2Red?.endLoc) return false;
  return (
    ROTATE_180[b1Red.startLoc] === b2Blue.startLoc &&
    ROTATE_180[b1Red.endLoc] === b2Blue.endLoc &&
    b1Red.motionType === b2Blue.motionType &&
    ROTATE_180[b1Blue.startLoc] === b2Red.startLoc &&
    ROTATE_180[b1Blue.endLoc] === b2Red.endLoc &&
    b1Blue.motionType === b2Red.motionType
  );
}

function isMirroredThenSwapped(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red, b2Blue = beat2.blue, b2Red = beat2.red;
  if (!b1Blue?.endLoc || !b2Blue?.endLoc || !b1Red?.endLoc || !b2Red?.endLoc) return false;
  return (
    MIRROR_VERTICAL[b1Red.startLoc] === b2Blue.startLoc &&
    MIRROR_VERTICAL[b1Red.endLoc] === b2Blue.endLoc &&
    b1Red.motionType === b2Blue.motionType &&
    MIRROR_VERTICAL[b1Blue.startLoc] === b2Red.startLoc &&
    MIRROR_VERTICAL[b1Blue.endLoc] === b2Red.endLoc &&
    b1Blue.motionType === b2Red.motionType
  );
}

function isMirroredSwappedInverted(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red, b2Blue = beat2.blue, b2Red = beat2.red;
  if (!b1Blue?.endLoc || !b2Blue?.endLoc || !b1Red?.endLoc || !b2Red?.endLoc) return false;
  return (
    MIRROR_VERTICAL[b1Red.startLoc] === b2Blue.startLoc &&
    MIRROR_VERTICAL[b1Red.endLoc] === b2Blue.endLoc &&
    invertMotionType(b1Red.motionType) === b2Blue.motionType &&
    MIRROR_VERTICAL[b1Blue.startLoc] === b2Red.startLoc &&
    MIRROR_VERTICAL[b1Blue.endLoc] === b2Red.endLoc &&
    invertMotionType(b1Blue.motionType) === b2Red.motionType
  );
}

function isFlippedThenInverted(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red, b2Blue = beat2.blue, b2Red = beat2.red;
  if (!b1Blue?.endLoc || !b2Blue?.endLoc || !b1Red?.endLoc || !b2Red?.endLoc) return false;
  const positionsFlipped =
    FLIP_HORIZONTAL[b1Blue.startLoc] === b2Blue.startLoc &&
    FLIP_HORIZONTAL[b1Blue.endLoc] === b2Blue.endLoc &&
    FLIP_HORIZONTAL[b1Red.startLoc] === b2Red.startLoc &&
    FLIP_HORIZONTAL[b1Red.endLoc] === b2Red.endLoc;
  if (!positionsFlipped) return false;
  return (
    invertMotionType(b1Blue.motionType) === b2Blue.motionType &&
    invertMotionType(b1Red.motionType) === b2Red.motionType
  );
}

function isQuarteredRotatedOnly(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red, b2Blue = beat2.blue, b2Red = beat2.red;
  if (!b1Blue?.endLoc || !b2Blue?.endLoc || !b1Red?.endLoc || !b2Red?.endLoc) return false;
  return (
    ROTATE_90_CCW[b1Blue.startLoc] === b2Blue.startLoc &&
    ROTATE_90_CCW[b1Blue.endLoc] === b2Blue.endLoc &&
    b1Blue.motionType === b2Blue.motionType &&
    ROTATE_90_CCW[b1Red.startLoc] === b2Red.startLoc &&
    ROTATE_90_CCW[b1Red.endLoc] === b2Red.endLoc &&
    b1Red.motionType === b2Red.motionType
  );
}

function isQuarteredRotatedSwapped(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red, b2Blue = beat2.blue, b2Red = beat2.red;
  if (!b1Blue?.endLoc || !b2Blue?.endLoc || !b1Red?.endLoc || !b2Red?.endLoc) return false;
  return (
    ROTATE_90_CCW[b1Red.startLoc] === b2Blue.startLoc &&
    ROTATE_90_CCW[b1Red.endLoc] === b2Blue.endLoc &&
    b1Red.motionType === b2Blue.motionType &&
    ROTATE_90_CCW[b1Blue.startLoc] === b2Red.startLoc &&
    ROTATE_90_CCW[b1Blue.endLoc] === b2Red.endLoc &&
    b1Blue.motionType === b2Red.motionType
  );
}

// ============================================================================
// Beat-Pair Graph Detection (for modular patterns)
// ============================================================================

/**
 * Compare two beats and identify ALL transformations between them
 * Returns array of transformation types
 */
function compareBeatPair(beat1, beat2) {
  const b1Blue = beat1.blue, b1Red = beat1.red;
  const b2Blue = beat2.blue, b2Red = beat2.red;

  if (!b1Blue?.startLoc || !b2Blue?.startLoc || !b1Red?.startLoc || !b2Red?.startLoc) {
    return [];
  }

  const transformations = [];

  // Check if beats are identical (repeated)
  if (
    b1Blue.startLoc === b2Blue.startLoc && b1Blue.endLoc === b2Blue.endLoc &&
    b1Blue.motionType === b2Blue.motionType &&
    b1Red.startLoc === b2Red.startLoc && b1Red.endLoc === b2Red.endLoc &&
    b1Red.motionType === b2Red.motionType
  ) {
    transformations.push("repeated");
    return transformations; // Early return - if repeated, no other transformations apply
  }

  // Check position transformations
  let positionTransform = null;

  // 90° rotation (CCW)
  if (
    ROTATE_90_CCW[b1Blue.startLoc] === b2Blue.startLoc &&
    ROTATE_90_CCW[b1Blue.endLoc] === b2Blue.endLoc &&
    ROTATE_90_CCW[b1Red.startLoc] === b2Red.startLoc &&
    ROTATE_90_CCW[b1Red.endLoc] === b2Red.endLoc
  ) {
    positionTransform = "rotated_90";
  }
  // 180° rotation
  else if (
    ROTATE_180[b1Blue.startLoc] === b2Blue.startLoc &&
    ROTATE_180[b1Blue.endLoc] === b2Blue.endLoc &&
    ROTATE_180[b1Red.startLoc] === b2Red.startLoc &&
    ROTATE_180[b1Red.endLoc] === b2Red.endLoc
  ) {
    positionTransform = "rotated_180";
  }
  // 270° rotation (CCW)
  else if (
    ROTATE_270_CCW[b1Blue.startLoc] === b2Blue.startLoc &&
    ROTATE_270_CCW[b1Blue.endLoc] === b2Blue.endLoc &&
    ROTATE_270_CCW[b1Red.startLoc] === b2Red.startLoc &&
    ROTATE_270_CCW[b1Red.endLoc] === b2Red.endLoc
  ) {
    positionTransform = "rotated_270";
  }
  // Vertical mirror
  else if (
    MIRROR_VERTICAL[b1Blue.startLoc] === b2Blue.startLoc &&
    MIRROR_VERTICAL[b1Blue.endLoc] === b2Blue.endLoc &&
    MIRROR_VERTICAL[b1Red.startLoc] === b2Red.startLoc &&
    MIRROR_VERTICAL[b1Red.endLoc] === b2Red.endLoc
  ) {
    positionTransform = "mirrored";
  }
  // Horizontal flip
  else if (
    FLIP_HORIZONTAL[b1Blue.startLoc] === b2Blue.startLoc &&
    FLIP_HORIZONTAL[b1Blue.endLoc] === b2Blue.endLoc &&
    FLIP_HORIZONTAL[b1Red.startLoc] === b2Red.startLoc &&
    FLIP_HORIZONTAL[b1Red.endLoc] === b2Red.endLoc
  ) {
    positionTransform = "flipped";
  }

  // Check if colors are swapped
  const colorsSwapped =
    b1Blue.startLoc === b2Red.startLoc && b1Blue.endLoc === b2Red.endLoc &&
    b1Red.startLoc === b2Blue.startLoc && b1Red.endLoc === b2Blue.endLoc;

  // Check if motion types are inverted
  const motionInverted =
    invertMotionType(b1Blue.motionType) === b2Blue.motionType &&
    invertMotionType(b1Red.motionType) === b2Red.motionType;

  // Build transformation description
  if (positionTransform) {
    transformations.push(positionTransform);
  }
  if (colorsSwapped) {
    transformations.push("swapped");
  }
  if (motionInverted) {
    transformations.push("inverted");
  }

  return transformations;
}

/**
 * Build a graph of all beat pair relationships
 */
function buildBeatPairGraph(beats) {
  const graph = {};

  for (let i = 0; i < beats.length; i++) {
    const beat1 = beats[i];
    graph[beat1.beatNumber] = {};

    for (let j = 0; j < beats.length; j++) {
      if (i === j) continue;

      const beat2 = beats[j];
      const transformations = compareBeatPair(beat1, beat2);

      if (transformations.length > 0) {
        graph[beat1.beatNumber][beat2.beatNumber] = transformations;
      }
    }
  }

  return graph;
}

/**
 * Group beats by letter
 */
function groupBeatsByLetter(beats) {
  const groups = {};

  for (const beat of beats) {
    if (!groups[beat.letter]) {
      groups[beat.letter] = [];
    }
    groups[beat.letter].push(beat.beatNumber);
  }

  return groups;
}

/**
 * Analyze transformation pattern for a group of beats (same letter)
 */
function analyzeLetterGroupPattern(beatNumbers, graph) {
  if (beatNumbers.length < 2) {
    return { pattern: "single", transformationSequence: [] };
  }

  // Check transformation sequence through the cycle
  const transformationSequence = [];

  for (let i = 0; i < beatNumbers.length - 1; i++) {
    const from = beatNumbers[i];
    const to = beatNumbers[i + 1];

    const transforms = graph[from]?.[to] || [];
    transformationSequence.push({
      from,
      to,
      transformations: transforms,
    });
  }

  // Also check last to first (circular)
  const lastToFirst = graph[beatNumbers[beatNumbers.length - 1]]?.[beatNumbers[0]] || [];
  transformationSequence.push({
    from: beatNumbers[beatNumbers.length - 1],
    to: beatNumbers[0],
    transformations: lastToFirst,
  });

  return {
    pattern: "cycle",
    transformationSequence,
  };
}

/**
 * Detect modular patterns using beat-pair graph approach
 * Only returns modular if letters have NON-CONSECUTIVE occurrences with different patterns
 */
function detectModularPattern(beats) {
  if (beats.length < 2) {
    return null;
  }

  // Build the beat pair graph
  const graph = buildBeatPairGraph(beats);

  // Group beats by letter
  const letterGroups = groupBeatsByLetter(beats);

  // Filter out letters that only appear consecutively (like AA in AABB)
  // These are not independent motifs - they're just repeated letters
  //
  // IMPORTANT: This correctly handles circular boundaries. For example:
  // - If A appears at beats [1, 16] (end of partial wrapping to start),
  //   16 ≠ 1+1, so allConsecutive = false → A is INCLUDED ✓
  // - If A appears at beats [1, 2] (only consecutive occurrence),
  //   2 = 1+1, so allConsecutive = true → A is FILTERED OUT ✓
  // - If A appears at beats [1, 6, 7] (mixed consecutive and gaps),
  //   6 ≠ 1+1, so allConsecutive = false → A is INCLUDED ✓
  const nonConsecutiveLetterGroups = {};
  for (const [letter, beatNumbers] of Object.entries(letterGroups)) {
    if (beatNumbers.length === 1) {
      // Single occurrence - include it
      nonConsecutiveLetterGroups[letter] = beatNumbers;
      continue;
    }

    // Check if all occurrences are consecutive (numerically)
    const sorted = [...beatNumbers].sort((a, b) => a - b);
    let allConsecutive = true;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] !== sorted[i - 1] + 1) {
        allConsecutive = false;
        break;
      }
    }

    // Only include if NOT all consecutive (i.e., letter repeats at different points)
    if (!allConsecutive) {
      nonConsecutiveLetterGroups[letter] = beatNumbers;
    }
  }

  // Need at least 2 letters with non-consecutive occurrences for modular
  if (Object.keys(nonConsecutiveLetterGroups).length < 2) {
    return null;
  }

  // Analyze each letter group's pattern
  const letterPatterns = {};
  for (const [letter, beatNumbers] of Object.entries(nonConsecutiveLetterGroups)) {
    letterPatterns[letter] = analyzeLetterGroupPattern(beatNumbers, graph);
  }

  // Check if different letters have different patterns (= modular)
  const uniquePatterns = new Set();
  for (const [letter, analysis] of Object.entries(letterPatterns)) {
    const patternSig = JSON.stringify(
      analysis.transformationSequence.map(t => t.transformations.sort().join("+"))
    );
    uniquePatterns.add(patternSig);
  }

  const isModular = uniquePatterns.size > 1;

  if (isModular) {
    return {
      isModular: true,
      letterGroups: nonConsecutiveLetterGroups,
      letterPatterns,
      uniquePatternCount: uniquePatterns.size,
    };
  }

  return null;
}

function detectCAPType(sequence) {
  const circular = isCircular(sequence);
  const beats = extractBeats(sequence);

  if (!circular || beats.length < 2) {
    return { capType: null, components: [], transformationIntervals: {} };
  }

  // First, check for modular patterns using beat-pair graph approach
  const modularResult = detectModularPattern(beats);
  if (modularResult && modularResult.isModular) {
    return {
      capType: "modular",
      components: ["modular"],
      transformationIntervals: {},
      modularAnalysis: modularResult,
    };
  }

  // Continue with standard halved/quartered detection for non-modular patterns
  const halfLength = Math.floor(beats.length / 2);
  if (beats.length % 2 !== 0) {
    return { capType: null, components: [], transformationIntervals: {} };
  }

  const results = {
    rotated: { matches: 0, total: halfLength },
    swapped: { matches: 0, total: halfLength },
    mirrored: { matches: 0, total: halfLength },
    flipped: { matches: 0, total: halfLength },
    inverted: { matches: 0, total: halfLength },
    repeated: { matches: 0, total: halfLength },
    rotatedSwapped: { matches: 0, total: halfLength },
    mirroredSwapped: { matches: 0, total: halfLength },
    flippedInverted: { matches: 0, total: halfLength },
    mirroredSwappedInverted: { matches: 0, total: halfLength },
  };

  for (let i = 0; i < halfLength; i++) {
    const beat1 = beats[i];
    const beat2 = beats[i + halfLength];

    if (isRotated(beat1, beat2)) results.rotated.matches++;
    if (isSwapped(beat1, beat2)) results.swapped.matches++;
    if (isMirrored(beat1, beat2)) results.mirrored.matches++;
    if (isFlipped(beat1, beat2)) results.flipped.matches++;
    if (isInverted(beat1, beat2)) results.inverted.matches++;
    if (isRotatedThenSwapped(beat1, beat2)) results.rotatedSwapped.matches++;
    if (isMirroredThenSwapped(beat1, beat2)) results.mirroredSwapped.matches++;
    if (isFlippedThenInverted(beat1, beat2)) results.flippedInverted.matches++;
    if (isMirroredSwappedInverted(beat1, beat2)) results.mirroredSwappedInverted.matches++;
    if (isRepeated(beat1, beat2)) results.repeated.matches++;
  }

  const detectedComponents = [];

  if (results.rotated.matches === halfLength) detectedComponents.push("rotated");
  if (results.swapped.matches === halfLength) detectedComponents.push("swapped");
  if (results.mirrored.matches === halfLength) detectedComponents.push("mirrored");
  if (results.flipped.matches === halfLength) detectedComponents.push("flipped");
  if (results.inverted.matches === halfLength) detectedComponents.push("inverted");
  if (results.repeated.matches === halfLength) detectedComponents.push("repeated");

  // Check compound types
  if (results.rotatedSwapped.matches === halfLength) {
    const swapIsMeaningful = beats.slice(0, halfLength).some((beat) => beat.blue?.motionType !== beat.red?.motionType);
    if (swapIsMeaningful && !detectedComponents.includes("rotated+swapped")) {
      detectedComponents.push("rotated+swapped");
    }
  }
  if (results.mirroredSwapped.matches === halfLength) {
    const swapIsMeaningful = beats.slice(0, halfLength).some((beat) => beat.blue?.motionType !== beat.red?.motionType);
    if (swapIsMeaningful && !detectedComponents.includes("mirrored+swapped")) {
      detectedComponents.push("mirrored+swapped");
    }
  }
  if (results.flippedInverted.matches === halfLength) {
    const flippedIndex = detectedComponents.indexOf("flipped");
    if (flippedIndex !== -1) detectedComponents.splice(flippedIndex, 1);
    detectedComponents.push("flipped+inverted");
  }
  if (results.mirroredSwappedInverted.matches === halfLength) {
    const swapIsMeaningful = beats.slice(0, halfLength).some((beat) => beat.blue?.motionType !== beat.red?.motionType);
    if (swapIsMeaningful) {
      ["mirrored", "swapped", "inverted", "mirrored+swapped", "flipped+inverted"].forEach((c) => {
        const idx = detectedComponents.indexOf(c);
        if (idx !== -1) detectedComponents.splice(idx, 1);
      });
      detectedComponents.push("mirrored+swapped+inverted");
    }
  }

  // Check QUARTERED patterns
  if (beats.length >= 4 && beats.length % 4 === 0) {
    const quarterLength = beats.length / 4;
    let quarteredRotatedSwappedMatches = 0;

    for (let q = 0; q < 3; q++) {
      for (let i = 0; i < quarterLength; i++) {
        const beat1 = beats[q * quarterLength + i];
        const beat2 = beats[(q + 1) * quarterLength + i];
        if (isQuarteredRotatedSwapped(beat1, beat2)) quarteredRotatedSwappedMatches++;
      }
    }

    const totalQuarteredPairs = quarterLength * 3;
    if (quarteredRotatedSwappedMatches === totalQuarteredPairs) {
      const swapIsMeaningful = beats.slice(0, quarterLength).some((beat) => beat.blue?.motionType !== beat.red?.motionType);
      if (swapIsMeaningful) {
        const rotatedIdx = detectedComponents.indexOf("rotated");
        if (rotatedIdx !== -1) detectedComponents.splice(rotatedIdx, 1);
        if (!detectedComponents.includes("rotated+swapped")) detectedComponents.push("rotated+swapped");
      }
    }

    // Check MIXED-SLICE pattern
    const quarterTransitions = [];
    for (let q = 0; q < 4; q++) {
      const qStart = q * quarterLength;
      const qNext = ((q + 1) % 4) * quarterLength;
      const b1 = beats[qStart];
      const b2 = beats[qNext];
      quarterTransitions.push({
        pureRotation: isQuarteredRotatedOnly(b1, b2),
        rotationSwap: isQuarteredRotatedSwapped(b1, b2),
        has90Rotation: isQuarteredRotatedOnly(b1, b2) || isQuarteredRotatedSwapped(b1, b2)
      });
    }

    const allHave90Rotation = quarterTransitions.every(t => t.has90Rotation);
    const someHaveSwap = quarterTransitions.some(t => t.rotationSwap);
    const someArePure = quarterTransitions.some(t => t.pureRotation);

    if (allHave90Rotation && someHaveSwap && someArePure) {
      const rotatedIdx = detectedComponents.indexOf("rotated");
      if (rotatedIdx !== -1) detectedComponents.splice(rotatedIdx, 1);
      if (!detectedComponents.includes("rotated+swapped")) detectedComponents.push("rotated+swapped");
    }
  }

  // Track transformation intervals (halved vs quartered)
  const transformationIntervals = {};

  // Rotation interval: Check if rotation is at ½ (180°) or ¼ (90°)
  if (detectedComponents.includes("rotated") || detectedComponents.includes("rotated+swapped")) {
    // If quartered rotation was detected, it's 90° (quartered)
    // Otherwise if halved rotation matched, it's 180° (halved)
    const hasQuarteredRotation = beats.length >= 4 && beats.length % 4 === 0 && (() => {
      const quarterLength = beats.length / 4;
      for (let i = 0; i < quarterLength; i++) {
        if (!isQuarteredRotatedOnly(beats[i], beats[quarterLength + i]) &&
            !isQuarteredRotatedSwapped(beats[i], beats[quarterLength + i])) {
          return false;
        }
      }
      return true;
    })();
    transformationIntervals.rotation = hasQuarteredRotation ? "quartered" : "halved";
  }

  // Swap interval: Check if swap is at ½ or ¼
  if (detectedComponents.includes("swapped") ||
      detectedComponents.includes("rotated+swapped") ||
      detectedComponents.includes("mirrored+swapped") ||
      detectedComponents.includes("mirrored+swapped+inverted")) {
    // Check if swap happens at quarter boundaries
    const hasQuarteredSwap = beats.length >= 4 && beats.length % 4 === 0 && (() => {
      const quarterLength = beats.length / 4;
      // For quartered swap: beat 1 should swap with beat at quarterLength+1
      for (let i = 0; i < quarterLength; i++) {
        const b1 = beats[i];
        const b2 = beats[quarterLength + i];
        // Check if blue/red swap at quarter boundary
        const swappedAtQuarter =
          b1.blue?.startLoc === b2.red?.startLoc &&
          b1.red?.startLoc === b2.blue?.startLoc;
        if (!swappedAtQuarter) return false;
      }
      return true;
    })();
    transformationIntervals.swap = hasQuarteredSwap ? "quartered" : "halved";
  }

  // Mirror interval
  if (detectedComponents.includes("mirrored") ||
      detectedComponents.includes("mirrored+swapped") ||
      detectedComponents.includes("mirrored+swapped+inverted")) {
    transformationIntervals.mirror = "halved"; // Mirror is typically halved
  }

  // Invert interval
  if (detectedComponents.includes("inverted") ||
      detectedComponents.includes("mirrored+swapped+inverted") ||
      detectedComponents.includes("flipped+inverted")) {
    transformationIntervals.invert = "halved"; // Invert is typically halved
  }

  // Map to CAP type
  let capType = null;
  if (detectedComponents.length > 0) {
    const sorted = [...detectedComponents].sort().join("_");
    const typeMap = {
      rotated: "rotated",
      swapped: "swapped",
      mirrored: "mirrored",
      flipped: "flipped",
      inverted: "inverted",
      repeated: "repeated",
      "rotated_swapped": "rotated_swapped",
      "rotated+swapped": "rotated_swapped",
      "mirrored_swapped": "mirrored_swapped",
      "mirrored+swapped": "mirrored_swapped",
      "flipped_inverted": "flipped_inverted",
      "flipped+inverted": "flipped_inverted",
      "mirrored+swapped+inverted": "mirrored_swapped_inverted",
    };
    capType = typeMap[sorted] || sorted;
  }

  return { capType, components: detectedComponents, transformationIntervals };
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const applyMode = args.includes("--apply");
  const forceMode = args.includes("--force");
  const wordArg = args.find((a) => a.startsWith("--word="));
  const wordIndex = args.indexOf("--word");
  const singleWord = wordArg
    ? wordArg.split("=")[1]
    : (wordIndex >= 0 ? args[wordIndex + 1] : null);

  console.log("=".repeat(70));
  const modeLabel = applyMode
    ? (forceMode ? "AUTO-LABEL CAP SEQUENCES (APPLY + FORCE MODE)" : "AUTO-LABEL CAP SEQUENCES (APPLY MODE)")
    : "AUTO-LABEL CAP SEQUENCES (DRY RUN)";
  console.log(modeLabel);
  console.log("=".repeat(70));
  console.log();

  // Load sequence index
  const sequenceIndexPath = path.join(__dirname, "..", "static", "data", "sequence-index.json");
  const sequenceIndex = JSON.parse(fs.readFileSync(sequenceIndexPath, "utf8"));
  const sequences = sequenceIndex.sequences;
  console.log(`Loaded ${sequences.length} sequences from sequence-index.json`);

  // Get existing labels
  const snapshot = await db.collection("cap-labels").get();
  const existingLabels = new Set();
  snapshot.forEach((doc) => existingLabels.add(doc.id));
  console.log(`Found ${existingLabels.size} existing labels in Firebase`);

  // Filter to circular sequences (optionally skip already-labeled check with --force)
  let toLabel = sequences.filter((s) => {
    if (!s.fullMetadata?.sequence) return false;
    if (!forceMode && existingLabels.has(s.word)) return false;
    return isCircular(s);
  });

  if (singleWord) {
    toLabel = sequences.filter((s) => s.word === singleWord);
    if (toLabel.length === 0) {
      console.log(`\nSequence "${singleWord}" not found`);
      process.exit(1);
    }
  }

  console.log(`\nSequences to label: ${toLabel.length}`);
  console.log();

  // Group by detected type for summary
  const byType = {};
  const results = [];

  for (const seq of toLabel) {
    const detected = detectCAPType(seq);
    const typeKey = detected.capType || "none";

    if (!byType[typeKey]) byType[typeKey] = [];
    byType[typeKey].push(seq.word);

    results.push({
      word: seq.word,
      beatCount: extractBeats(seq).length,
      capType: detected.capType,
      components: detected.components,
      transformationIntervals: detected.transformationIntervals,
    });
  }

  // Print summary by type
  console.log("=".repeat(70));
  console.log("DETECTION SUMMARY BY TYPE");
  console.log("=".repeat(70));
  Object.entries(byType)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([type, words]) => {
      console.log(`\n${type.toUpperCase()} (${words.length}):`);
      console.log(`  ${words.slice(0, 20).join(", ")}${words.length > 20 ? "..." : ""}`);
    });

  // Apply if requested
  if (applyMode && !singleWord) {
    console.log();
    console.log("=".repeat(70));
    console.log("APPLYING TO FIREBASE...");
    console.log("=".repeat(70));

    const batch = db.batch();
    let batchCount = 0;
    const BATCH_LIMIT = 500;

    for (const result of results) {
      const docRef = db.collection("cap-labels").doc(result.word);
      // Build designation object, only including transformationIntervals if present
      const designation = {
        components: result.components,
        capType: result.capType,
      };
      if (Object.keys(result.transformationIntervals || {}).length > 0) {
        designation.transformationIntervals = result.transformationIntervals;
      }

      const labelData = {
        word: result.word,
        designations: result.components.length > 0 ? [designation] : [],
        isFreeform: result.components.length === 0,
        needsVerification: true,
        autoLabeled: true,
        labeledAt: new Date().toISOString(),
        notes: `Auto-labeled by detection algorithm. Detected: ${result.components.join("+") || "none"}${
          Object.keys(result.transformationIntervals || {}).length > 0
            ? ` (Intervals: ${Object.entries(result.transformationIntervals).map(([k,v]) => `${k}=${v}`).join(", ")})`
            : ""
        }`,
      };

      batch.set(docRef, labelData);
      batchCount++;

      if (batchCount >= BATCH_LIMIT) {
        await batch.commit();
        console.log(`Committed batch of ${batchCount} labels`);
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} labels`);
    }

    console.log(`\nTotal labels written: ${results.length}`);
  } else if (singleWord) {
    console.log();
    console.log("=".repeat(70));
    console.log(`SINGLE WORD RESULT: ${singleWord}`);
    console.log("=".repeat(70));
    const result = results[0];
    console.log(`  Beat count: ${result.beatCount}`);
    console.log(`  CAP Type: ${result.capType || "none"}`);
    console.log(`  Components: ${result.components.join("+") || "none"}`);
    if (Object.keys(result.transformationIntervals || {}).length > 0) {
      console.log(`  Intervals: ${Object.entries(result.transformationIntervals).map(([k,v]) => `${k}=${v}`).join(", ")}`);
    }
    console.log(`  Already labeled: ${existingLabels.has(singleWord) ? "YES" : "NO"}`);
  } else {
    console.log();
    console.log("=".repeat(70));
    console.log("DRY RUN COMPLETE");
    console.log("=".repeat(70));
    console.log(`\nRun with --apply to write ${results.length} labels to Firebase`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
