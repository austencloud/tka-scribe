/**
 * Printable Page Layout Service Contract
 *
 * Service for calculating page layouts and print configurations
 */

import type {
  DPIConfiguration,
  GridCalculationOptions,
  LayoutCalculationRequest,
  LayoutCalculationResult,
  LayoutValidationResult,
  PageDimensions,
  PageLayoutConfig,
  PageMargins,
  Rectangle,
  WordCardGridConfig,
} from "../../domain/models/PageLayout";
import type {
  PageOrientation,
  WordCardPaperSize,
} from "../../domain/types";

export interface IPrintablePageLayoutService {
  /**
   * Calculate page dimensions for given paper size and orientation
   * @param paperSize - Paper size (A4, A3, Letter, etc.)
   * @param orientation - Page orientation (portrait/landscape)
   * @returns Page dimensions in points
   */
  calculatePageDimensions(
    paperSize: WordCardPaperSize,
    orientation: PageOrientation
  ): PageDimensions;

  /**
   * Calculate margins for given paper size
   * @param paperSize - Paper size
   * @returns Page margins in points
   */
  calculateMargins(paperSize: WordCardPaperSize): PageMargins;

  /**
   * Calculate the content area within a page given dimensions and margins
   * @param pageSize - Page dimensions in points
   * @param margins - Page margins
   * @returns Rectangle representing the content area
   */
  calculateContentArea(pageSize: PageDimensions, margins: PageMargins): Rectangle;

  /**
   * Calculate optimal grid configuration for cards on a page
   * @param cardAspectRatio - Width/height ratio of cards
   * @param contentArea - Available content area
   * @param options - Grid calculation options
   * @returns Optimal grid configuration
   */
  calculateOptimalGrid(
    cardAspectRatio: number,
    contentArea: Rectangle,
    options?: Partial<GridCalculationOptions>
  ): WordCardGridConfig;

  /**
   * Calculate layout based on request parameters
   * @param request - Layout calculation request
   * @returns Layout calculation result
   */
  calculateLayout(request: LayoutCalculationRequest): LayoutCalculationResult;

  /**
   * Validate a page layout configuration
   * @param config - Page layout configuration
   * @returns Validation result with errors and warnings
   */
  validateLayout(config: PageLayoutConfig): LayoutValidationResult;

  /**
   * Get DPI configuration for print/screen rendering
   * @returns DPI configuration
   */
  getDPIConfiguration(): DPIConfiguration;

  /**
   * Convert measurements between units
   * @param value - Value to convert
   * @param fromUnit - Source unit
   * @param toUnit - Target unit
   * @returns Converted value
   */
  convertMeasurement(value: number, fromUnit: string, toUnit: string): number;
}
