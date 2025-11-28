import type { Letter } from "../../../foundation/domain/models/Letter";
import { getLetterType } from "../../../foundation/domain/models/Letter";

/**
 * Get the full image path for a letter based on its type
 * Browser will handle URL encoding automatically during fetch
 */
export function getLetterImagePath(letter: Letter): string {
  const letterType = getLetterType(letter);
  const filename = letter;
  // Don't encode - browser will handle encoding automatically
  return `/images/letters_trimmed/${letterType}/${filename}.svg`;
}
