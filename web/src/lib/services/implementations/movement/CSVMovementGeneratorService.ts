/**
 * CSV-Based Movement Generator Service - Uses actual CSV data
 *
 * Replaces pattern-based generation with direct CSV data parsing.
 * Generates exactly the movements defined in BoxPictographDataframe.csv.
 * Provides simple AI-friendly functions like generateA(), generateB(), etc.
 */

import type { IMovementGeneratorService } from "../../interfaces/generation-interfaces";
import type {
  MovementData,
  MovementPattern,
  MovementSet,
} from "$lib/domain/MovementData";
import {
  createMovementSet,
  createMovementPattern,
} from "$lib/domain/MovementData";
import { CSVMovementLoaderService } from "../movement/CSVMovementLoaderService";
import {
  Timing,
  Direction,
  MotionType,
  RotationDirection,
} from "$lib/domain/enums";

export class CSVMovementGeneratorService implements IMovementGeneratorService {
  private readonly movementCache = new Map<string, MovementSet>();
  private readonly csvLoader: CSVMovementLoaderService;

  constructor() {
    this.csvLoader = new CSVMovementLoaderService();
  }

  /**
   * Generate movement set from pattern (legacy method)
   */
  generateMovementSet(pattern: MovementPattern): MovementSet {
    // For CSV-based approach, we ignore the pattern and get movements from CSV
    const movementSet = this.getMovementSetByLetter(pattern.letter);
    return movementSet || this.createEmptyMovementSet(pattern.letter);
  }

  // ========================================
  // GROUP 1: Standard Letters A, B, C (VALIDATION TARGET)
  // ========================================

  generateA(): MovementSet {
    return this.generateFromCSV("A");
  }

  generateB(): MovementSet {
    return this.generateFromCSV("B");
  }

  generateC(): MovementSet {
    return this.generateFromCSV("C");
  }

  // ========================================
  // GROUP 2: Cross-System Letters D, E, F (VALIDATION TARGET)
  // ========================================

  generateD(): MovementSet {
    return this.generateFromCSV("D");
  }

  generateE(): MovementSet {
    return this.generateFromCSV("E");
  }

  generateF(): MovementSet {
    return this.generateFromCSV("F");
  }

  // ========================================
  // GROUP 3: Together Timing G, H, I
  // ========================================

  generateG(): MovementSet {
    return this.generateFromCSV("G");
  }

  generateH(): MovementSet {
    return this.generateFromCSV("H");
  }

  generateI(): MovementSet {
    return this.generateFromCSV("I");
  }

  // ========================================
  // REMAINING LETTERS (TO BE IMPLEMENTED)
  // ========================================

  generateJ(): MovementSet {
    return this.generateFromCSV("J");
  }
  generateK(): MovementSet {
    return this.generateFromCSV("K");
  }
  generateL(): MovementSet {
    return this.generateFromCSV("L");
  }
  generateM(): MovementSet {
    return this.generateFromCSV("M");
  }
  generateN(): MovementSet {
    return this.generateFromCSV("N");
  }
  generateO(): MovementSet {
    return this.generateFromCSV("O");
  }
  generateP(): MovementSet {
    return this.generateFromCSV("P");
  }
  generateQ(): MovementSet {
    return this.generateFromCSV("Q");
  }
  generateR(): MovementSet {
    return this.generateFromCSV("R");
  }
  generateS(): MovementSet {
    return this.generateFromCSV("S");
  }
  generateT(): MovementSet {
    return this.generateFromCSV("T");
  }
  generateU(): MovementSet {
    return this.generateFromCSV("U");
  }
  generateV(): MovementSet {
    return this.generateFromCSV("V");
  }
  generateW(): MovementSet {
    return this.generateFromCSV("W");
  }
  generateX(): MovementSet {
    return this.generateFromCSV("X");
  }
  generateY(): MovementSet {
    return this.generateFromCSV("Y");
  }
  generateZ(): MovementSet {
    return this.generateFromCSV("Z");
  }

  // Greek letters
  generateSigma(): MovementSet {
    return this.generateFromCSV("Σ");
  }
  generateDelta(): MovementSet {
    return this.generateFromCSV("Δ");
  }
  generateTheta(): MovementSet {
    return this.generateFromCSV("θ");
  }
  generateOmega(): MovementSet {
    return this.generateFromCSV("Ω");
  }
  generatePhi(): MovementSet {
    return this.generateFromCSV("Φ");
  }
  generatePsi(): MovementSet {
    return this.generateFromCSV("Ψ");
  }
  generateLambda(): MovementSet {
    return this.generateFromCSV("Λ");
  }
  generateAlpha(): MovementSet {
    return this.generateFromCSV("α");
  }
  generateBeta(): MovementSet {
    return this.generateFromCSV("β");
  }
  generateGamma(): MovementSet {
    return this.generateFromCSV("Γ");
  }

