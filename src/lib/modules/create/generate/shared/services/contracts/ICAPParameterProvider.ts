/**
 * CAP Parameter Provider Interface
 *
 * Provides all parameter calculation and configuration services for CAP (Circular Arrangement Pattern) generation.
 */

import type {
  DifficultyLevel,
  PropContinuity,
  RotationDirections,
  TurnAllocation,
} from "../../domain/models/generate-models";

export interface ICAPParameterProvider {
  /**
   * Get the complementary letter for a given letter
   * @param letter - The input letter
   * @returns The complementary letter
   * @throws Error if no complementary mapping exists for the letter
   */
  getComplementaryLetter(letter: string): string;

  /**
   * Determine rotation directions for blue and red props based on prop continuity
   * @param propContinuity - Continuous or random prop continuity
   * @returns Rotation directions for blue and red props
   */
  determineRotationDirections(propContinuity?: PropContinuity): RotationDirections;

  /**
   * Get allowed turn intensity values for UI display
   * Determines which intensity values should be available based on difficulty level
   * @param level - The difficulty level
   * @returns Array of allowed turn intensity values (empty for Beginner, filtered for other levels)
   */
  getAllowedTurnsForLevel(level: DifficultyLevel): number[];

  /**
   * Allocate turns for blue and red props during sequence generation
   * @param wordLength - Number of beats in the sequence
   * @param level - Difficulty level (1-3)
   * @param maxTurnIntensity - Maximum turn intensity allowed
   * @returns Turn allocations for blue and red props
   */
  allocateTurns(
    wordLength: number,
    level: number,
    maxTurnIntensity: number
  ): TurnAllocation;
}
