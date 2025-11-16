/**
 * Navigation Label Service Contract
 *
 * Handles label formatting and abbreviation for navigation components.
 * Provides compact labels for responsive navigation layouts.
 */

export interface INavigationLabelService {
  /**
   * Get the compact/abbreviated version of a label
   * @param fullLabel The full label text (e.g., "Settings", "Generate")
   * @returns Abbreviated label for compact display
   */
  getCompactLabel(fullLabel: string): string;

  /**
   * Get the full version of a label
   * @param label The label text
   * @returns Full label text
   */
  getFullLabel(label: string): string;
}
