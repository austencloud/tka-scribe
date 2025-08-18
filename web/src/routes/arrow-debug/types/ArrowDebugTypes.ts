/**
 * Arrow Debug Type Definitions
 *
 * Extracted from arrow-debug-state.svelte.ts for better modularity
 */

import type { ArrowData, MotionData, PictographData } from "$lib/domain";
import { MotionColor, Location } from "$lib/domain";
import type { Point } from "$lib/services/positioning/types";

export interface ArrowPositioningDebugData {
  // Input data
  pictographData: PictographData | null;
  motionData: MotionData | null;
  arrowData: ArrowData | null;

  // Step 1: Location calculation
  calculatedLocation: Location | null;
  locationDebugInfo: {
    motionType: string;
    startOri: string;
    endOri: string;
    calculationMethod: string;
  } | null;

  // Step 2: Initial position from coordinate system
  initialPosition: Point | null;
  coordinateSystemDebugInfo: {
    sceneCenter: Point;
    sceneDimensions: [number, number];
    handPoints: Record<Location, Point>;
    layer2Points: Record<Location, Point>;
    usedCoordinateSet: "hand_points" | "layer2_points" | "center";
    coordinateSystemType: string;
  } | null;

  // Step 3: Default adjustment calculation
  defaultAdjustment: Point | null;
  defaultAdjustmentDebugInfo: {
    placementKey: string;
    turns: number | string;
    motionType: string;
    gridMode: string;
    adjustmentSource: "default_placement" | "calculated" | "fallback";
    rawPlacementData: Record<string, unknown>;
  } | null;

  // Step 4: Special adjustment calculation
  specialAdjustment: Point | null;
  specialAdjustmentDebugInfo: {
    letter: string;
    oriKey: string;
    turnsTuple: string;
    arrowColor: string;
    specialPlacementFound: boolean;
    specialPlacementData: Record<string, unknown>;
    adjustmentSource: "special_placement" | "none";
  } | null;

  // Step 5: Directional tuple processing
  tupleProcessedAdjustment: Point | null;
  tupleProcessingDebugInfo: {
    baseAdjustment: Point;
    quadrantIndex: number;
    directionalTuples: Array<[number, number]>;
    selectedTuple: [number, number];
    transformationMethod: string;
  } | null;

  // Final result
  finalPosition: Point | null;
  finalRotation: number;

  // Error tracking
  errors: Array<{
    step: string;
    error: string;
    timestamp: number;
  }>;

  // Performance tracking
  timing: {
    totalDuration: number;
    stepDurations: Record<string, number>;
  } | null;
}

export interface ArrowDebugState {
  // Current pictograph and arrow selection
  selectedPictograph: PictographData | null;
  selectedArrowColor: MotionColor;
  availablePictographs: PictographData[];

  // Debug modes
  stepByStepMode: boolean;
  currentStep: number;
  maxSteps: number;

  // Coordinate system visualization
  showCoordinateGrid: boolean;
  showHandPoints: boolean;
  showLayer2Points: boolean;
  showAdjustmentVectors: boolean;

  // Current positioning data for selected arrow
  currentDebugData: ArrowPositioningDebugData;

  // UI state
  isCalculating: boolean;
  autoUpdate: boolean;

  // Debug panel expansion
  expandedSections: Set<string>;

  // Computed values
  currentMotionData: MotionData | null;
  currentArrowData: ArrowData | null;

  // Methods
  calculateFullPositioning: () => Promise<void>;
  loadSamplePictographs: () => Promise<void>;
  toggleSection: (section: string) => void;
}

export interface DebugStepTiming {
  totalDuration: number;
  stepDurations: Record<string, number>;
}

export interface DebugError {
  step: string;
  error: string;
  timestamp: number;
}
