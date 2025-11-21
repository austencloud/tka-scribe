/**
 * Letter Classification Service
 *
 * Determines letter types and orientation characteristics for special placement logic.
 */

import { injectable } from "inversify";

import type { PictographData } from "$shared";

import type { ILetterClassificationService } from "../contracts/ILetterClassificationService";

@injectable()
export class LetterClassificationService
  implements ILetterClassificationService
{
  private static readonly HYBRID_LETTERS = [
    "C",
    "F",
    "I",
    "L",
    "O",
    "R",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "W-",
    "X-",
    "Y-",
    "Z-",
    "Σ",
    "Δ",
    "θ",
    "Ω",
    "Σ-",
    "Δ-",
    "θ-",
    "Ω-",
    "Φ",
    "Ψ",
    "Λ",
  ];

  private static readonly IN = "in";
  private static readonly OUT = "out";

  /**
   * Check if letter is HYBRID (uses motion type keys for special placement)
   */
  isHybridLetter(letter: string): boolean {
    return LetterClassificationService.HYBRID_LETTERS.includes(letter);
  }

  /**
   * Check if pictograph starts from standard orientation (both motions same layer)
   */
  startsFromStandardOrientation(pictographData: PictographData): boolean {
    try {
      const blueMotion = pictographData.motions.blue;
      const redMotion = pictographData.motions.red;

      if (!blueMotion || !redMotion) {
        return true; // Default to standard
      }

      const blueStart = blueMotion.startOrientation || "";
      const redStart = redMotion.startOrientation || "";

      // Standard if both are layer1 (IN/OUT) or both are layer2 (CLOCK/COUNTER)
      const blueLayer1 = [
        LetterClassificationService.IN,
        LetterClassificationService.OUT,
      ].includes(blueStart);
      const redLayer1 = [
        LetterClassificationService.IN,
        LetterClassificationService.OUT,
      ].includes(redStart);

      return blueLayer1 === redLayer1; // Same layer = standard orientation
    } catch {
      return true; // Default to standard
    }
  }
}
