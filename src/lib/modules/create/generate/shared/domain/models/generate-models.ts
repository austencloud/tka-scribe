/**
 * Generation Service Interfaces - Complete interface definitions
 *
 * Complete interfaces for motion generation, sequence generation, and related algorithms.
 * Updated to match exact legacy generation parameters and options.
 */
// ============================================================================
// GENERATION OPTIONS
// ============================================================================
import { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
import type { CAPType, SliceSize } from "../../../circular/domain/models/circular-models";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { Letter } from "$lib/shared/foundation/domain/models/Letter";

// ============================================================================
// DATA CONTRACTS (Domain Models)
// ============================================================================

export interface GenerationOptions {
  mode?: GenerationMode | undefined;
  length: number;
  gridMode: GridMode;
  propType: PropType;
  difficulty: DifficultyLevel;
  propContinuity?: PropContinuity | undefined;
  turnIntensity?: number | undefined;
  sliceSize?: SliceSize | undefined; // For circular generation
  capType?: CAPType | undefined; // CAP type for circular generation
}

export interface LetterDerivationResult {
  letter: Letter | null;
  confidence: "exact" | "partial" | "none";
  matchedParameters: string[];
}

export interface PictographOperation {
  type: "add" | "remove" | "modify" | "reorder";
  targetIndex?: number;
  data?: Record<string, unknown>;
}
// NOTE: SliceSize and CAPType are now in circular/domain/models/circular-models.ts
// Import from there if needed

// Fundamental CAP components that can be combined
export enum CAPComponent {
  ROTATED = "rotated",
  MIRRORED = "mirrored",
  SWAPPED = "swapped",
  INVERTED = "inverted",
}

/**
 * Display metadata for CAP component UI
 * Visual representation only - descriptions handled by CAPExplanationTextGenerator service
 */
export interface CAPComponentInfo {
  component: CAPComponent;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
}

export enum PositionSystem {
  ALPHA_TO_ALPHA = "alpha_to_alpha",
  ALPHA_TO_BETA = "alpha_to_beta",
  ALPHA_TO_GAMMA = "alpha_to_gamma",
  BETA_TO_ALPHA = "beta_to_alpha",
  BETA_TO_BETA = "beta_to_beta",
  BETA_TO_GAMMA = "beta_to_gamma",
  GAMMA_TO_ALPHA = "gamma_to_alpha",
  GAMMA_TO_BETA = "gamma_to_beta",
  GAMMA_TO_GAMMA = "gamma_to_gamma",
}

export enum DifficultyLevel {
  BEGINNER = "beginner",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
}

export enum PropContinuity {
  CONTINUOUS = "continuous",
  RANDOM = "random",
}

export enum GenerationMode {
  FREEFORM = "freeform",
  CIRCULAR = "circular",
}

// ============================================================================
// CAP PARAMETER TYPES
// ============================================================================

/**
 * Rotation directions for blue and red props
 * Used during continuous prop generation to determine rotation behavior
 */
export interface RotationDirections {
  blueRotationDirection: string;
  redRotationDirection: string;
}

// TurnAllocation is exported from services/contracts/ITurnAllocator.ts
// Re-exporting here for backwards compatibility
export type { TurnAllocation } from "../../services/contracts/ITurnAllocator";
