import type { Dimensions } from "../../domain/types/background-types";
import type { GradientStop } from "../../domain/models/background-models";

/**
 * Service for rendering background elements and calculating particle properties
 */
export interface IBackgroundRenderingService {
  /**
   * Draws a gradient background on the canvas context
   */
  drawGradient(
    ctx: CanvasRenderingContext2D,
    dimensions: Dimensions,
    gradientStops: readonly GradientStop[]
  ): void;

  /**
   * Calculates the appropriate number of particles based on dimensions, density and quality
   */
  calculateParticleCount(
    dimensions: Dimensions,
    baseDensity: number,
    quality: "high" | "medium" | "low"
  ): number;

  /**
   * Determines if seasonal features should be enabled based on current date
   */
  shouldEnableSeasonalFeatures(): boolean;
}
