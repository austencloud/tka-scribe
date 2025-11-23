/**
 * Compact Sequence URL Encoder/Decoder
 *
 * Compresses sequence data into ultra-compact URL-safe strings.
 * Format: startPosition|beat1|beat2|beat3|...
 * Each motion: startLoc(2)+endLoc(2)+startOrient(1)+endOrient(1)+rotDir(1)+turns(1+)+type(1)
 *
 * IMPORTANT: The first part is the START POSITION (where the user begins),
 * NOT a beat! Beats are numbered 1, 2, 3, ... The start position is beat 0
 * internally but should not be counted when reporting "total beats".
 *
 * Example: "sosoiix0s:nonoiix0s|soweiic0p:soweiuc0p" (start position + 1 beat)
 *
 * With LZString compression, URLs can be 60-70% smaller for longer sequences.
 *
 * Goal: Keep most sequences under 150 characters uncompressed, ~50-80 compressed
 */

import LZString from "lz-string";

import type { BeatData } from "$lib/modules/create/shared/domain/models/BeatData";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import {
  MotionType,
  Orientation,
  RotationDirection,
} from "$lib/shared/pictograph/shared/domain/enums/pictograph-enums";
import type { MotionData } from "$lib/shared/pictograph/shared/domain/models/MotionData";

// ============================================================================
// Character Code Mappings
// ============================================================================

// Use 2-character codes for all locations to avoid parsing ambiguity
const LOCATION_ENCODE: Record<GridLocation, string> = {
  [GridLocation.NORTH]: "no",
  [GridLocation.EAST]: "ea",
  [GridLocation.SOUTH]: "so",
  [GridLocation.WEST]: "we",
  [GridLocation.NORTHEAST]: "ne",
  [GridLocation.SOUTHEAST]: "se",
  [GridLocation.SOUTHWEST]: "sw",
  [GridLocation.NORTHWEST]: "nw",
};

const LOCATION_DECODE: Record<string, GridLocation> = Object.fromEntries(
  Object.entries(LOCATION_ENCODE).map(([k, v]) => [v, k as GridLocation])
);

const ORIENTATION_ENCODE: Record<Orientation, string> = {
  [Orientation.IN]: "i",
  [Orientation.OUT]: "o",
  [Orientation.CLOCK]: "k",
  [Orientation.COUNTER]: "t",
};

const ORIENTATION_DECODE: Record<string, Orientation> = Object.fromEntries(
  Object.entries(ORIENTATION_ENCODE).map(([k, v]) => [v, k as Orientation])
);

const ROTATION_ENCODE: Record<RotationDirection, string> = {
  [RotationDirection.CLOCKWISE]: "c",
  [RotationDirection.COUNTER_CLOCKWISE]: "u",
  [RotationDirection.NO_ROTATION]: "x",
};

const ROTATION_DECODE: Record<string, RotationDirection> = Object.fromEntries(
  Object.entries(ROTATION_ENCODE).map(([k, v]) => [v, k as RotationDirection])
);

const MOTION_TYPE_ENCODE: Record<MotionType, string> = {
  [MotionType.PRO]: "p",
  [MotionType.ANTI]: "a",
  [MotionType.FLOAT]: "l", // 'l' to avoid conflict with 'f' for float turns
  [MotionType.DASH]: "d",
  [MotionType.STATIC]: "s",
};

const MOTION_TYPE_DECODE: Record<string, MotionType> = Object.fromEntries(
  Object.entries(MOTION_TYPE_ENCODE).map(([k, v]) => [v, k as MotionType])
);

// ============================================================================
// Encoding Functions
// ============================================================================

/**
 * Encode a single motion into compact string format
 * Format: startLoc(2)+endLoc(2)+startOrient(1)+endOrient(1)+rotDir(1)+turns(1+)+type(1)
 * Example: "soweiic0p" = south→west, in→in, clockwise, 0 turns, pro
 */
function encodeMotion(motion: MotionData | undefined): string {
  if (!motion) return ""; // Empty motion

  const startLoc = LOCATION_ENCODE[motion.startLocation];
  const endLoc = LOCATION_ENCODE[motion.endLocation];
  const startOrient = ORIENTATION_ENCODE[motion.startOrientation];
  const endOrient = ORIENTATION_ENCODE[motion.endOrientation];
  const rotation = ROTATION_ENCODE[motion.rotationDirection];
  const turns = motion.turns === "fl" ? "f" : String(motion.turns);
  const type = MOTION_TYPE_ENCODE[motion.motionType];

  // ⚠️ VALIDATION: Check that all required fields are present
  // If any field is undefined, the URL will be corrupted and won't decompress
  if (!startLoc || !endLoc || !startOrient || !endOrient || !rotation || !type) {
    console.error("❌ URL Encoder: Motion has missing required fields!", {
      hasStartLoc: !!startLoc,
      hasEndLoc: !!endLoc,
      hasStartOrient: !!startOrient,
      hasEndOrient: !!endOrient,
      hasRotation: !!rotation,
      hasType: !!type,
      motion: {
        startLocation: motion.startLocation,
        endLocation: motion.endLocation,
        startOrientation: motion.startOrientation,
        endOrientation: motion.endOrientation,
        rotationDirection: motion.rotationDirection,
        motionType: motion.motionType,
      },
    });

    // Return empty string to prevent corrupting the entire URL
    // This will result in a beat like ":redMotion" or "blueMotion:"
    // which is better than "undefined" in the encoded string
    return "";
  }

  return `${startLoc}${endLoc}${startOrient}${endOrient}${rotation}${turns}${type}`;
}

