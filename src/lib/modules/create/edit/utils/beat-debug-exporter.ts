/**
 * Beat Debug Exporter
 *
 * Utility for exporting comprehensive beat data including rotation calculations
 * for debugging arrow positioning issues.
 *
 * Distinguishes between:
 * - Start Position Pictographs (beatNumber === 0) - No motion, just prop orientations
 * - Beat Pictographs (beatNumber >= 1) - Actual motions with arrows and props
 */

import type { BeatData } from "$create/shared/workspace-panel";
import type { IArrowRotationCalculator } from "$shared/pictograph/arrow/positioning/calculation/services/implementations/ArrowRotationCalculator";
import type { MotionData, PictographData } from "$shared";
import { resolve, TYPES } from "$shared";

/**
 * Debug data for a start position pictograph (beatNumber === 0)
 * Start positions show initial prop orientations before sequence begins
 */
export interface StartPositionDebugData {
  // Identification
  type: "start-position";
  id: string;
  letter?: string | null;
  gridPosition?: string | null; // e.g. "gamma13"

  // Prop states (no motion occurring)
  propStates: {
    blue?: PropStateDebugData | null;
    red?: PropStateDebugData | null;
  };
}

/**
 * Simplified prop state for start positions (no motion, no arrows)
 */
export interface PropStateDebugData {
  color: string;
  location: string; // Grid location where prop is held
  orientation: string; // How prop is oriented (in/out/clock/counter)
  propType: string; // staff/buugeng/fan/etc

  // Prop rotation and placement
  propRotation: number; // Calculated prop rotation in degrees
  propPlacement: {
    x: number;
    y: number;
    rotation?: number;
    isVisible?: boolean;
  };
}

/**
 * Debug data for an actual beat pictograph (beatNumber >= 1)
 * Beats show motions with arrows and props moving
 */
export interface BeatDebugData {
  // Identification
  type: "beat";
  beatNumber: number;
  duration: number;
  id: string;

  // Beat context
  letter?: string | null;
  startPosition?: string | null; // Where sequence starts (e.g. "gamma13")
  endPosition?: string | null; // Where sequence ends (e.g. "alpha5")

  // Beat attributes
  blueReversal: boolean;
  redReversal: boolean;
  isBlank: boolean;

  // Motion data with rotation calculations
  motions: {
    blue?: MotionDebugData | null;
    red?: MotionDebugData | null;
  };
}

/**
 * Comprehensive debug data for a motion in a beat
 */
export interface MotionDebugData {
  // Motion identification
  color: string;
  motionType: string; // static/pro/anti/dash/float

  // Motion parameters
  rotationDirection: string;
  startLocation: string;
  endLocation: string;
  turns: number | "fl";
  startOrientation: string;
  endOrientation: string;
  propType: string;
  gridMode: string;
  isVisible: boolean;

  // Arrow data
  arrowLocation: string;
  arrowRotation: number; // Calculated ARROW rotation in degrees
  arrowRotationMethod: string; // How rotation was calculated
  arrowPlacement: {
    x: number;
    y: number;
    rotation?: number;
    isVisible?: boolean;
  };

  // Prop data
  propPlacement: {
    x: number;
    y: number;
    rotation?: number;
    isVisible?: boolean;
  };

  // Prefloat attributes (if applicable)
  prefloatMotionType?: string | null;
  prefloatRotationDirection?: string | null;
}

/**
 * Union type for all debug data
 */
export type PictographDebugData = StartPositionDebugData | BeatDebugData;

/**
 * Export comprehensive pictograph data
 * Automatically detects if it's a start position or beat and exports appropriate structure
 */
export async function exportBeatDebugData(
  beatData: BeatData,
  pictographData?: PictographData
): Promise<PictographDebugData> {
  // Detect if this is a start position (beatNumber === 0)
  const isStartPosition = beatData.beatNumber === 0;

  if (isStartPosition) {
    return exportStartPositionDebugData(beatData);
  } else {
    return exportActualBeatDebugData(beatData, pictographData);
  }
}

/**
 * Export start position data (no motion, just prop states)
 */
async function exportStartPositionDebugData(
  beatData: BeatData
): Promise<StartPositionDebugData> {
  const rotationCalculator = resolve<IArrowRotationCalculator>(
    TYPES.IArrowRotationCalculator
  );

  const debugData: StartPositionDebugData = {
    type: "start-position",
    id: beatData.id,
    letter: beatData.letter || null,
    // For start position, we need to derive the grid position from the motion data
    // since startPosition/endPosition fields will be null
    gridPosition: deriveGridPositionFromMotion(beatData),
    propStates: {},
  };

  // Process blue prop state if it exists
  if (beatData.motions.blue) {
    debugData.propStates.blue = await exportPropStateDebugData(
      beatData.motions.blue,
      rotationCalculator,
      beatData
    );
  }

  // Process red prop state if it exists
  if (beatData.motions.red) {
    debugData.propStates.red = await exportPropStateDebugData(
      beatData.motions.red,
      rotationCalculator,
      beatData
    );
  }

  return debugData;
}

/**
 * Derive grid position from motion data (for start positions)
 * Since start positions don't have startPosition/endPosition set,
 * we infer it from the motion location
 */
function deriveGridPositionFromMotion(beatData: BeatData): string | null {
  // Try to get from letter-based grid position derivation
  // This would need actual grid position logic, but for now return null
  // The user mentioned it should be "gamma13" but we can't reliably derive this
  // without more context about how grid positions map to letters
  return null; // TODO: Implement proper grid position derivation
}

/**
 * Export prop state for start position (simplified, no arrows)
 */
