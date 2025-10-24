// Simple type for image render options
export interface ImageRenderOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export interface IDimensionCalculationService {
  /**
   * Determine additional heights for text areas
   * Returns [topHeight, bottomHeight]
   */
  determineAdditionalHeights(
    options: ImageRenderOptions,
    beatCount: number,
    beatScale: number
  ): [number, number];

  /**
   * Calculate beat size with scaling
   */
  calculateScaledBeatSize(baseSize: number, scale: number): number;

  /**
   * Calculate margin with scaling
   */
  calculateScaledMargin(baseMargin: number, scale: number): number;

  /**
   * Validate dimension parameters
   */
  validateDimensions(
    beatCount: number,
    beatScale: number,
    options: ImageRenderOptions
  ): boolean;

  /**
   * Get text scaling factors based on beat count
   * Matches desktop FontMarginHelper patterns
   */
  getTextScalingFactors(beatCount: number): {
    fontScale: number;
    marginScale: number;
    description: string;
  };

  /**
   * Calculate difficulty badge area
   * Based on desktop implementation
   */
  calculateDifficultyBadgeArea(additionalHeightTop: number): {
    size: number;
    inset: number;
    available: boolean;
  };
}