  // Dash variants
  generateWDash(): MovementSet {
    return this.generateFromCSV("W-");
  }
  generateXDash(): MovementSet {
    return this.generateFromCSV("X-");
  }
  generateYDash(): MovementSet {
    return this.generateFromCSV("Y-");
  }
  generateZDash(): MovementSet {
    return this.generateFromCSV("Z-");
  }
  generateSigmaDash(): MovementSet {
    return this.generateFromCSV("Σ-");
  }
  generateDeltaDash(): MovementSet {
    return this.generateFromCSV("Δ-");
  }
  generateThetaDash(): MovementSet {
    return this.generateFromCSV("θ-");
  }
  generateOmegaDash(): MovementSet {
    return this.generateFromCSV("Ω-");
  }
  generatePhiDash(): MovementSet {
    return this.generateFromCSV("Φ-");
  }
  generatePsiDash(): MovementSet {
    return this.generateFromCSV("Ψ-");
  }
  generateLambdaDash(): MovementSet {
    return this.generateFromCSV("Λ-");
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  getAllMovementSets(): MovementSet[] {
    const letters = this.csvLoader.getAvailableLetters();
    const movementSets: MovementSet[] = [];

    for (const letter of letters) {
      const movementSet = this.generateFromCSV(letter);
      movementSets.push(movementSet);
    }

    return movementSets;
  }

  getMovementSetByLetter(letter: string): MovementSet | undefined {
    try {
      return this.generateFromCSV(letter);
    } catch (error) {
      console.warn(
        `Failed to generate movement set for letter ${letter}:`,
        error
      );
      return undefined;
    }
  }

  /**
   * Get movement counts for validation
   */
  getMovementCounts(): Record<string, number> {
    return this.csvLoader.getMovementCounts();
  }

  // ========================================
  // PRIVATE HELPERS
  // ========================================

  /**
   * Core method: Generate MovementSet from CSV data
   */
  private generateFromCSV(letter: string): MovementSet {
    const cacheKey = `csv_${letter}`;

    if (this.movementCache.has(cacheKey)) {
      const cached = this.movementCache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      const movements = this.csvLoader.getMovementsForLetter(letter);

      // Create a default pattern for the letter
      const pattern = createMovementPattern({
        letter,
        timing: Timing.SPLIT,
        direction: Direction.SAME,
        positionSystem: "alpha",
        baseBlueMotion: MotionType.PRO,
        baseRedMotion: MotionType.PRO,
        baseBlueRotation: RotationDirection.CLOCKWISE,
        baseRedRotation: RotationDirection.CLOCKWISE,
      });

      const movementSet = createMovementSet({
        letter,
        movements,
        pattern,
      });

      this.movementCache.set(cacheKey, movementSet);
      return movementSet;
    } catch (error) {
      console.error(`Failed to generate movement set for ${letter}:`, error);
      // Return empty movement set instead of throwing
      return this.createEmptyMovementSet(letter);
    }
  }

  /**
   * Create a pattern from a movement (for compatibility)
   * TODO: Remove if not needed
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private createPatternFromMovement(movement: MovementData): MovementPattern {
    return createMovementPattern({
      letter: movement.letter,
      timing: movement.timing,
      direction: movement.direction,
      positionSystem: this.determinePositionSystem(movement.startPosition),
      baseBlueMotion: movement.blueHand.motionType,
      baseRedMotion: movement.redHand.motionType,
      baseBlueRotation: movement.blueHand.rotationDirection,
      baseRedRotation: movement.redHand.rotationDirection,
    });
  }

  /**
   * Determine position system from grid position
   */
  private determinePositionSystem(
    position: import("$lib/domain/enums").GridPosition
  ): "alpha" | "beta" | "gamma" {
    const posStr = position.toString().toLowerCase();
    if (posStr.includes("alpha")) return "alpha";
    if (posStr.includes("beta")) return "beta";
    if (posStr.includes("gamma")) return "gamma";
    return "alpha"; // fallback
  }

  /**
   * Create empty movement set for missing letters
   */
  private createEmptyMovementSet(letter: string): MovementSet {
    const pattern = createMovementPattern({ letter });
    return createMovementSet({
      letter,
      movements: [],
      pattern,
    });
  }
}
