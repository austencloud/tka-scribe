import type { Dimensions } from "$lib/shared/background/shared/domain/types/background-types";

/**
 * Contract for ocean gradient background rendering
 */
export interface IGradientRenderer {
  /**
   * Draw the ocean gradient background
   */
  drawOceanGradient(ctx: CanvasRenderingContext2D, dimensions: Dimensions): void;
}
