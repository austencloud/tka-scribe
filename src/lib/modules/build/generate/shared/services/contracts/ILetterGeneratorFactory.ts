import type { ILetterGenerator } from "./ILetterGenerator";

export interface ILetterGeneratorFactory {
  /**
   * Create generator for the specified letter
   */
  createGenerator(letter: string): ILetterGenerator | null;

  /**
   * Get all supported letters
   */
  getSupportedLetters(): string[];
}

