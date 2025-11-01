/**
 * Letter Classification Service Contract
 *
 * Determines letter types and orientation characteristics.
 */

import type { PictographData } from "$shared";

export interface ILetterClassificationService {
  /**
   * Check if letter is HYBRID (uses motion type keys for special placement).
   * HYBRID letters: C, F, I, L, O, R, U, V, W, X, Y, Z, W-, X-, Y-, Z-,
   * Σ, Δ, θ, Ω, Σ-, Δ-, θ-, Ω-, Φ, Ψ, Λ
   *
   * @param letter Letter to check
   * @returns true if letter is HYBRID
   */
  isHybridLetter(letter: string): boolean;

  /**
   * Check if pictograph starts from standard orientation.
   * Standard = both motions on same layer (both layer1 or both layer2).
   *
   * @param pictographData Pictograph data
   * @returns true if standard orientation
   */
  startsFromStandardOrientation(pictographData: PictographData): boolean;
}
