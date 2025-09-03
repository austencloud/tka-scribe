/**
 * Option Picker Layout Domain Types
 *
 * Types for option picker layout calculations, grid configuration,
 * and responsive layout management specific to the construct tab.
 */

// Import shared layout types from the canonical location

// Re-export for compatibility
export type {
  OptionPickerGridConfiguration,
  OptionPickerLayoutCalculationParams
} from "./OptionPickerLayoutModels";

// ============================================================================
// UNIQUE OPTION PICKER LAYOUT TYPES (not duplicated elsewhere)
// ============================================================================

export interface OptionPickerLayoutDimensions {
  width: number;
  height: number;
}
