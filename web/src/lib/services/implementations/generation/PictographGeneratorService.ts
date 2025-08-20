/**
 * Pictograph Generator Service - Implementation of IPictographGeneratorService
 *
 * Wraps the FlexiblePictographGenerator to provide the service interface
 * for dependency injection and integration with the TKA system.
 */

import type { PictographData } from "$lib/domain/PictographData";
import type {
  IPictographGeneratorService,
  GenerationParams,
} from "$lib/services/interfaces/pictograph-generator-interfaces";
import { FlexiblePictographGenerator } from "./FlexiblePictographGenerator";

export class PictographGeneratorService implements IPictographGeneratorService {
  private generator: FlexiblePictographGenerator;

  constructor() {
    this.generator = new FlexiblePictographGenerator();
  }

  // ===== PRIMARY LETTER GENERATORS =====

  generateA(_params?: GenerationParams): PictographData[] {
    try {
      return this.generator.generateA();
    } catch (error) {
      console.error("❌ Error generating letter A:", error);
      return [];
    }
  }

  generateB(_params?: GenerationParams): PictographData[] {
    try {
      return this.generator.generateB();
    } catch (error) {
      console.error("❌ Error generating letter B:", error);
      return [];
    }
  }

  generateC(_params?: GenerationParams): PictographData[] {
    try {
      return this.generator.generateC();
    } catch (error) {
      console.error("❌ Error generating letter C:", error);
      return [];
    }
  }

  generateD(_params?: GenerationParams): PictographData[] {
    try {
      return this.generator.generateD();
    } catch (error) {
      console.error("❌ Error generating letter D:", error);
      return [];
    }
  }

  generateE(_params?: GenerationParams): PictographData[] {
    try {
      return this.generator.generateE();
    } catch (error) {
      console.error("❌ Error generating letter E:", error);
      return [];
    }
  }

  generateF(_params?: GenerationParams): PictographData[] {
    try {
      return this.generator.generateF();
    } catch (error) {
      console.error("❌ Error generating letter F:", error);
      return [];
    }
  }

  // ===== GENERIC FINDER =====

  findPictographs(params: GenerationParams): PictographData[] {
    if (!params.letter) {
      console.warn("⚠️ No letter specified in generation params");
      return [];
    }

    const letter = params.letter.toUpperCase();

    switch (letter) {
      case "A":
        return this.generateA(params);
      case "B":
        return this.generateB(params);
      case "C":
        return this.generateC(params);
      case "D":
        return this.generateD(params);
      case "E":
        return this.generateE(params);
      case "F":
        return this.generateF(params);
      default:
        console.warn(
          `⚠️ Letter ${letter} not yet implemented in algorithmic generator`
        );
        return [];
    }
  }

  // ===== VALIDATION HELPERS =====

  getMovementCounts(): Record<string, number> {
    try {
      return this.generator.getMovementCounts();
    } catch (error) {
      console.error("❌ Error getting movement counts:", error);
      return {};
    }
  }

  getAvailableLetters(): string[] {
    return ["A", "B", "C", "D", "E", "F"];
  }

  // ===== UTILITY METHODS =====

  /**
   * Generate all pictographs for all available letters
   */
  generateAll(): Record<string, PictographData[]> {
    const result: Record<string, PictographData[]> = {};

    for (const letter of this.getAvailableLetters()) {
      result[letter] = this.findPictographs({ letter });
    }

    return result;
  }

  /**
   * Get summary statistics for validation
   */
  getGenerationSummary(): {
    availableLetters: string[];
    movementCounts: Record<string, number>;
    totalMovements: number;
  } {
    const availableLetters = this.getAvailableLetters();
    const movementCounts = this.getMovementCounts();
    const totalMovements = Object.values(movementCounts).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      availableLetters,
      movementCounts,
      totalMovements,
    };
  }
}