/**
 * Encode a pictograph's blue and red motions
 * Format: "blueMotion:redMotion"
 * Example: "soweiic0p:soweiuc0p"
 *
 * Used for both start positions and sequence beats.
 */
function encodeBeat(beat: BeatData): string {
  const blueMotion = encodeMotion(beat.motions.blue);
  const redMotion = encodeMotion(beat.motions.red);
  return `${blueMotion}:${redMotion}`;
}

/**
 * Encode entire sequence into compact URL string
 * Format: "startPosition|beat1|beat2|beat3..."
 * Example: "soweiic0p:noeaiic0p|wesouuc0p:nosouuc0p|..." (1 start position + 2 beats)
 *
 * IMPORTANT: The first part is the START POSITION (where performer begins),
 * NOT a beat. The actual sequence beats follow after the first pipe.
 */
export function encodeSequence(sequence: SequenceData): string {
  let startPositionBeat: BeatData;
  let actualBeats: readonly BeatData[];

  // Check if beat 0 exists in the beats array (Generator puts start position at beats[0])
  const beat0 = sequence.beats.find((b) => b.beatNumber === 0);

  if (beat0) {
    // Generator format: start position is in beats array at index 0
    startPositionBeat = beat0;
    actualBeats = sequence.beats.filter((b) => b.beatNumber !== 0);
  } else if (sequence.startingPositionBeat) {
    // Standard format: start position is in startingPositionBeat property
    startPositionBeat = sequence.startingPositionBeat;
    actualBeats = sequence.beats;
  } else {
    // No start position - create a blank one
    startPositionBeat = {
      beatNumber: 0,
      motions: { blue: undefined, red: undefined },
      duration: 1,
      blueReversal: false,
      redReversal: false,
      isBlank: true,
      id: crypto.randomUUID(),
      letter: null,
      startPosition: null,
      endPosition: null,
    };
    actualBeats = sequence.beats;
  }

  const encodedStartPosition = encodeBeat(startPositionBeat);
  const encodedBeats = actualBeats.map(encodeBeat);

  return `${encodedStartPosition}|${encodedBeats.join("|")}`;
}

// ============================================================================
// Decoding Functions
// ============================================================================

/**
 * Decode a single motion from compact string format
 * Format: startLoc(2)+endLoc(2)+startOrient(1)+endOrient(1)+rotDir(1)+turns(1+)+type(1)
 * Example: "soweii c0p" → MotionData (south→west, in→in, clockwise, 0 turns, pro)
 */
function decodeMotion(
  encoded: string,
  color: "blue" | "red"
): MotionData | undefined {
  if (!encoded || encoded.length < 9) return undefined; // Minimum: 2+2+1+1+1+1+1 = 9 chars

  let pos = 0;

  // Parse start location (always 2 chars)
  const startLocCode = encoded.slice(pos, pos + 2);
  pos += 2;

  // Parse end location (always 2 chars)
  const endLocCode = encoded.slice(pos, pos + 2);
  pos += 2;

  // Parse orientations (1 char each)
  const startOrientCode = encoded[pos++];
  const endOrientCode = encoded[pos++];

  // Parse rotation (1 char)
  const rotationCode = encoded[pos++];

  // Parse turns (1+ chars, until we hit motion type letter)
  let turnsCode = "";
  while (
    pos < encoded.length &&
    encoded[pos] &&
    !MOTION_TYPE_DECODE[encoded[pos]!]
  ) {
    turnsCode += encoded[pos++];
  }

  // Parse motion type (1 char)
  const typeCode = encoded[pos];

  // Decode values
  const startLocation = LOCATION_DECODE[startLocCode];
  const endLocation = LOCATION_DECODE[endLocCode];
  const startOrientation = ORIENTATION_DECODE[startOrientCode!];
  const endOrientation = ORIENTATION_DECODE[endOrientCode!];
  const rotationDirection = ROTATION_DECODE[rotationCode!];
  const turns = turnsCode === "f" ? ("fl" as const) : parseInt(turnsCode, 10);
  const motionType = MOTION_TYPE_DECODE[typeCode!];

  // Basic validation
  if (
    !startLocation ||
    !endLocation ||
    !startOrientation ||
    !endOrientation ||
    !rotationDirection ||
    !motionType
  ) {
    throw new Error(`Invalid motion encoding: ${encoded}`);
  }

  // Import MotionColor enum
  const MotionColor = { BLUE: "blue" as const, RED: "red" as const };
  const motionColor = color === "blue" ? MotionColor.BLUE : MotionColor.RED;

  // Create minimal MotionData (other fields will be populated by the pictograph system)
  return {
    motionType,
    rotationDirection,
    startLocation,
    endLocation,
    turns,
    startOrientation,
    endOrientation,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    color: motionColor as any,
    isVisible: true,
    // These fields will be populated by the pictograph system
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    propType: undefined as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    gridMode: undefined as any,
    arrowLocation: startLocation,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    arrowPlacementData: {} as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    propPlacementData: {} as any,
  };
}

