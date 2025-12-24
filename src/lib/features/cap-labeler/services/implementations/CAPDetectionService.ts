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
  // Pure directional rotations first (simplest explanation)
  "rotated_90_cw",
  "rotated_90_ccw",
  "rotated_180",
  // Rotation + inversion
  "rotated_90_cw_inverted",
  "rotated_90_ccw_inverted",
  "rotated_180_inverted",
  // Rotation + swap
  "rotated_90_cw_swapped",
  "rotated_90_ccw_swapped",
  "rotated_180_swapped",
  // Triple compound
  "rotated_90_cw_swapped_inverted",
  "rotated_90_ccw_swapped_inverted",
  "rotated_180_swapped_inverted",
  // Other compounds
  "flipped_inverted",
  "mirrored_swapped",
  // Simple transformations
  "mirrored",
  "flipped",
  "swapped",
  "inverted",
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
  };
  red: {
    startLoc: string;
    endLoc: string;
    motionType: string;
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
      },
      red: {
        startLoc: b.redAttributes?.startLoc?.toLowerCase() || "",
        endLoc: b.redAttributes?.endLoc?.toLowerCase() || "",
        motionType: b.redAttributes?.motionType?.toLowerCase() || "",
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

  // Motion checks for swapped colors
  const motionSameSwapped =
    b1Red.motionType === b2Blue.motionType &&
    b1Blue.motionType === b2Red.motionType;

  const motionInvertedSwapped =
    invertMotionType(b1Red.motionType) === b2Blue.motionType &&
    invertMotionType(b1Blue.motionType) === b2Red.motionType;

  // Compound: rotation + swap
  if (positions180Swapped && motionSameSwapped) {
    transformations.push("rotated_180_swapped");
  }
  if (positions180Swapped && motionInvertedSwapped) {
    transformations.push("rotated_180_swapped_inverted");
  }
  if (positions90CCWSwapped && motionSameSwapped) {
    transformations.push("rotated_90_ccw_swapped");
  }
  if (positions90CCWSwapped && motionInvertedSwapped) {
    transformations.push("rotated_90_ccw_swapped_inverted");
  }
  if (positions90CWSwapped && motionSameSwapped) {
    transformations.push("rotated_90_cw_swapped");
  }
  if (positions90CWSwapped && motionInvertedSwapped) {
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

  // Motion checks for same colors
  const motionSameColors =
    b1Blue.motionType === b2Blue.motionType &&
    b1Red.motionType === b2Red.motionType;

  const motionInvertedSameColors =
    invertMotionType(b1Blue.motionType) === b2Blue.motionType &&
    invertMotionType(b1Red.motionType) === b2Red.motionType;

  // Pure rotations
  if (positions90CCW && motionSameColors) {
    transformations.push("rotated_90_ccw");
  }
  if (positions90CCW && motionInvertedSameColors) {
    transformations.push("rotated_90_ccw_inverted");
  }
  if (positions180 && motionSameColors) {
    transformations.push("rotated_180");
  }
  if (positions180 && motionInvertedSameColors) {
    transformations.push("rotated_180_inverted");
  }
  if (positions90CW && motionSameColors) {
    transformations.push("rotated_90_cw");
  }
  if (positions90CW && motionInvertedSameColors) {
    transformations.push("rotated_90_cw_inverted");
  }

  // Mirror
  if (
    MIRROR_VERTICAL[b1Blue.startLoc] === b2Blue.startLoc &&
    MIRROR_VERTICAL[b1Blue.endLoc] === b2Blue.endLoc &&
    MIRROR_VERTICAL[b1Red.startLoc] === b2Red.startLoc &&
    MIRROR_VERTICAL[b1Red.endLoc] === b2Red.endLoc
  ) {
    transformations.push("mirrored");
  }

  // Flip
  const positionsFlipped =
    FLIP_HORIZONTAL[b1Blue.startLoc] === b2Blue.startLoc &&
    FLIP_HORIZONTAL[b1Blue.endLoc] === b2Blue.endLoc &&
    FLIP_HORIZONTAL[b1Red.startLoc] === b2Red.startLoc &&
    FLIP_HORIZONTAL[b1Red.endLoc] === b2Red.endLoc;

  if (positionsFlipped && motionSameColors) {
    transformations.push("flipped");
  }
  if (positionsFlipped && motionInvertedSameColors) {
    transformations.push("flipped_inverted");
  }

  // Swapped only (no position change)
  const colorsSwapped =
    b1Blue.startLoc === b2Red.startLoc && b1Blue.endLoc === b2Red.endLoc &&
    b1Red.startLoc === b2Blue.startLoc && b1Red.endLoc === b2Blue.endLoc &&
    b1Blue.motionType === b2Red.motionType && b1Red.motionType === b2Blue.motionType;

  if (colorsSwapped && !transformations.includes("swapped")) {
    transformations.push("swapped");
  }

  // Inverted only (same positions, motion inverted)
  const motionInverted =
    b1Blue.startLoc === b2Blue.startLoc && b1Blue.endLoc === b2Blue.endLoc &&
    b1Red.startLoc === b2Red.startLoc && b1Red.endLoc === b2Red.endLoc &&
    invertMotionType(b1Blue.motionType) === b2Blue.motionType &&
    invertMotionType(b1Red.motionType) === b2Red.motionType;

  if (motionInverted) {
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
 * Format raw transformations into human-readable strings
 */
function formatBeatPairTransformations(rawTransformations: string[]): string[] {
  if (rawTransformations.length === 0) return [];

  const sorted = [...rawTransformations].sort((a, b) => {
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
 * Group beat pairs by their transformation pattern
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
        // Build quartered candidates
        const quarteredCandidates = buildCandidateDesignations(
          rotation90Patterns,
          "quartered",
          rotationDirection
        );

        // ALSO check for halved 180° pattern
        const allHalvedCommon = findAllCommonTransformations(halvedBeatPairs);
        const halved180Patterns = allHalvedCommon.filter((t) =>
          t.includes("rotated_180") || t === "rotated"
        );

        const halvedCandidates = halved180Patterns.length > 0
          ? buildCandidateDesignations(halved180Patterns, "halved", null)
          : [];

        // Combine: halved 180° first (simpler), then quartered 90°
        const allCandidates = [...halvedCandidates, ...quarteredCandidates];

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
        };
      }
    }

    // ============================================================
    // Fallback: Freeform (circular but no recognized pattern)
    // ============================================================
    return {
      capType: null,
      components: [],
      transformationIntervals: {},
      rotationDirection: null,
      candidateDesignations: [],
      beatPairs: toPublicBeatPairs(halvedBeatPairs),
      beatPairGroups: halvedBeatPairGroups,
      isCircular: true,
      isFreeform: true,
    };
  }
}
