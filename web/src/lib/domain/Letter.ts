/**
 * Simple Letter System
 *
 * Letter enum for type safety and IDE highlighting, plus utilities for type identification.
 * No bundled objects - just clean, simple access.
 */

import { LetterType } from "./enums";

/**
 * Letter Enum - all 47 TKA kinetic alphabet letters
 * Shows green in VS Code, provides autocomplete and type safety
 */
export enum Letter {
  // Type1: Dual-Shift (A-V, 22 letters)
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
  G = "G",
  H = "H",
  I = "I",
  J = "J",
  K = "K",
  L = "L",
  M = "M",
  N = "N",
  O = "O",
  P = "P",
  Q = "Q",
  R = "R",
  S = "S",
  T = "T",
  U = "U",
  V = "V",

  // Type2: Shift (8 letters including Greek)
  W = "W",
  X = "X",
  Y = "Y",
  Z = "Z",
  SIGMA = "Σ",
  DELTA = "Δ",
  THETA = "θ",
  OMEGA = "Ω",

  // Type3: Cross-Shift (8 cross variants)
  W_DASH = "W-",
  X_DASH = "X-",
  Y_DASH = "Y-",
  Z_DASH = "Z-",
  SIGMA_DASH = "Σ-",
  DELTA_DASH = "Δ-",
  THETA_DASH = "θ-",
  OMEGA_DASH = "Ω-",

  // Type4: Dash (3 Greek dash letters)
  PHI = "Φ",
  PSI = "Ψ",
  LAMBDA = "Λ",

  // Type5: Dual-Dash (3 dual dash variants)
  PHI_DASH = "Φ-",
  PSI_DASH = "Ψ-",
  LAMBDA_DASH = "Λ-",

  // Type6: Static (3 static Greek letters)
  ALPHA = "α",
  BETA = "β",
  GAMMA = "Γ",
}

/**
 * Get the LetterType for any letter string
 */
export function getLetterType(letter: string): LetterType {
  // Type1: Dual-Shift (A-V)
  if ("ABCDEFGHIJKLMNOPQRSTUV".includes(letter)) {
    return LetterType.TYPE1;
  }

  // Type2: Shift
  if (["W", "X", "Y", "Z", "Σ", "Δ", "θ", "Ω"].includes(letter)) {
    return LetterType.TYPE2;
  }

  // Type3: Cross-Shift
  if (["W-", "X-", "Y-", "Z-", "Σ-", "Δ-", "θ-", "Ω-"].includes(letter)) {
    return LetterType.TYPE3;
  }

  // Type4: Dash
  if (["Φ", "Ψ", "Λ"].includes(letter)) {
    return LetterType.TYPE4;
  }

  // Type5: Dual-Dash
  if (["Φ-", "Ψ-", "Λ-"].includes(letter)) {
    return LetterType.TYPE5;
  }

  // Type6: Static
  if (["α", "β", "Γ"].includes(letter)) {
    return LetterType.TYPE6;
  }

  throw new Error(`Unknown letter: ${letter}`);
}

/**
 * Check if a letter is valid
 */
export function isValidLetter(letter: string): boolean {
  try {
    getLetterType(letter);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get all letters of a specific type
 */
export function getLettersOfType(type: LetterType): string[] {
  return Object.values(Letter).filter(
    (letter) => getLetterType(letter) === type
  );
}
