/**
 * Positioning and Placement Service Interfaces
 *
 * Interfaces for arrow positioning, placement calculations, and coordinate systems.
 * This handles all spatial calculations and arrow placement logic.
 */

import type { ArrowData, MotionData, PictographData } from "./domain-types";
import type { ArrowPosition, GridData, GridMode } from "./core-types";
import type { MotionType, Location } from "./domain-types";

// ============================================================================
// ARROW POSITIONING SERVICE
// ============================================================================

/**
 * Main service for calculating arrow positions and rotations
 */
export interface IArrowPositioningService {
  calculateArrowPosition(
    arrowData: ArrowData,
    pictographData: PictographData,
    gridData: GridData
  ): Promise<ArrowPosition>;

  calculateAllArrowPositions(
    pictographData: PictographData,
    gridData: GridData
  ): Promise<Map<string, ArrowPosition>>;

  calculateRotationAngle(
    motion: MotionData,
    location: Location,
    isMirrored: boolean
  ): number;

  shouldMirrorArrow(motion: MotionData): boolean;
}

// ============================================================================
// ARROW PLACEMENT DATA SERVICE
// ============================================================================

/**
 * Service for managing arrow placement data and adjustments
 */
export interface IArrowPlacementDataService {
  getDefaultAdjustment(
    motionType: MotionType,
    placementKey: string,
    turns: number | string,
    gridMode: GridMode
  ): Promise<{ x: number; y: number }>;

  getAvailablePlacementKeys(
    motionType: MotionType,
    gridMode: GridMode
  ): Promise<string[]>;

  isLoaded(): boolean;
  loadPlacementData(): Promise<void>;
}

// ============================================================================
// ARROW PLACEMENT KEY SERVICE
// ============================================================================

/**
 * Service for generating and managing placement keys
 */
export interface IArrowPlacementKeyService {
  generatePlacementKey(
    motionData: MotionData,
    pictographData: PictographData,
    availableKeys: string[]
  ): string;

  generateBasicKey(motionType: MotionType): string;
}

// ============================================================================
// PROP RENDERING SERVICE
// ============================================================================

/**
 * Service for rendering and positioning props
 */
export interface IPropRenderingService {
  renderProp(
    propType: string,
    color: "blue" | "red",
    motionData: MotionData,
    gridMode: GridMode
  ): Promise<SVGElement>;

  calculatePropPosition(
    motionData: MotionData,
    color: "blue" | "red",
    gridMode: GridMode
  ): Promise<{ x: number; y: number; rotation: number }>;

  loadPropSVG(propType: string, color: "blue" | "red"): Promise<string>;

  getSupportedPropTypes(): string[];
}
