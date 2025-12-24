import { injectable } from "inversify";
import type { SequenceEntry } from "../../domain/models/sequence-models";
import type {
  ICAPDetectionService,
  CAPDetectionResult,
} from "../contracts/ICAPDetectionService";
import type {
  CandidateDesignation,
  BeatPairGroups,
  TransformationIntervals,
} from "../../domain/models/label-models";
import type { BeatPairRelationship } from "../contracts/IBeatPairAnalysisService";
import type { ComponentId } from "../../domain/constants/cap-components";

// ============================================================================
// Position Transformation Maps
// ============================================================================

const ROTATE_180: Record<string, string> = {
  n: "s", s: "n", e: "w", w: "e",
  ne: "sw", sw: "ne", nw: "se", se: "nw",
};

const ROTATE_90_CCW: Record<string, string> = {
  n: "w", w: "s", s: "e", e: "n",
  ne: "nw", nw: "sw", sw: "se", se: "ne",
};

const ROTATE_90_CW: Record<string, string> = {
  n: "e", e: "s", s: "w", w: "n",
  ne: "se", se: "sw", sw: "nw", nw: "ne",
};

const MIRROR_VERTICAL: Record<string, string> = {
  n: "n", s: "s", e: "w", w: "e",
  ne: "nw", nw: "ne", se: "sw", sw: "se",
};

const FLIP_HORIZONTAL: Record<string, string> = {
  n: "s", s: "n", e: "e", w: "w",
  ne: "se", se: "ne", nw: "sw", sw: "nw",
};

// ============================================================================
// Transformation Priority (simpler explanations first)
// ============================================================================

const TRANSFORMATION_PRIORITY = [
  // ==============================================
  // SAME-COLOR TRANSFORMATIONS (highest priority)
  // These are simpler explanations - both props do the same thing
  // ==============================================

  // Pure rotations (same colors)
  "rotated_90_cw",
  "rotated_90_ccw",
  "rotated_180",
  // Rotation + inversion (same colors)
  "rotated_90_cw_inverted",
  "rotated_90_ccw_inverted",
  "rotated_180_inverted",
  // Flip/mirror (same colors)
  "flipped",
  "flipped_inverted",
  "mirrored",
  "mirrored_inverted",
  // Pure inversion (same colors, same positions)
  "inverted",

  // ==============================================
  // SWAPPED TRANSFORMATIONS (lower priority)
  // More complex - props swap roles
  // ==============================================

  // Rotation + swap
  "rotated_90_cw_swapped",
  "rotated_90_ccw_swapped",
  "rotated_180_swapped",
  // Triple compound (rotation + swap + invert)
  "rotated_90_cw_swapped_inverted",
  "rotated_90_ccw_swapped_inverted",
  "rotated_180_swapped_inverted",
  // Mirror + swap
  "mirrored_swapped",
  // Pure swap
  "swapped",

  // ==============================================
  // IDENTITY
  // ==============================================
  "repeated",
];

// ============================================================================
// Internal Types
// ============================================================================

interface ExtractedBeat {
  beatNumber: number;
  letter: string;
  startPos: string;
  endPos: string;
  blue: {
    startLoc: string;
    endLoc: string;
    motionType: string;
    propRotDir: string;
  };
  red: {
    startLoc: string;
    endLoc: string;
    motionType: string;
    propRotDir: string;
  };
}

interface InternalBeatPair {
  keyBeat: number;
  correspondingBeat: number;
  rawTransformations: string[];
  detectedTransformations: string[];
}