/**
 * Decode a beat from "blueMotion:redMotion" format
 * NOTE: Letters are NOT decoded here - they will be derived later by the module
 * after the pictograph services are loaded
 */
function decodeBeat(encoded: string, beatNumber: number): BeatData {
  const [blueEncoded, redEncoded] = encoded.split(":");

  if (!blueEncoded || !redEncoded) {
    throw new Error(`Invalid beat encoding: ${encoded}`);
  }

  return {
    beatNumber,
    duration: 1,
    blueReversal: false,
    redReversal: false,
    isBlank: false,
    motions: {
      blue: decodeMotion(blueEncoded, "blue"),
      red: decodeMotion(redEncoded, "red"),
    },
    // Letter will be derived later by the module using MotionQueryHandler
    id: crypto.randomUUID(),
    letter: null,
    startPosition: null,
    endPosition: null,
  };
}

/**
 * Decode compact URL string into full SequenceData
 * Format (current): "startPosition|beat1|beat2|beat3..."
 * Format (legacy): "beatNumber|beat1|beat2|beat3..." - for backward compatibility
 *
 * IMPORTANT: The first part is the START POSITION (where performer begins),
 * NOT a beat. The actual sequence beats follow after the first pipe.
 *
 * Generator format: Start position is included in beats array with beatNumber=0
 * (internally we use beat 0 for start position, but it's not a "sequence beat")
 *
 * NOTE: Letters are not included - they will be derived later by the module
 */
export function decodeSequence(encoded: string): SequenceData {
  if (!encoded) {
    throw new Error("Cannot decode empty sequence");
  }

  const parts = encoded.split("|");
  if (parts.length < 1) {
    throw new Error("Invalid sequence encoding - missing data");
  }

  // Check if this is the old format (first part is just a number) or new format (encoded beat)
  const firstPart = parts[0];
  if (!firstPart) {
    throw new Error("Invalid sequence encoding - empty first part");
  }
  const isLegacyFormat = /^\d+$/.test(firstPart);

  let beats: BeatData[];

  if (isLegacyFormat) {
    // Legacy format: "beatNumber|beat1|beat2|..."
    const startBeat = parseInt(firstPart, 10);
    if (isNaN(startBeat)) {
      throw new Error("Invalid start beat number");
    }

    const beatEncodings = parts.slice(1).filter((e) => e && e.length > 0);
    if (beatEncodings.length === 0) {
      throw new Error("No beat data found in sequence");
    }

    // Create start position (internally beat 0, but not a "sequence beat")
    const startPositionBeat: BeatData = {
      beatNumber: 0, // Start position uses beat 0 internally
      motions: { blue: undefined, red: undefined },
      duration: 1,
      blueReversal: false,
      redReversal: false,
      isBlank: true,
      id: crypto.randomUUID(),
      letter: null,
      startPosition: null,
      endPosition: null,
    };

    const sequenceBeats = beatEncodings.map((encoding, index) =>
      decodeBeat(encoding, startBeat + index)
    );

    // Put start position at index 0, followed by sequence beats
    beats = [startPositionBeat, ...sequenceBeats];
  } else {
    // Current format: "startPosition|beat1|beat2|..."
    const startPositionEncoding = parts[0]!; // Already validated above
    const startingPositionBeat = decodeBeat(startPositionEncoding, 0);

    // Remaining parts are the actual sequence beats (numbered 1, 2, 3, ...)
    const beatEncodings = parts.slice(1).filter((e) => e && e.length > 0);

    beats = beatEncodings.map(
      (encoding, index) => decodeBeat(encoding, index + 1) // Beat numbers start at 1
    );

    return {
      id: crypto.randomUUID(),
      name: "Shared Sequence",
      word: "", // Will be derived from motion data
      beats,
      startingPositionBeat, // Separate field for start position
      thumbnails: [],
      isFavorite: false,
      isCircular: false,
      tags: [],
      metadata: {},
      sequenceLength: beats.length, // Count of sequence beats (NOT including start position)
    };
  }

  return {
    id: crypto.randomUUID(),
    name: "Shared Sequence",
    word: "", // Will be derived from motion data
    beats,
    thumbnails: [],
    isFavorite: false,
    isCircular: false,
    tags: [],
    metadata: {},
    sequenceLength: beats.length,
  };
}

