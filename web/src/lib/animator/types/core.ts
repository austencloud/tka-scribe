/**
 * Core type definitions for the Pictograph Animator
 *
 * UNIFIED TYPE SYSTEM: Uses domain types from $lib/domain for consistency
 * This file now supports both legacy array format and modern domain object format
 *
 * ENUMS: All enum types imported from centralized /lib/domain/enums.ts
 * No duplicate enum definitions - single source of truth maintained
 */

// Import all enums from centralized location
import {
  MotionType as MotionTypeEnum,
  Orientation as OrientationEnum,
  RotationDirection,
  Location,
} from "$lib/domain/enums";

// Import domain types for unified type system
import type {
  MotionData,
  PictographData,
  BeatData,
  SequenceData as DomainSequenceData,
} from "$lib/domain";

export interface PropAttributes {
  start_loc: Location; // ✅ Use centralized enum
  end_loc: Location; // ✅ Use centralized enum
  start_ori?: OrientationEnum;
  end_ori?: OrientationEnum;
  prop_rot_dir?: RotationDirection;
  turns?: number;
  motion_type: MotionTypeEnum; // ✅ Use centralized enum (removed legacy "fl" support)
  // Manual rotation override fields (in radians)
  manual_start_rotation?: number;
  manual_end_rotation?: number;
  manual_rotation_direction?: RotationDirection; // ✅ Use enum instead of string literals
}

export interface SequenceStep {
  beat: number;
  letter?: string;
  start_pos?: string;
  end_pos?: string;
  blue_attributes: PropAttributes;
  red_attributes: PropAttributes;
  [key: string]: unknown;
}

export interface SequenceMeta {
  word?: string;
  author?: string;
  level?: number;
  prop_type?: string;
  grid_mode?: string;
  [key: string]: unknown;
}

export type SequenceData = [SequenceMeta, ...SequenceStep[]];

// ============================================================================
// PHASE 1: UNIFIED DATA STRUCTURES FOR NATIVE COMPATIBILITY
// ============================================================================

/**
 * Unified sequence data interface that supports both legacy array format
 * and modern domain object format for seamless integration
 */
export interface UnifiedSequenceData {
  // Domain format (primary) - object-based structure
  id: string;
  name: string;
  word: string;
  beats: readonly BeatData[];
  start_position?: BeatData;
  thumbnails?: readonly string[];
  sequence_length?: number;
  author?: string;
  level?: number;
  date_added?: Date;
  grid_mode?: string;
  prop_type?: string;
  is_favorite?: boolean;
  is_circular?: boolean;
  starting_position?: string;
  difficulty_level?: string;
  tags?: readonly string[];
  metadata: Record<string, unknown>;

  // Legacy support (during transition) - array-based structure
  legacy?: SequenceData;
}

/**
 * Type union for accepting both formats during transition
 */
export type AnySequenceData =
  | UnifiedSequenceData
  | SequenceData
  | DomainSequenceData;

/**
 * Motion data extraction result from web app beat data
 */
export interface ExtractedMotionData {
  blue: PropAttributes;
  red: PropAttributes;
  hasMotionData: boolean;
  source: "pictograph_data" | "legacy" | "default";
}

export interface PropState {
  centerPathAngle: number;
  staffRotationAngle: number;
  x: number;
  y: number;
}

export interface DictionaryItem {
  id: string;
  name: string;
  filePath: string;
  metadata: SequenceMeta;
  sequenceData: SequenceData;
  thumbnailUrl?: string;
  versions: string[];
}

export interface DictionaryIndex {
  items: DictionaryItem[];
  categories: string[];
  totalCount: number;
  lastUpdated: Date;
}

// ============================================================================
// PHASE 1: MOTION DATA EXTRACTION UTILITIES
// ============================================================================

/**
 * Extract motion data from domain beat structure
 * Converts nested PictographData.motions to PropAttributes format
 */
export function extractMotionData(beat: BeatData): ExtractedMotionData {
  // Check if beat has pictograph data with motions
  if (beat.pictograph_data?.motions) {
    const motions = beat.pictograph_data.motions;

    return {
      blue: convertMotionDataToPropAttributes(motions.blue),
      red: convertMotionDataToPropAttributes(motions.red),
      hasMotionData: true,
      source: "pictograph_data",
    };
  }

  // Fallback to default motion data
  return {
    blue: createDefaultPropAttributes(),
    red: createDefaultPropAttributes(),
    hasMotionData: false,
    source: "default",
  };
}

/**
 * Convert domain MotionData to animator PropAttributes
 */
export function convertMotionDataToPropAttributes(
  motionData: MotionData
): PropAttributes {
  return {
    start_loc: motionData.start_loc, // ✅ Direct enum assignment
    end_loc: motionData.end_loc, // ✅ Direct enum assignment
    start_ori: motionData.start_ori,
    end_ori: motionData.end_ori,
    prop_rot_dir: motionData.prop_rot_dir,
    turns: typeof motionData.turns === "number" ? motionData.turns : 0,
    motion_type: motionData.motion_type,
  };
}

/**
 * Create default prop attributes for missing motion data
 */
export function createDefaultPropAttributes(): PropAttributes {
  return {
    start_loc: Location.NORTH, 
    end_loc: Location.EAST, 
    start_ori: OrientationEnum.IN,
    end_ori: OrientationEnum.IN,
    prop_rot_dir: RotationDirection.CLOCKWISE,
    turns: 0,
    motion_type: MotionTypeEnum.PRO,
  };
}

