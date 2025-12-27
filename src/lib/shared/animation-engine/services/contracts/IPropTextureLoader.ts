/**
 * Prop Texture Service Interface
 *
 * Handles prop texture loading for AnimatorCanvas.
 * Loads textures and retrieves dimensions for both prop colors.
 */

import type { IAnimationRenderer } from "$lib/features/compose/services/contracts/IAnimationRenderer";
import type { ISVGGenerator } from "$lib/features/compose/services/contracts/ISVGGenerator";
import type { ITrailCaptureService } from "$lib/features/compose/services/contracts/ITrailCaptureService";

/**
 * Prop dimensions
 */
export interface PropDimensions {
  width: number;
  height: number;
}

/**
 * Callback for when dimensions are loaded
 */
export type DimensionsLoadedCallback = (
  blue: PropDimensions,
  red: PropDimensions
) => void;

/**
 * Callback for when loading completes
 */
export type LoadCompleteCallback = () => void;

/**
 * Service for managing prop texture loading
 */
export interface IPropTextureService {
  /**
   * Initialize the service with required dependencies
   */
  initialize(
    renderer: IAnimationRenderer,
    svgGenerator: ISVGGenerator
  ): void;

  /**
   * Set trail capture service for dimension updates
   */
  setTrailCaptureService(service: ITrailCaptureService | null): void;

  /**
   * Set callback for when dimensions are loaded
   */
  setDimensionsLoadedCallback(callback: DimensionsLoadedCallback): void;

  /**
   * Set callback for load completion
   */
  setLoadCompleteCallback(callback: LoadCompleteCallback): void;

  /**
   * Load textures for both prop colors
   * @param bluePropType - Type of blue prop
   * @param redPropType - Type of red prop
   */
  loadPropTextures(bluePropType: string, redPropType: string): Promise<void>;

  /**
   * Clean up resources
   */
  dispose(): void;
}
