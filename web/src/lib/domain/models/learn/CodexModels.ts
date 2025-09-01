/**
 * Codex Models
 *
 * Interface definitions for the codex system.
 */

import { MotionType } from "../../enums/enums";
import type { LetterCategory } from "../../types/CodexTypes";

export interface LetterMapping {
  startPosition: string;
  endPosition: string;
  blueMotionType: MotionType;
  redMotionType: MotionType;
}

export interface CodexLetter {
  letter: string;
  mapping: LetterMapping;
  category: LetterCategory;
  row: number;
  position: number;
}

export interface LetterRow {
  index: number;
  category: LetterCategory;
  letters: string[];
}

export interface CodexConfiguration {
  letters: Record<string, LetterMapping>;
  rows: LetterRow[];
  categories: Record<LetterCategory, string[]>;
}

export interface LessonConfiguration {
  type: string;
  name: string;
  description: string;
  includedCategories: LetterCategory[];
  includedLetters?: string[];
  excludedLetters?: string[];
}
