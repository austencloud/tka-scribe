export interface ILayoutCalculationService {
  /**
   * Calculate optimal layout for given beat count
   * Returns [columns, rows] matching desktop layout tables
   */
  calculateLayout(
    beatCount: number,
    includeStartPosition: boolean
  ): [number, number];

  /**
   * Calculate image dimensions for layout
   * Returns [width, height] in pixels
   */
  calculateImageDimensions(
    layout: [number, number],
    additionalHeight: number,
    beatScale?: number
  ): [number, number];

  /**
   * Get layout for current beat grid (compatibility method)
   */
  getCurrentBeatGridLayout(beatCount: number): [number, number];

  /**
   * Validate layout parameters
   */
  validateLayout(beatCount: number, includeStartPosition: boolean): boolean;
}