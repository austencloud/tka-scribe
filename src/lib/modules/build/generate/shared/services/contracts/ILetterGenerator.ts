import type { PictographData } from "$shared";

export interface ILetterGenerator {
  /**
   * The letter this generator handles
   */
  readonly letter: string;

  /**
   * Generate movement set for this letter
   */
  generate(): PictographData;
}

