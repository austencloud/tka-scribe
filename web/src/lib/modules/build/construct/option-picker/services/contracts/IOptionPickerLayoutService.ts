/**
 * Option Picker Layout Service Interface
 *
 * Interface for option picker layout calculations, device detection,
 * and responsive grid configuration specific to the option picker component.
 */

import type { OptionPickerLayoutCalculationParams, OptionPickerLayoutCalculationResult } from "../../domain";

export interface IOptionPickerLayoutService {
  /**
   * Calculate optimal layout configuration for option picker grid
   */
  calculateLayout(
    params: OptionPickerLayoutCalculationParams
  ): OptionPickerLayoutCalculationResult;

  /**
   * Get simple layout metrics (optionsPerRow and optionSize only)
   */
  getSimpleLayout(
    count: number,
    containerWidth: number,
    containerHeight: number
  ): {
    optionsPerRow: number;
    optionSize: number;
  };

  /**
   * Calculate optimal option size for given parameters
   */
  calculateOptimalOptionSize(
    count: number,
    containerWidth: number,
    containerHeight: number,
    targetColumns?: number
  ): number;

  /**
   * Get grid gap for given parameters
   */
  calculateGridGap(
    count: number,
    containerWidth: number,
    containerHeight: number
  ): string;

  /**
   * Determine if mobile layout should be used
   */
  shouldUseMobileLayout(
    containerWidth: number,
    isMobileUserAgent?: boolean
  ): boolean;

  /**
   * Clear any internal caches
   */
  clearCache(): void;
}
