import type { CAPType } from "../../../circular/domain/models/circular-models";
import type { CAPComponent } from "../../domain/models/generate-models";

/**
 * Service responsible for CAP type parsing and generation logic
 *
 * Extracted from CAPCard.svelte to separate pure algorithmic business logic
 * from UI component concerns, following Single Responsibility Principle.
 *
 * This service:
 * - Parses CAP type enum values into component sets
 * - Generates CAP type enums from component combinations
 * - Formats CAP types for display in UI
 *
 * Does NOT:
 * - Manage UI state (that's the component's job)
 * - Handle user interaction (component responsibility)
 * - Render component markup
 */
export interface ICAPTypeService {
  /**
   * Parse a CAP type enum value into its constituent components
   *
   * Analyzes the CAP type string to extract which components are active.
   * For example:
   * - "strict_rotated" -> [ROTATED]
   * - "mirrored_inverted" -> [MIRRORED, INVERTED]
   * - "mirrored_inverted_rotated" -> [MIRRORED, INVERTED, ROTATED]
   *
   * @param capType - The CAP type enum to parse
   * @returns Set of components that make up this CAP type
   */
  parseComponents(capType: CAPType): Set<CAPComponent>;

  /**
   * Check if a component combination has been implemented
   *
   * Determines whether the selected combination of CAP components
   * has corresponding backend logic implemented. Used to show
   * "Coming Soon" messages for unimplemented combinations.
   *
   * @param components - Set of CAP components to check
   * @returns true if the combination is fully implemented
   */
  isImplemented(components: Set<CAPComponent>): boolean;

  /**
   * Generate a CAP type enum from a set of selected components
   *
   * Uses complex conditional logic to map component combinations to the
   * correct CAP type enum value. Handles:
   * - Single components (strict types)
   * - Two-component combinations
   * - Three-component combinations
   * - Fallback to STRICT_ROTATED for invalid combinations
   *
   * @param components - Set of CAP components to combine
   * @returns The corresponding CAP type enum
   */
  generateCAPType(components: Set<CAPComponent>): CAPType;

  /**
   * Format a CAP type for display in the UI
   *
   * Converts enum format to human-readable text:
   * - Replaces underscores with spaces
   * - Title-cases each word
   * - Truncates long names with ellipsis for compact display
   *
   * Examples:
   * - "strict_rotated" -> "Strict Rotated"
   * - "mirrored_inverted_rotated" -> "Mirrored + 2 more"
   *
   * @param capType - The CAP type to format
   * @returns Human-readable display string
   */
  formatForDisplay(capType: CAPType): string;
}
