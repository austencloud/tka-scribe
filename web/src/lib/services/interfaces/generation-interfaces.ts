/**
 * Generation Service Interfaces
 *
 * Interfaces for motion generation, sequence generation, and related algorithms.
 * This handles the creation of new motions and sequences based on various criteria.
 */

import type { BeatData, MotionData, SequenceData } from "./domain-types";
import type { GridMode, DifficultyLevel } from "./core-types";

// ============================================================================
// GENERATION OPTIONS
// ============================================================================

export interface GenerationOptions {
  length: number;
  gridMode: GridMode;
  propType: string;
  difficulty: DifficultyLevel;
}

// ============================================================================
// GENERATION SERVICE INTERFACES
// ============================================================================

/**
 * Service for generating complete sequences
 */
export interface ISequenceGenerationService {
  generateSequence(options: GenerationOptions): Promise<SequenceData>;
}

/**
 * Service for generating individual motions
 */
export interface IMotionGenerationService {
  generateMotion(
    color: "blue" | "red",
    options: GenerationOptions,
    previousBeats: BeatData[]
  ): Promise<MotionData>;
}
