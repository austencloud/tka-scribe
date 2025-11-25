/**
 * CAP Parameter Provider
 *
 * Provides all parameter calculation and configuration services for CAP (Circular Arrangement Pattern) generation.
 * Consolidates complementary letter mapping, rotation direction determination, and turn intensity allocation.
 *
 * Replaces:
 * - ComplementaryLetterService
 * - RotationDirectionService
 * - TurnIntensityLevelService
 * - TurnIntensityManagerService
 */

import { RotationDirection } from "$shared/pictograph/shared/domain/enums/pictograph-enums";
import { TYPES } from "$shared/inversify/types";
import { inject, injectable } from "inversify";
import { getComplementaryLetter } from "../../../circular/domain/constants/strict-cap-position-maps";
import {
  DifficultyLevel,
  PropContinuity,
  RotationDirections,
  TurnAllocation,
} from "../../domain/models/generate-models";
import type { IPictographFilterService } from "../contracts/IPictographFilterService";
import type { ICAPParameterProvider } from "../contracts/ICAPParameterProvider";

@injectable()
export class CAPParameterProvider implements ICAPParameterProvider {
  constructor(
    @inject(TYPES.IPictographFilterService)
    private pictographFilterService: IPictographFilterService
  ) {}

  // ============================================================================
  // COMPLEMENTARY LETTER OPERATIONS
  // ============================================================================

  /**
   * Get the complementary letter for a given letter
   * @param letter - The input letter
   * @returns The complementary letter
   * @throws Error if no complementary mapping exists for the letter
   */
  getComplementaryLetter(letter: string): string {
    return getComplementaryLetter(letter);
  }

  // ============================================================================
  // LEVEL CONVERSION OPERATIONS
  // ============================================================================

  /**
   * Convert DifficultyLevel enum to numeric value
   */
  difficultyToNumber(level: DifficultyLevel): number {
    switch (level) {
      case DifficultyLevel.BEGINNER:
        return 1;
      case DifficultyLevel.INTERMEDIATE:
        return 2;
      case DifficultyLevel.ADVANCED:
        return 3;
      default:
        return 2; // Default to intermediate if unknown
    }
  }

  /**
   * Convert numeric value to DifficultyLevel enum
   */
  numberToDifficulty(level: number): DifficultyLevel {
    switch (level) {
      case 1:
        return DifficultyLevel.BEGINNER;
      case 2:
        return DifficultyLevel.INTERMEDIATE;
      case 3:
        return DifficultyLevel.ADVANCED;
      default:
        return DifficultyLevel.INTERMEDIATE; // Default to intermediate for invalid values
    }
  }

  // ============================================================================
  // ROTATION DIRECTION OPERATIONS
  // ============================================================================

  /**
   * Determine rotation directions for blue and red props based on prop continuity
   * @param propContinuity - Continuous or random prop continuity
   * @returns Rotation directions for blue and red props
   */
  determineRotationDirections(propContinuity?: PropContinuity): RotationDirections {
    if (propContinuity === PropContinuity.CONTINUOUS) {
      return {
        blueRotationDirection: this.pictographFilterService.selectRandom([
          RotationDirection.CLOCKWISE,
          RotationDirection.COUNTER_CLOCKWISE,
        ]),
        redRotationDirection: this.pictographFilterService.selectRandom([
          RotationDirection.CLOCKWISE,
          RotationDirection.COUNTER_CLOCKWISE,
        ]),
      };
    }

    return { blueRotationDirection: "", redRotationDirection: "" };
  }

  // ============================================================================
  // TURN INTENSITY OPERATIONS
  // ============================================================================

  /**
   * Get allowed turn intensity values for UI display
   * Determines which intensity values should be available based on difficulty level
   * @param level - The difficulty level
   * @returns Array of allowed turn intensity values (empty for Beginner, filtered for other levels)
   */
  getAllowedTurnsForLevel(level: DifficultyLevel): number[] {
    switch (level) {
      case DifficultyLevel.BEGINNER:
        return []; // No turns for level 1
      case DifficultyLevel.INTERMEDIATE:
        return [1.0, 2.0, 3.0]; // Whole numbers for level 2
      case DifficultyLevel.ADVANCED:
        return [0.5, 1.0, 1.5, 2.0, 2.5, 3.0]; // All values for level 3 (excluding 0 and "fl" for UI)
      default:
        return [1.0, 2.0, 3.0];
    }
  }

  /**
   * Allocate turns for blue and red props during sequence generation
   * Direct port from legacy TurnIntensityManager.allocate_turns_for_blue_and_red()
   *
   * @param wordLength - Number of beats in the sequence
   * @param level - Difficulty level (1-3)
   * @param maxTurnIntensity - Maximum turn intensity allowed
   * @returns Turn allocations for blue and red props
   */
  allocateTurns(
    wordLength: number,
    level: number,
    maxTurnIntensity: number
  ): TurnAllocation {
    let possibleTurns: (number | "fl")[];

    // Exact logic from legacy
    if (level === 2) {
      possibleTurns = [0, 1, 2, 3];
    } else if (level === 3) {
      possibleTurns = [0, 0.5, 1, 1.5, 2, 2.5, 3, "fl"];
    } else {
      possibleTurns = [0];
    }

    const turnsBlue: (number | "fl")[] = [];
    const turnsRed: (number | "fl")[] = [];

    for (let i = 0; i < wordLength; i++) {
      // Filter possible turns by max intensity - exact logic from legacy
      const validTurns = possibleTurns.filter((t) => {
        if (t === "fl") return true;
        return typeof t === "number" && t <= maxTurnIntensity;
      });

      // Random selection - exact logic from legacy
      const turnBlue = this.randomChoice(validTurns);
      const turnRed = this.randomChoice(validTurns);

      turnsBlue.push(turnBlue);
      turnsRed.push(turnRed);
    }

    return {
      blue: turnsBlue,
      red: turnsRed,
    };
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private randomChoice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error("Cannot choose from empty array");
    }
    return array[Math.floor(Math.random() * array.length)]!;
  }
}