// ============================================================================
// Compression Helpers
// ============================================================================

/**
 * Compress a string using LZString for URL safety
 */
function compressString(str: string): string {
  return LZString.compressToEncodedURIComponent(str);
}

/**
 * Decompress a LZString-compressed string
 */
function decompressString(compressed: string): string | null {
  return LZString.decompressFromEncodedURIComponent(compressed);
}

/**
 * Encode sequence with optional compression
 * Uses compression automatically if it results in shorter output
 */
export function encodeSequenceWithCompression(sequence: SequenceData): {
  encoded: string;
  compressed: boolean;
  originalLength: number;
  finalLength: number;
} {
  const rawEncoded = encodeSequence(sequence);
  const compressed = compressString(rawEncoded);

  // Use compression only if it's actually shorter
  if (compressed.length < rawEncoded.length) {
    return {
      encoded: `z:${compressed}`, // Prefix with 'z:' to indicate compression
      compressed: true,
      originalLength: rawEncoded.length,
      finalLength: compressed.length + 2, // +2 for 'z:' prefix
    };
  }

  return {
    encoded: rawEncoded,
    compressed: false,
    originalLength: rawEncoded.length,
    finalLength: rawEncoded.length,
  };
}

/**
 * Decode sequence, handling both compressed and uncompressed formats
 */
export function decodeSequenceWithCompression(encoded: string): SequenceData {
  // Check if compressed (prefixed with 'z:')
  if (encoded.startsWith("z:")) {
    const compressed = encoded.slice(2);
    const decompressed = decompressString(compressed);
    if (!decompressed) {
      throw new Error("Failed to decompress sequence data");
    }
    return decodeSequence(decompressed);
  }

  // Not compressed, decode directly
  return decodeSequence(encoded);
}

// ============================================================================
// URL Helpers
// ============================================================================

/**
 * Generate a shareable URL for a sequence in a specific module
 * @param sequence - The sequence data to encode
 * @param module - Target module: 'construct', 'animate', 'explore'
 * @param options - Encoding options
 * @returns Full URL with compact encoding and compression metadata
 */
export function generateShareURL(
  sequence: SequenceData,
  module: string,
  options: { compress?: boolean } = { compress: true }
): {
  url: string;
  length: number;
  compressed: boolean;
  savings: number; // Percentage saved if compressed
} {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  if (options.compress) {
    const { encoded, compressed, originalLength, finalLength } =
      encodeSequenceWithCompression(sequence);
    const url = `${baseUrl}/?open=${module}:${encoded}`;
    const savings = compressed
      ? Math.round(((originalLength - finalLength) / originalLength) * 100)
      : 0;

    return {
      url,
      length: url.length,
      compressed,
      savings,
    };
  }

  // No compression
  const encoded = encodeSequence(sequence);
  const url = `${baseUrl}/?open=${module}:${encoded}`;

  return {
    url,
    length: url.length,
    compressed: false,
    savings: 0,
  };
}

/**
 * Parse a deep link URL and extract module + sequence data
 * Handles both compressed and uncompressed formats
 * @param url - URL or search params string
 * @returns { module: string, sequence: SequenceData } or null if invalid
 */
export function parseDeepLink(
  url: string
): { module: string; sequence: SequenceData } | null {
  try {
    const params = new URLSearchParams(
      url.includes("?") ? url.split("?")[1] : url
    );
    const openParam = params.get("open");

    if (!openParam) return null;

    const colonIndex = openParam.indexOf(":");
    if (colonIndex === -1) return null;

    const module = openParam.slice(0, colonIndex);
    const encoded = openParam.slice(colonIndex + 1);

    if (!module || !encoded) return null;

    const sequence = decodeSequenceWithCompression(encoded);
    return { module, sequence };
  } catch (error) {
    console.error("Failed to parse deep link:", error);
    return null;
  }
}

/**
 * Estimate URL length for a sequence
 * Useful for warning users about long URLs
 */
export function estimateURLLength(
  sequence: SequenceData,
  module: string,
  compress = true
): number {
  const result = generateShareURL(sequence, module, { compress });
  return result.length;
}