interface CandidateInfo {
  transformation: string;
  components: ComponentId[];
  intervals: TransformationIntervals;
  rotationDirection: "cw" | "ccw" | null;
  label: string;
  description: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

function invertMotionType(type: string): string {
  if (type === "pro") return "anti";
  if (type === "anti") return "pro";
  return type;
}

/**
 * Invert rotation direction (cw ↔ ccw)
 * "Inverted" in CAP terminology means the rotation direction is flipped
 */
function invertRotDir(dir: string): string {
  if (dir === "cw") return "ccw";
  if (dir === "ccw") return "cw";
  return dir; // noRotation stays the same
}

/**
 * Check if rotation directions indicate an "inversion" for ROTATION transformations.
 * For rotations (90°, 180°), rotation direction should naturally STAY THE SAME.
 * Returns true if rotation direction changed (unexpected = inverted).
 */
function areRotDirsInvertedForRotation(
  b1BluePropRotDir: string,
  b1RedPropRotDir: string,
  b2BluePropRotDir: string,
  b2RedPropRotDir: string
): boolean {
  const b1BlueHasRot = b1BluePropRotDir && b1BluePropRotDir !== "norotation";
  const b1RedHasRot = b1RedPropRotDir && b1RedPropRotDir !== "norotation";
  const b2BlueHasRot = b2BluePropRotDir && b2BluePropRotDir !== "norotation";
  const b2RedHasRot = b2RedPropRotDir && b2RedPropRotDir !== "norotation";

  // For rotations: "inverted" means rotation direction CHANGED (when it should stay same)
  let blueInverted = false;
  let redInverted = false;

  if (b1BlueHasRot && b2BlueHasRot) {
    // For rotation, same rot dir is expected. Different = inverted.
    blueInverted = b1BluePropRotDir !== b2BluePropRotDir;
  }
  if (b1RedHasRot && b2RedHasRot) {
    redInverted = b1RedPropRotDir !== b2RedPropRotDir;
  }

  // Consider inverted if at least one color shows inversion
  if (blueInverted && redInverted) return true;
  if (blueInverted && !b1RedHasRot && !b2RedHasRot) return true;
  if (redInverted && !b1BlueHasRot && !b2BlueHasRot) return true;

  return false;
}

/**
 * Check if rotation directions indicate an "inversion" for MIRROR/FLIP transformations.
 * For mirror/flip, rotation direction should naturally FLIP (cw↔ccw) due to reflection.
 * Returns true if rotation direction stayed the SAME (unexpected = inverted).
 */
function areRotDirsInvertedForMirrorFlip(
  b1BluePropRotDir: string,
  b1RedPropRotDir: string,
  b2BluePropRotDir: string,
  b2RedPropRotDir: string
): boolean {
  const b1BlueHasRot = b1BluePropRotDir && b1BluePropRotDir !== "norotation";
  const b1RedHasRot = b1RedPropRotDir && b1RedPropRotDir !== "norotation";
  const b2BlueHasRot = b2BluePropRotDir && b2BluePropRotDir !== "norotation";
  const b2RedHasRot = b2RedPropRotDir && b2RedPropRotDir !== "norotation";

  // For mirror/flip: rotation direction should naturally flip.
  // "Inverted" means it STAYED THE SAME (someone counteracted the natural flip)
  let blueInverted = false;
  let redInverted = false;

  if (b1BlueHasRot && b2BlueHasRot) {
    // For mirror/flip, different rot dir is expected. Same = inverted.
    blueInverted = b1BluePropRotDir === b2BluePropRotDir;
  }
  if (b1RedHasRot && b2RedHasRot) {
    redInverted = b1RedPropRotDir === b2RedPropRotDir;
  }

  // Consider inverted if at least one color shows unexpected same direction
  if (blueInverted && redInverted) return true;
  if (blueInverted && !b1RedHasRot && !b2RedHasRot) return true;
  if (redInverted && !b1BlueHasRot && !b2BlueHasRot) return true;

  return false;
}

/**
 * Check if a beat pair has rotation data that can be used to determine inversion.
 * Returns true if at least one color in both beats has rotation direction.
 */
function hasRotationData(
  b1BluePropRotDir: string,
  b1RedPropRotDir: string,
  b2BluePropRotDir: string,
  b2RedPropRotDir: string
): boolean {
  const b1BlueHasRot = Boolean(b1BluePropRotDir && b1BluePropRotDir !== "norotation");
  const b1RedHasRot = Boolean(b1RedPropRotDir && b1RedPropRotDir !== "norotation");
  const b2BlueHasRot = Boolean(b2BluePropRotDir && b2BluePropRotDir !== "norotation");
  const b2RedHasRot = Boolean(b2RedPropRotDir && b2RedPropRotDir !== "norotation");

  // Has rotation data if at least one color has rotation in BOTH beats
  return (b1BlueHasRot && b2BlueHasRot) || (b1RedHasRot && b2RedHasRot);
}

function extractBeats(sequence: SequenceEntry): ExtractedBeat[] {
  const raw = sequence.fullMetadata?.sequence;
  if (!raw) return [];

  return raw
    .filter((b): b is typeof b & { beat: number } => typeof b.beat === "number" && b.beat >= 1)
    .map((b) => ({
      beatNumber: b.beat,
      letter: b.letter || "",
      startPos: b.startPos || "",
      endPos: b.endPos || "",
      blue: {
        startLoc: b.blueAttributes?.startLoc?.toLowerCase() || "",
        endLoc: b.blueAttributes?.endLoc?.toLowerCase() || "",
        motionType: b.blueAttributes?.motionType?.toLowerCase() || "",
        propRotDir: b.blueAttributes?.propRotDir?.toLowerCase() || "",
      },
      red: {
        startLoc: b.redAttributes?.startLoc?.toLowerCase() || "",
        endLoc: b.redAttributes?.endLoc?.toLowerCase() || "",
        motionType: b.redAttributes?.motionType?.toLowerCase() || "",
        propRotDir: b.redAttributes?.propRotDir?.toLowerCase() || "",
      },
    }));
}

/**
 * Compare two beats and identify ALL transformations between them
 */
function compareBeatPair(beat1: ExtractedBeat, beat2: ExtractedBeat): string[] {
  const b1Blue = beat1.blue, b1Red = beat1.red;
  const b2Blue = beat2.blue, b2Red = beat2.red;

  if (!b1Blue?.startLoc || !b2Blue?.startLoc || !b1Red?.startLoc || !b2Red?.startLoc) {
    return [];
  }

  const transformations: string[] = [];

  // Check if beats are identical (repeated)
  const isRepeated =
    b1Blue.startLoc === b2Blue.startLoc && b1Blue.endLoc === b2Blue.endLoc &&
    b1Blue.motionType === b2Blue.motionType &&
    b1Red.startLoc === b2Red.startLoc && b1Red.endLoc === b2Red.endLoc &&
    b1Red.motionType === b2Red.motionType;

  if (isRepeated) {
    transformations.push("repeated");
  }

  // Position checks for swapped colors
  const positions180Swapped =
    ROTATE_180[b1Red.startLoc] === b2Blue.startLoc &&
    ROTATE_180[b1Red.endLoc] === b2Blue.endLoc &&
    ROTATE_180[b1Blue.startLoc] === b2Red.startLoc &&
    ROTATE_180[b1Blue.endLoc] === b2Red.endLoc;

  const positions90CCWSwapped =
    ROTATE_90_CCW[b1Red.startLoc] === b2Blue.startLoc &&
    ROTATE_90_CCW[b1Red.endLoc] === b2Blue.endLoc &&
    ROTATE_90_CCW[b1Blue.startLoc] === b2Red.startLoc &&
    ROTATE_90_CCW[b1Blue.endLoc] === b2Red.endLoc;

  const positions90CWSwapped =
    ROTATE_90_CW[b1Red.startLoc] === b2Blue.startLoc &&
    ROTATE_90_CW[b1Red.endLoc] === b2Blue.endLoc &&
    ROTATE_90_CW[b1Blue.startLoc] === b2Red.startLoc &&
    ROTATE_90_CW[b1Blue.endLoc] === b2Red.endLoc;

  // Rotation direction checks for swapped colors
  // For ROTATIONS: same rot dir is expected, different = inverted
  const rotDirSameSwapped =
    b1Red.propRotDir === b2Blue.propRotDir &&
    b1Blue.propRotDir === b2Red.propRotDir;

  const rotDirInvertedSwappedForRotation = areRotDirsInvertedForRotation(
    b1Red.propRotDir, b1Blue.propRotDir,  // swapped: red→blue, blue→red
    b2Blue.propRotDir, b2Red.propRotDir
  );

  // Compound: rotation + swap (rotation expects same rot dir)
  if (positions180Swapped && rotDirSameSwapped) {
    transformations.push("rotated_180_swapped");
  }
  if (positions180Swapped && rotDirInvertedSwappedForRotation) {
    transformations.push("rotated_180_swapped_inverted");
  }
  if (positions90CCWSwapped && rotDirSameSwapped) {
    transformations.push("rotated_90_ccw_swapped");
  }
  if (positions90CCWSwapped && rotDirInvertedSwappedForRotation) {
    transformations.push("rotated_90_ccw_swapped_inverted");
  }
  if (positions90CWSwapped && rotDirSameSwapped) {
    transformations.push("rotated_90_cw_swapped");
  }
  if (positions90CWSwapped && rotDirInvertedSwappedForRotation) {
    transformations.push("rotated_90_cw_swapped_inverted");
  }

  // Mirrored + swapped
  const isMirroredSwapped =
    MIRROR_VERTICAL[b1Red.startLoc] === b2Blue.startLoc &&
    MIRROR_VERTICAL[b1Red.endLoc] === b2Blue.endLoc &&
    b1Red.motionType === b2Blue.motionType &&
    MIRROR_VERTICAL[b1Blue.startLoc] === b2Red.startLoc &&
    MIRROR_VERTICAL[b1Blue.endLoc] === b2Red.endLoc &&
    b1Blue.motionType === b2Red.motionType;

  if (isMirroredSwapped) {
    transformations.push("mirrored_swapped");
  }

  // Position checks for same colors
  const positions90CCW =
    ROTATE_90_CCW[b1Blue.startLoc] === b2Blue.startLoc &&
    ROTATE_90_CCW[b1Blue.endLoc] === b2Blue.endLoc &&
    ROTATE_90_CCW[b1Red.startLoc] === b2Red.startLoc &&
    ROTATE_90_CCW[b1Red.endLoc] === b2Red.endLoc;

  const positions180 =
    ROTATE_180[b1Blue.startLoc] === b2Blue.startLoc &&
    ROTATE_180[b1Blue.endLoc] === b2Blue.endLoc &&
    ROTATE_180[b1Red.startLoc] === b2Red.startLoc &&
    ROTATE_180[b1Red.endLoc] === b2Red.endLoc;

  const positions90CW =
    ROTATE_90_CW[b1Blue.startLoc] === b2Blue.startLoc &&
    ROTATE_90_CW[b1Blue.endLoc] === b2Blue.endLoc &&
    ROTATE_90_CW[b1Red.startLoc] === b2Red.startLoc &&
    ROTATE_90_CW[b1Red.endLoc] === b2Red.endLoc;

  // Rotation direction checks for same colors
  // For ROTATIONS: same rot dir is expected, different = inverted
  const rotDirSameColors =
    b1Blue.propRotDir === b2Blue.propRotDir &&
    b1Red.propRotDir === b2Red.propRotDir;

  const rotDirInvertedForRotation = areRotDirsInvertedForRotation(
    b1Blue.propRotDir, b1Red.propRotDir,
    b2Blue.propRotDir, b2Red.propRotDir
  );

  // Check if we have rotation data to determine inversion
  const canDetermineInversion = hasRotationData(
    b1Blue.propRotDir, b1Red.propRotDir,
    b2Blue.propRotDir, b2Red.propRotDir
  );

  // Pure rotations (rotation expects same rot dir)
  // When we can't determine inversion (noRotation), push BOTH variants
  // so this beat pair is compatible with either in contextual grouping
  if (positions90CCW) {
    if (!canDetermineInversion) {
      // Can't determine inversion - compatible with both
      transformations.push("rotated_90_ccw");
      transformations.push("rotated_90_ccw_inverted");
    } else if (rotDirSameColors) {
      transformations.push("rotated_90_ccw");
    } else if (rotDirInvertedForRotation) {
      transformations.push("rotated_90_ccw_inverted");
    }
  }
  if (positions180) {
    if (!canDetermineInversion) {
      // Can't determine inversion - compatible with both
      transformations.push("rotated_180");
      transformations.push("rotated_180_inverted");
    } else if (rotDirSameColors) {
      transformations.push("rotated_180");
    } else if (rotDirInvertedForRotation) {
      transformations.push("rotated_180_inverted");
    }
  }
  if (positions90CW) {
    if (!canDetermineInversion) {
      // Can't determine inversion - compatible with both
      transformations.push("rotated_90_cw");
      transformations.push("rotated_90_cw_inverted");
    } else if (rotDirSameColors) {
      transformations.push("rotated_90_cw");
    } else if (rotDirInvertedForRotation) {
      transformations.push("rotated_90_cw_inverted");
    }
  }

  // Mirror (same colors)
  const positionsMirrored =
    MIRROR_VERTICAL[b1Blue.startLoc] === b2Blue.startLoc &&
    MIRROR_VERTICAL[b1Blue.endLoc] === b2Blue.endLoc &&
    MIRROR_VERTICAL[b1Red.startLoc] === b2Red.startLoc &&
    MIRROR_VERTICAL[b1Red.endLoc] === b2Red.endLoc;

  // For MIRROR/FLIP: rotation direction naturally FLIPS due to reflection.
  // "Inverted" means rot dir stayed SAME (someone counteracted the natural flip)
  const rotDirInvertedForMirrorFlip = areRotDirsInvertedForMirrorFlip(
    b1Blue.propRotDir, b1Red.propRotDir,
    b2Blue.propRotDir, b2Red.propRotDir
  );

  // Mirror: rot dir DIFFERENT is expected (plain mirrored), SAME is inverted
  // When we can't determine (noRotation), push both for contextual grouping
  if (positionsMirrored) {
    if (!canDetermineInversion) {
      transformations.push("mirrored");
      transformations.push("mirrored_inverted");
    } else if (!rotDirInvertedForMirrorFlip) {
      transformations.push("mirrored");
    } else {
      transformations.push("mirrored_inverted");
    }
  }

  // Flip
  const positionsFlipped =
    FLIP_HORIZONTAL[b1Blue.startLoc] === b2Blue.startLoc &&
    FLIP_HORIZONTAL[b1Blue.endLoc] === b2Blue.endLoc &&
    FLIP_HORIZONTAL[b1Red.startLoc] === b2Red.startLoc &&
    FLIP_HORIZONTAL[b1Red.endLoc] === b2Red.endLoc;

  // Flip: rot dir DIFFERENT is expected (plain flipped), SAME is inverted
  // When we can't determine (noRotation), push both for contextual grouping
  if (positionsFlipped) {
    if (!canDetermineInversion) {
      transformations.push("flipped");
      transformations.push("flipped_inverted");
    } else if (!rotDirInvertedForMirrorFlip) {
      transformations.push("flipped");
    } else {
      transformations.push("flipped_inverted");
    }
  }

  // Swapped only (no position change)
  const colorsSwapped =
    b1Blue.startLoc === b2Red.startLoc && b1Blue.endLoc === b2Red.endLoc &&
    b1Red.startLoc === b2Blue.startLoc && b1Red.endLoc === b2Blue.endLoc;

  if (colorsSwapped && !transformations.includes("swapped")) {
    transformations.push("swapped");
  }

  // Inverted only (same positions, rotation direction changed)
  // This follows rotation logic: same rot dir is expected for same positions,
  // so different rot dir = inverted
  const positionsSame =
    b1Blue.startLoc === b2Blue.startLoc && b1Blue.endLoc === b2Blue.endLoc &&
    b1Red.startLoc === b2Red.startLoc && b1Red.endLoc === b2Red.endLoc;

  if (positionsSame && rotDirInvertedForRotation) {
    transformations.push("inverted");
  }

  return transformations;
}

/**
 * Generate beat-pair relationships for halved sequences
 */
function generateHalvedBeatPairs(beats: ExtractedBeat[]): InternalBeatPair[] {
  if (beats.length < 2 || beats.length % 2 !== 0) return [];

  const halfLength = beats.length / 2;
  const beatPairs: InternalBeatPair[] = [];

  for (let i = 0; i < halfLength; i++) {
    const beat1 = beats[i]!;
    const beat2 = beats[halfLength + i]!;
    const rawTransformations = compareBeatPair(beat1, beat2);
    const formattedTransformations = formatBeatPairTransformations(rawTransformations);

    beatPairs.push({
      keyBeat: beat1.beatNumber,
      correspondingBeat: beat2.beatNumber,
      rawTransformations,
      detectedTransformations: formattedTransformations.length > 0 ? formattedTransformations : ["UNKNOWN"],
    });
  }

  return beatPairs;
}

/**
 * Generate beat-pair relationships for quartered sequences
 */
function generateQuarteredBeatPairs(beats: ExtractedBeat[]): InternalBeatPair[] {
  if (beats.length < 4 || beats.length % 4 !== 0) return [];

  const quarterLength = beats.length / 4;
  const beatPairs: InternalBeatPair[] = [];

  for (let i = 0; i < quarterLength * 3; i++) {
    const beat1 = beats[i]!;
    const beat2 = beats[(i + quarterLength) % beats.length]!;
    const rawTransformations = compareBeatPair(beat1, beat2);
    const formattedTransformations = formatBeatPairTransformations(rawTransformations);

    beatPairs.push({
      keyBeat: beat1.beatNumber,
      correspondingBeat: beat2.beatNumber,
      rawTransformations,
      detectedTransformations: formattedTransformations.length > 0 ? formattedTransformations : ["UNKNOWN"],
    });
  }

  return beatPairs;
}

/**
 * Find all common transformations shared by ALL beat pairs
 */
function findAllCommonTransformations(beatPairs: InternalBeatPair[]): string[] {
  if (beatPairs.length === 0) return [];

  const allTransformations = beatPairs.map((pair) => new Set(pair.rawTransformations || []));
  const firstSet = allTransformations[0];
  if (!firstSet) return [];

  const common = [...firstSet].filter((t) =>
    allTransformations.every((set) => set.has(t))
  );

  return common.sort((a, b) => {
    const priorityA = TRANSFORMATION_PRIORITY.indexOf(a);
    const priorityB = TRANSFORMATION_PRIORITY.indexOf(b);
    return (priorityA === -1 ? 999 : priorityA) - (priorityB === -1 ? 999 : priorityB);
  });
}

/**
 * Format raw transformations into human-readable strings.
 *
 * When both a base transformation and its inverted variant are present
 * (e.g., "rotated_180" and "rotated_180_inverted"), prefer the inverted one.
 * This happens when noRotation→noRotation, where both are equally valid
 * (inversion of 0 turns = 0 turns), but inverted is more specific.
 */
function formatBeatPairTransformations(rawTransformations: string[]): string[] {
  if (rawTransformations.length === 0) return [];

  // When both base and inverted variants are present, prefer inverted (more specific)
  // This handles noRotation cases where both are equally valid
  const transformationSet = new Set(rawTransformations);
  const preferInverted = [
    { base: "rotated_180", inverted: "rotated_180_inverted" },
    { base: "rotated_90_cw", inverted: "rotated_90_cw_inverted" },
    { base: "rotated_90_ccw", inverted: "rotated_90_ccw_inverted" },
    { base: "flipped", inverted: "flipped_inverted" },
    { base: "mirrored", inverted: "mirrored_inverted" },
  ];

  // Remove base variants when inverted variant is also present
  const filtered = rawTransformations.filter((t) => {
    for (const pair of preferInverted) {
      if (t === pair.base && transformationSet.has(pair.inverted)) {
        return false; // Remove base, keep inverted
      }
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const priorityA = TRANSFORMATION_PRIORITY.indexOf(a);
    const priorityB = TRANSFORMATION_PRIORITY.indexOf(b);
    return (priorityA === -1 ? 999 : priorityA) - (priorityB === -1 ? 999 : priorityB);
  });

  const first = sorted[0];
  if (!first) return [];

  let primary = first.toUpperCase();
  // Format compound transformations
  primary = primary.replace(/ROTATED_90_CCW_SWAPPED_INVERTED/, "ROTATED_90_CCW+SWAPPED+INVERTED");
  primary = primary.replace(/ROTATED_90_CW_SWAPPED_INVERTED/, "ROTATED_90_CW+SWAPPED+INVERTED");
  primary = primary.replace(/ROTATED_180_SWAPPED_INVERTED/, "ROTATED_180+SWAPPED+INVERTED");
  primary = primary.replace(/ROTATED_90_CCW_INVERTED/, "ROTATED_90_CCW+INVERTED");
  primary = primary.replace(/ROTATED_90_CW_INVERTED/, "ROTATED_90_CW+INVERTED");
  primary = primary.replace(/ROTATED_180_INVERTED/, "ROTATED_180+INVERTED");
  primary = primary.replace(/ROTATED_90_CCW_SWAPPED/, "ROTATED_90_CCW+SWAPPED");
  primary = primary.replace(/ROTATED_90_CW_SWAPPED/, "ROTATED_90_CW+SWAPPED");
  primary = primary.replace(/ROTATED_180_SWAPPED/, "ROTATED_180+SWAPPED");
  primary = primary.replace(/FLIPPED_INVERTED/, "FLIPPED+INVERTED");
  primary = primary.replace(/MIRRORED_INVERTED/, "MIRRORED+INVERTED");
  primary = primary.replace(/MIRRORED_SWAPPED/, "MIRRORED+SWAPPED");
  primary = primary.replace(/_/g, " ");

  return [primary];
}

/**
 * Derive components from a transformation pattern
 */
function deriveComponentsFromPattern(pattern: string): ComponentId[] {
  const components: ComponentId[] = [];
  const upper = pattern.toUpperCase();

  if (upper.includes("INVERTED") || upper.includes("INV")) {
    components.push("inverted");
  }
  if (upper.includes("ROTATED") || upper.includes("ROT")) {
    components.push("rotated");
  }
  if (upper.includes("SWAPPED") || upper.includes("SWAP") || upper.match(/\bSW\b/)) {
    components.push("swapped");
  }
  if (upper.includes("MIRRORED") || upper.includes("MIRROR")) {
    components.push("mirrored");
  }
  if (upper.includes("FLIPPED") || upper.includes("FLIP")) {
    components.push("flipped");
  }
  if (upper.includes("REPEATED") || upper === "SAME") {
    components.push("repeated");
  }

  return components;
}

/**
 * Extract rotation direction from a transformation pattern
 */
function extractRotationDirection(pattern: string): "cw" | "ccw" | null {
  const upper = pattern.toUpperCase();
  if (upper.includes("CCW")) return "ccw";
  if (upper.includes("CW")) return "cw";
  return null;
}

/**
 * Detect rotation direction for quartered sequences
 */
function detectRotationDirection(beats: ExtractedBeat[]): "cw" | "ccw" | null {
  if (beats.length < 4 || beats.length % 4 !== 0) return null;

  const quarterLength = beats.length / 4;
  const b0 = beats[0];
  const b1 = beats[quarterLength];
  const b2 = beats[quarterLength * 2];
  const b3 = beats[quarterLength * 3];

  if (!b0 || !b1 || !b2 || !b3) return null;

  const quarterBeats = [b0, b1, b2, b3];
  const blueStartLocs = quarterBeats.map((b) => b.blue?.startLoc);

  let ccwMatches = 0;
  let cwMatches = 0;

  for (let i = 0; i < 4; i++) {
    const current = blueStartLocs[i];
    const next = blueStartLocs[(i + 1) % 4];
    if (!current || !next) continue;

    if (ROTATE_90_CCW[current] === next) ccwMatches++;
    if (ROTATE_90_CW[current] === next) cwMatches++;
  }

  if (ccwMatches > cwMatches && ccwMatches >= 2) return "ccw";
  if (cwMatches > ccwMatches && cwMatches >= 2) return "cw";

  return null;
}

/**
 * Format a human-readable description for a candidate designation
 */
function formatCandidateDescription(transformation: string, _direction: "cw" | "ccw" | null): string {
  const upper = transformation.toUpperCase();

  // Triple compound
  if (upper.includes("ROTATED_90") && upper.includes("SWAPPED") && upper.includes("INVERTED")) {
    const dir = upper.includes("CCW") ? "CCW" : upper.includes("CW") ? "CW" : "";
    return `Rotated 90° ${dir} + Swapped + Inverted`;
  }
  if (upper.includes("ROTATED_180") && upper.includes("SWAPPED") && upper.includes("INVERTED")) {
    return "Rotated 180° + Swapped + Inverted";
  }

  // Double compound: rotation + invert
  if (upper.includes("ROTATED_90") && upper.includes("INVERTED") && !upper.includes("SWAPPED")) {
    const dir = upper.includes("CCW") ? "CCW" : upper.includes("CW") ? "CW" : "";
    return `Rotated 90° ${dir} + Inverted`;
  }
  if (upper.includes("ROTATED_180") && upper.includes("INVERTED") && !upper.includes("SWAPPED")) {
    return "Rotated 180° + Inverted";
  }

  // Double compound: rotation + swap
  if (upper.includes("ROTATED_90") && upper.includes("SWAPPED")) {
    const dir = upper.includes("CCW") ? "CCW" : upper.includes("CW") ? "CW" : "";
    return `Rotated 90° ${dir} + Swapped`;
  }
  if (upper.includes("ROTATED_180") && upper.includes("SWAPPED")) {
    return "Rotated 180° + Swapped";
  }

  // Pure rotations
  if (upper.includes("ROTATED_90")) {
    const dir = upper.includes("CCW") ? "CCW" : upper.includes("CW") ? "CW" : "";
    return `Rotated 90° ${dir}`;
  }
  if (upper.includes("ROTATED_180")) {
    return "Rotated 180°";
  }

  // Other
  if (upper.includes("MIRRORED") && upper.includes("SWAPPED")) return "Mirrored + Swapped";
  if (upper.includes("MIRRORED") && upper.includes("INVERTED")) return "Mirrored + Inverted";
  if (upper.includes("MIRRORED")) return "Mirrored";
  if (upper.includes("FLIPPED") && upper.includes("INVERTED")) return "Flipped + Inverted";
  if (upper.includes("FLIPPED")) return "Flipped";
  if (upper.includes("SWAPPED")) return "Swapped";
  if (upper.includes("INVERTED")) return "Inverted";

  return transformation.replace(/_/g, " ");
}

/**
 * Build candidate designations from common transformations
 */
function buildCandidateDesignations(
  allCommon: string[],
  interval: "halved" | "quartered",
  rotationDirection: "cw" | "ccw" | null
): CandidateInfo[] {
  const candidates: CandidateInfo[] = [];
  const seen = new Set<string>();

  for (const transformation of allCommon) {
    if (transformation === "repeated") continue;

    const components = deriveComponentsFromPattern(transformation);
    if (components.length === 0) continue;

    const direction = extractRotationDirection(transformation) || rotationDirection;
    const key = components.sort().join("+") + "|" + (direction || "none");
    if (seen.has(key)) continue;
    seen.add(key);

    const intervals: TransformationIntervals = {};
    if (components.includes("rotated")) intervals.rotation = interval;
    if (components.includes("swapped")) intervals.swap = interval;
    if (components.includes("mirrored")) intervals.mirror = interval;
    if (components.includes("inverted")) intervals.invert = interval;

    let label = components.join("+");
    if (direction) label += ` (${direction.toUpperCase()})`;
    if (interval === "quartered") label += " (1/4)";
    else if (interval === "halved") label += " (1/2)";

    candidates.push({
      transformation,
      components,
      intervals,
      rotationDirection: direction,
      label,
      description: formatCandidateDescription(transformation, direction),
    });
  }

  return candidates;
}

/**
 * Group beat pairs by their primary displayed transformation.
 *
 * Since formatBeatPairTransformations already handles preferring inverted variants
 * when both base and inverted are present (noRotation cases), the grouping is simple.
 */
function groupBeatPairsByPattern(beatPairs: InternalBeatPair[]): BeatPairGroups {
  const groups: BeatPairGroups = {};

  for (const pair of beatPairs) {
    const primaryPattern = pair.detectedTransformations[0] || "UNKNOWN";
    if (!groups[primaryPattern]) {
      groups[primaryPattern] = [];
    }
    groups[primaryPattern].push(pair.keyBeat);
  }

  return groups;
}

/**
 * Convert internal beat pairs to the public interface
 */
function toPublicBeatPairs(internal: InternalBeatPair[]): BeatPairRelationship[] {
  return internal.map((p) => ({
    keyBeat: p.keyBeat,
    correspondingBeat: p.correspondingBeat,
    detectedTransformations: p.detectedTransformations,
  }));
}

/**
 * Convert CandidateInfo to CandidateDesignation
 */
function toCandidateDesignation(info: CandidateInfo): CandidateDesignation {
  return {
    components: info.components,
    capType: info.components.sort().join("_"),
    transformationIntervals: info.intervals,
    label: info.label,
    description: info.description,
    rotationDirection: info.rotationDirection,
    confirmed: false,
    denied: false,
  };
}

// ============================================================================
// Main Service Implementation
// ============================================================================

@injectable()
export class CAPDetectionService implements ICAPDetectionService {
  isCircular(sequence: SequenceEntry): boolean {
    const beats = sequence.fullMetadata?.sequence?.filter((b) => typeof b.beat === "number" && b.beat >= 1);
    if (!beats || beats.length < 2) return false;

    const startPosition = sequence.fullMetadata?.sequence?.find((b) => b.beat === 0);
    const lastBeat = beats[beats.length - 1];
    if (!startPosition || !lastBeat) return false;

    const startPos = startPosition.endPos || startPosition.sequenceStartPosition;
    const endPos = lastBeat.endPos;
    return startPos === endPos;
  }

  detectCAP(sequence: SequenceEntry): CAPDetectionResult {
    console.log("[CAPDetectionService] detectCAP called for:", sequence.word);

    const circular = this.isCircular(sequence);
    const beats = extractBeats(sequence);

    console.log("[CAPDetectionService] Initial analysis:", {
      word: sequence.word,
      isCircular: circular,
      beatCount: beats.length,
      hasFullMetadata: !!sequence.fullMetadata,
      hasSequenceData: !!sequence.fullMetadata?.sequence,
      rawSequenceLength: sequence.fullMetadata?.sequence?.length,
    });

    // Non-circular or too short
    if (!circular || beats.length < 2) {
      return {
        capType: null,
        components: [],
        transformationIntervals: {},
        rotationDirection: null,
        candidateDesignations: [],
        beatPairs: [],
        beatPairGroups: {},
        isCircular: circular,
        isFreeform: false,
        isModular: false,
      };
    }

    // Must have even number of beats
    if (beats.length % 2 !== 0) {
      return {
        capType: null,
        components: [],
        transformationIntervals: {},
        rotationDirection: null,
        candidateDesignations: [],
        beatPairs: [],
        beatPairGroups: {},
        isCircular: true,
        isFreeform: true,
        isModular: false,
      };
    }

    // Generate halved beat pairs (always needed)
    const halvedBeatPairs = generateHalvedBeatPairs(beats);
    const halvedBeatPairGroups = groupBeatPairsByPattern(halvedBeatPairs);

    // Detect rotation direction for quartered sequences
    let rotationDirection: "cw" | "ccw" | null = null;
    if (beats.length >= 4 && beats.length % 4 === 0) {
      rotationDirection = detectRotationDirection(beats);
    }

    // ============================================================
    // PRIORITY 0: Check for QUARTERED patterns (90° rotations)
    // ============================================================
    if (beats.length >= 4 && beats.length % 4 === 0) {
      const quarteredBeatPairs = generateQuarteredBeatPairs(beats);
      const allQuarteredCommon = findAllCommonTransformations(quarteredBeatPairs);

      console.log("[CAPDetectionService] Quartered analysis:", {
        beatPairCount: quarteredBeatPairs.length,
        commonTransformations: allQuarteredCommon,
      });

      // Filter to only 90° rotation patterns
      const rotation90Patterns = allQuarteredCommon.filter((t) =>
        t.includes("rotated_90") || t.includes("90_ccw") || t.includes("90_cw")
      );

      if (rotation90Patterns.length > 0) {
        // Build quartered candidates only - 90° rotation is more specific than 180°
        // If something rotates 90° consistently, it automatically satisfies 180° too,
        // so showing both would be redundant. Only show the more specific 90° pattern.
        const quarteredCandidates = buildCandidateDesignations(
          rotation90Patterns,
          "quartered",
          rotationDirection
        );

        // Don't include 180° candidates - they're implied by the 90° pattern
        const allCandidates = quarteredCandidates;

        // Use 90° as primary for capType (more specific)
        const primaryPattern = rotation90Patterns[0] ?? "";
        const derivedComponents = deriveComponentsFromPattern(primaryPattern);
        const derivedDirection = extractRotationDirection(primaryPattern) || rotationDirection;

        if (derivedComponents.length > 0) {
          const derivedIntervals: TransformationIntervals = {};
          if (derivedComponents.includes("rotated")) derivedIntervals.rotation = "quartered";
          if (derivedComponents.includes("swapped")) derivedIntervals.swap = "quartered";
          if (derivedComponents.includes("mirrored")) derivedIntervals.mirror = "quartered";
          if (derivedComponents.includes("inverted")) derivedIntervals.invert = "quartered";

          return {
            capType: derivedComponents.sort().join("_") + "_quartered",
            components: derivedComponents,
            transformationIntervals: derivedIntervals,
            rotationDirection: derivedDirection,
            candidateDesignations: allCandidates.map(toCandidateDesignation),
            beatPairs: toPublicBeatPairs(quarteredBeatPairs),
            beatPairGroups: groupBeatPairsByPattern(quarteredBeatPairs),
            isCircular: true,
            isFreeform: false,
            isModular: false,
          };
        }
      }
    }

    // ============================================================
    // PRIORITY 1: Find COMMON transformation across ALL beat pairs (halved)
    // ============================================================
    const allHalvedCommon = findAllCommonTransformations(halvedBeatPairs);

    console.log("[CAPDetectionService] Halved analysis:", {
      beatPairCount: halvedBeatPairs.length,
      commonTransformations: allHalvedCommon,
      firstPairTransformations: halvedBeatPairs[0]?.rawTransformations,
    });

    if (allHalvedCommon.length > 0) {
      const candidateInfos = buildCandidateDesignations(allHalvedCommon, "halved", rotationDirection);
      const commonTransformation = allHalvedCommon[0]!;
      const derivedComponents = deriveComponentsFromPattern(commonTransformation);

      if (derivedComponents.length > 0) {
        const derivedIntervals: TransformationIntervals = {};
        if (derivedComponents.includes("inverted")) derivedIntervals.invert = "halved";
        if (derivedComponents.includes("rotated")) derivedIntervals.rotation = "halved";
        if (derivedComponents.includes("swapped")) derivedIntervals.swap = "halved";
        if (derivedComponents.includes("mirrored")) derivedIntervals.mirror = "halved";
        if (derivedComponents.includes("flipped")) derivedIntervals.flip = "halved";

        return {
          capType: derivedComponents.sort().join("_"),
          components: derivedComponents,
          transformationIntervals: derivedIntervals,
          rotationDirection,
          candidateDesignations: candidateInfos.map(toCandidateDesignation),
          beatPairs: toPublicBeatPairs(halvedBeatPairs),
          beatPairGroups: halvedBeatPairGroups,
          isCircular: true,
          isFreeform: false,
          isModular: false,
        };
      }
    }

    // ============================================================
    // Fallback: Check if modular or truly freeform
    // ============================================================

    // Count pattern groups and check for UNKNOWN
    const patternGroups = Object.keys(halvedBeatPairGroups);
    const hasUnknown = patternGroups.some((p) => p === "UNKNOWN");
    const recognizedPatterns = patternGroups.filter((p) => p !== "UNKNOWN");

    // Modular: Multiple different but recognizable transformations (no UNKNOWN)
    // Freeform: Has UNKNOWN transformations (can't identify the relationship)
    const isModular = !hasUnknown && recognizedPatterns.length > 1;
    const isFreeform = hasUnknown || recognizedPatterns.length === 0;

    console.log("[CAPDetectionService] Fallback analysis:", {
      patternGroups,
      hasUnknown,
      recognizedPatterns,
      isModular,
      isFreeform,
    });

    return {
      capType: null,
      components: [],
      transformationIntervals: {},
      rotationDirection: null,
      candidateDesignations: [],
      beatPairs: toPublicBeatPairs(halvedBeatPairs),
      beatPairGroups: halvedBeatPairGroups,
      isCircular: true,
      isFreeform,
      isModular,
    };
  }
}
