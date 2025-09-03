/**
 * Letter Mapping Repository Implementation
 *
 * Service implementation for letter mapping management and codex configuration.
 * Handles letter mappings, categories, and validation.
 */

import {
  createLetterMapping,
  MotionType,
  type CodexConfiguration,
  type LetterCategory,
  type LetterMapping,
  type LetterRow,
} from "$domain";
import type { ILetterMappingRepository } from "$services";
import { injectable } from "inversify";

@injectable()
export class LetterMappingRepository implements ILetterMappingRepository {
  private configuration: CodexConfiguration | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Load codex configuration
      await this.loadCodexConfiguration();
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize LetterMappingRepository:", error);
      throw error;
    }
  }

  getLetterMapping(letter: string): LetterMapping | null {
    if (!this.initialized || !this.configuration) {
      console.warn(
        "LetterMappingRepository not initialized. Call initialize() first."
      );
      return null;
    }

    // Find letter mapping in configuration
    const letterMapping = this.configuration.letters[letter];
    if (letterMapping) {
      return letterMapping;
    }

    return null;
  }

  getLettersByCategory(category: LetterCategory): string[] {
    if (!this.initialized || !this.configuration) {
      console.warn(
        "LetterMappingRepository not initialized. Call initialize() first."
      );
      return [];
    }

    const letters: string[] = [];
    const categoryLetters = this.configuration.categories[category];
    if (categoryLetters) {
      return categoryLetters;
    }

    return letters;
  }

  getLetterRows(): LetterRow[] {
    if (!this.initialized || !this.configuration) {
      console.warn(
        "LetterMappingRepository not initialized. Call initialize() first."
      );
      return [];
    }

    return this.configuration.rows;
  }

  getAllLetters(): string[] {
    if (!this.initialized || !this.configuration) {
      console.warn(
        "LetterMappingRepository not initialized. Call initialize() first."
      );
      return [];
    }

    const letters: string[] = [];
    for (const letterKey in this.configuration.letters) {
      letters.push(letterKey);
    }

    return letters;
  }

  isValidLetter(letter: string): boolean {
    return this.getLetterMapping(letter) !== null;
  }

  private async loadCodexConfiguration(): Promise<void> {
    try {
      // Load from actual codex configuration file
      const response = await fetch("/data/learn/letter-mappings.json");
      if (!response.ok) {
        throw new Error(`Failed to fetch letter mappings: ${response.status}`);
      }

      const data = await response.json();

      // Convert the JSON data to our internal format
      const letters: Record<string, LetterMapping> = {};
      for (const [letter, mapping] of Object.entries(data.letters)) {
        const letterData = mapping as any;
        letters[letter] = createLetterMapping({
          startPosition: letterData.startPosition,
          endPosition: letterData.endPosition,
          blueMotionType: this.mapMotionString(letterData.blueMotion),
          redMotionType: this.mapMotionString(letterData.redMotion),
        });
      }

      this.configuration = {
        version: "1.0.0",
        letters,
        rows: data.rows,
        categories: data.categories,
      };

      console.log(
        `✅ Loaded ${Object.keys(letters).length} letters from codex configuration`
      );
    } catch (error) {
      console.error("Failed to load codex configuration:", error);
      throw error;
    }
  }

  private mapMotionString(motionString: string): MotionType {
    switch (motionString.toLowerCase()) {
      case "pro":
        return MotionType.PRO;
      case "anti":
        return MotionType.ANTI;
      case "static":
        return MotionType.STATIC;
      case "dash":
        return MotionType.DASH;
      default:
        console.warn(`Unknown motion type: ${motionString}, defaulting to PRO`);
        return MotionType.PRO;
    }
  }
}