async function exportPropStateDebugData(
  motion: MotionData,
  rotationCalculator: IArrowRotationCalculator,
  pictographData: PictographData
): Promise<PropStateDebugData> {
  // Calculate prop rotation (even though there's no arrow)
  // For start position, we calculate what the rotation would be
  const propRotation = await rotationCalculator.calculateRotation(
    motion,
    motion.startLocation, // Use start location since start/end are same
    pictographData
  );

  return {
    color: motion.color,
    location: motion.startLocation, // Same as endLocation for start position
    orientation: motion.startOrientation, // Same as endOrientation for start position
    propType: motion.propType,
    propRotation,
    propPlacement: {
      x: motion.propPlacementData?.x ?? 0,
      y: motion.propPlacementData?.y ?? 0,
      rotation: motion.propPlacementData?.rotation,
      isVisible: motion.propPlacementData?.isVisible,
    },
  };
}

/**
 * Export actual beat data (with motions, arrows, etc.)
 */
async function exportActualBeatDebugData(
  beatData: BeatData,
  pictographData?: PictographData
): Promise<BeatDebugData> {
  const rotationCalculator = resolve<IArrowRotationCalculator>(
    TYPES.IArrowRotationCalculator
  );

  const debugData: BeatDebugData = {
    type: "beat",
    beatNumber: beatData.beatNumber,
    duration: beatData.duration,
    id: beatData.id,
    letter: beatData.letter || null,
    startPosition: beatData.startPosition || null,
    endPosition: beatData.endPosition || null,
    blueReversal: beatData.blueReversal,
    redReversal: beatData.redReversal,
    isBlank: beatData.isBlank,
    motions: {},
  };

  // Process blue motion if it exists
  if (beatData.motions.blue) {
    debugData.motions.blue = await exportMotionDebugData(
      beatData.motions.blue,
      rotationCalculator,
      pictographData || beatData
    );
  }

  // Process red motion if it exists
  if (beatData.motions.red) {
    debugData.motions.red = await exportMotionDebugData(
      beatData.motions.red,
      rotationCalculator,
      pictographData || beatData
    );
  }

  return debugData;
}

/**
 * Export comprehensive motion data for a beat (with arrows)
 */
async function exportMotionDebugData(
  motion: MotionData,
  rotationCalculator: IArrowRotationCalculator,
  pictographData: PictographData
): Promise<MotionDebugData> {
  // Calculate ARROW rotation using the same calculator used for rendering
  const arrowRotation = await rotationCalculator.calculateRotation(
    motion,
    motion.arrowLocation,
    pictographData
  );

  // Determine the calculation method for debugging
  const rotationMethod = getRotationCalculationMethod(motion);

  return {
    color: motion.color,
    motionType: motion.motionType,
    rotationDirection: motion.rotationDirection,
    startLocation: motion.startLocation,
    endLocation: motion.endLocation,
    turns: motion.turns,
    startOrientation: motion.startOrientation,
    endOrientation: motion.endOrientation,
    propType: motion.propType,
    gridMode: motion.gridMode,
    isVisible: motion.isVisible,

    // Arrow rotation info (clearly labeled as ARROW rotation)
    arrowLocation: motion.arrowLocation,
    arrowRotation,
    arrowRotationMethod: rotationMethod,

    // Placement data
    arrowPlacement: {
      x: motion.arrowPlacementData?.x ?? 0,
      y: motion.arrowPlacementData?.y ?? 0,
      rotation: motion.arrowPlacementData?.rotation,
      isVisible: motion.arrowPlacementData?.isVisible,
    },

    propPlacement: {
      x: motion.propPlacementData?.x ?? 0,
      y: motion.propPlacementData?.y ?? 0,
      rotation: motion.propPlacementData?.rotation,
      isVisible: motion.propPlacementData?.isVisible,
    },

    // Prefloat attributes
    prefloatMotionType: motion.prefloatMotionType || null,
    prefloatRotationDirection: motion.prefloatRotationDirection || null,
  };
}

/**
 * Determine the rotation calculation method for debugging purposes
 */
function getRotationCalculationMethod(motion: MotionData): string {
  const motionType = motion.motionType.toLowerCase();
  const rotationDir = motion.rotationDirection.toLowerCase();

  switch (motionType) {
    case "static": {
      // Check if radial (IN/OUT) or non-radial (CLOCK/COUNTER)
      const orientation = motion.startOrientation.toLowerCase();
      const isRadial = orientation === "in" || orientation === "out";
      const mode = isRadial ? "radial" : "non-radial";
      return `static-${mode}-${rotationDir}`;
    }
    case "pro":
      return `pro-${rotationDir}`;
    case "anti":
      return `anti-${rotationDir}`;
    case "dash": {
      if (rotationDir === "no_rotation") {
        return `dash-no_rotation-${motion.startLocation}-${motion.endLocation}`;
      }
      return `dash-${rotationDir}`;
    }
    case "float": {
      // Float uses handpath direction, not rotation direction
      return `float-handpath-based`;
    }
    default:
      return `unknown-${motionType}`;
  }
}

/**
 * Copy pictograph debug data to clipboard as formatted JSON
 */
export async function copyBeatDebugDataToClipboard(
  beatData: BeatData,
  pictographData?: PictographData
): Promise<void> {
  const debugData = await exportBeatDebugData(beatData, pictographData);
  const jsonString = JSON.stringify(debugData, null, 2);

  try {
    await navigator.clipboard.writeText(jsonString);
    const dataType = debugData.type === "start-position" ? "Start position" : "Beat";
    console.log(`✅ ${dataType} debug data copied to clipboard`);
  } catch (error) {
    console.error("❌ Failed to copy to clipboard:", error);
    // Fallback: log to console
    console.log("Pictograph debug data (fallback):");
    console.log(jsonString);
    throw error;
  }
}