// ============================================================================
// PHASE 1: BACKWARD COMPATIBILITY ADAPTERS
// ============================================================================

/**
 * Adapt any sequence data format to unified format
 * Handles both legacy array format and modern web app object format
 */
export function adaptSequenceData(data: AnySequenceData): UnifiedSequenceData {
  // Check if it's already in unified format
  if (isUnifiedSequenceData(data)) {
    return data;
  }

  // Check if it's legacy array format
  if (Array.isArray(data)) {
    return convertLegacyToUnified(data);
  }

  // Check if it's domain format
  if (isDomainSequenceData(data)) {
    return convertDomainToUnified(data);
  }

  throw new Error("Unknown sequence data format");
}

/**
 * Type guard for unified sequence data
 */
export function isUnifiedSequenceData(
  data: unknown
): data is UnifiedSequenceData {
  return (
    data !== null &&
    data !== undefined &&
    typeof data === "object" &&
    "beats" in data &&
    "id" in data &&
    "word" in data &&
    "metadata" in data
  );
}

/**
 * Type guard for domain sequence data
 */
export function isDomainSequenceData(
  data: unknown
): data is DomainSequenceData {
  return (
    data !== null &&
    data !== undefined &&
    typeof data === "object" &&
    "beats" in data &&
    "id" in data &&
    "word" in data &&
    !("legacy" in data)
  );
}

/**
 * Type guard for legacy array format
 */
export function isLegacySequenceData(data: unknown): data is SequenceData {
  return Array.isArray(data) && data.length >= 2;
}

/**
 * Convert legacy array format to unified format
 */
export function convertLegacyToUnified(
  legacyData: SequenceData
): UnifiedSequenceData {
  const [meta, ...steps] = legacyData;

  // Convert legacy steps to domain beat format
  const beats: BeatData[] = steps.map((step, index) => ({
    id: `beat-${index + 1}`,
    beat_number: step.beat || index + 1,
    duration: 1, // Default duration
    blue_reversal: false,
    red_reversal: false,
    is_blank: false,
    pictograph_data: {
      id: `pictograph-${index + 1}`,
      grid_data: {
        grid_mode: "diamond" as any,
        center_x: 0,
        center_y: 0,
        radius: 100,
        grid_points: {},
      },
      arrows: {
        blue: {} as any,
        red: {} as any,
      },
      props: {
        blue: {} as any,
        red: {} as any,
      },
      motions: {
        blue: convertPropAttributesToMotionData(step.blue_attributes),
        red: convertPropAttributesToMotionData(step.red_attributes),
      },
      letter: step.letter || "",
      beat: step.beat || index + 1,
      is_blank: false,
      is_mirrored: false,
      metadata: {},
    },
    metadata: {},
  }));

  return {
    id: (meta.id as string) || `legacy-${Date.now()}`,
    name: meta.word || "Legacy Sequence",
    word: meta.word || "",
    beats,
    metadata: {
      author: meta.author,
      level: meta.level,
      grid_mode: meta.grid_mode,
      ...meta,
    },
    legacy: legacyData,
  };
}

/**
 * Convert domain format to unified format
 */
export function convertDomainToUnified(
  domainData: DomainSequenceData
): UnifiedSequenceData {
  return {
    ...domainData,
    // Ensure all required fields are present
    metadata: domainData.metadata || {},
  };
}

/**
 * Convert animator PropAttributes to domain MotionData format
 * Used when converting legacy data to domain format
 */
export function convertPropAttributesToMotionData(
  propAttrs: PropAttributes
): MotionData {
  // ✅ Direct enum usage - no conversion needed
  const motionType = propAttrs.motion_type;

  const propRotDir = propAttrs.prop_rot_dir || RotationDirection.NO_ROTATION;

  // ✅ Direct enum usage - no conversion needed since PropAttributes now uses Location enum
  const startLoc = propAttrs.start_loc;
  const endLoc = propAttrs.end_loc;

  const startOri = propAttrs.start_ori || OrientationEnum.IN;
  const endOri = propAttrs.end_ori || OrientationEnum.IN;

  return {
    motion_type: motionType,
    prop_rot_dir: propRotDir,
    start_loc: startLoc,
    end_loc: endLoc,
    turns: propAttrs.turns || 0,
    start_ori: startOri,
    end_ori: endOri,
    is_visible: true,
  };
}

// ============================================================================
// PHASE 1: SEQUENCE STEP EXTRACTION UTILITIES
// ============================================================================

/**
 * Extract sequence steps from unified sequence data
 * Converts web app beats back to animator step format for engine compatibility
 */
export function extractStepsFromUnified(
  data: UnifiedSequenceData
): SequenceStep[] {
  return data.beats.map((beat) => {
    const motionData = extractMotionData(beat);
    return {
      beat: beat.beat_number,
      letter: beat.pictograph_data?.letter || "",
      blue_attributes: motionData.blue,
      red_attributes: motionData.red,
    };
  });
}

/**
 * Extract sequence metadata from unified sequence data
 */
export function extractMetaFromUnified(
  data: UnifiedSequenceData
): SequenceMeta {
  return {
    id: data.id,
    word: data.word,
    author: (data.metadata.author as string) || "",
    level: (data.metadata.level as number) || 1,
    grid_mode: (data.metadata.grid_mode as string) || "grid",
    ...data.metadata,
  };
}
