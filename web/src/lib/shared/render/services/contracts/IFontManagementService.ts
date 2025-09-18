/**
 * TKA Image Export Rendering Interfaces
 *
 * Service contracts for beat rendering, image composition, canvas management,
 * and visual effects in the TKA image export system.
 */

import type { BeatData, SequenceData } from "$shared";
import type {
    BeatRenderOptions,
    CompositionOptions,
    LayoutData,
    TextRenderOptions,
    UserInfo,
} from "../../domain/models";

// ============================================================================
// RENDERING SERVICES
// ============================================================================





/**
 * Font and typography management service
 * Equivalent to desktop FontMarginHelper
 */
export interface IFontManagementService {
  /**
   * Adjust font size and margin based on beat count
   */
  adjustFontAndMargin(
    baseFontSize: number,
    baseMargin: number,
    beatCount: number,
    beatScale: number
  ): { fontSize: number; margin: number };

  /**
   * Load and validate fonts
   */
  loadFonts(): Promise<void>;

  /**
   * Get font family for element type
   */
  getFontFamily(elementType: "word" | "userInfo" | "difficulty"): string;

  /**
   * Calculate font scaling for responsive text
   */
  calculateFontScaling(
    text: string,
    maxWidth: number,
    maxHeight: number,
    baseFontSize: number
  ): number;
}

// ============================================================================
// SERVICE INTERFACE SYMBOLS
// ============================================================================

export const IBeatRenderingServiceInterface = Symbol.for(
  "IBeatRenderingService"
);
export const ITextRenderingServiceInterface = Symbol.for(
  "ITextRenderingService"
);
export const IImageCompositionServiceInterface = Symbol.for(
  "IImageCompositionService"
);
export const ICanvasManagementServiceInterface = Symbol.for(
  "ICanvasManagementService"
);
export const IReversalDetectionServiceInterface = Symbol.for(
  "IReversalDetectionService"
);
export const IFontManagementServiceInterface = Symbol.for(
  "IFontManagementService"
);
