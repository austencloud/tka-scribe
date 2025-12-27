/**
 * Prop Texture Service Interface
 *
 * Handles prop texture loading for AnimatorCanvas.
 * Uses reactive state ownership - service owns $state, component derives from it.
 */

import type { IAnimationRenderer } from "$lib/features/compose/services/contracts/IAnimationRenderer";
import type { ISVGGenerator } from "$lib/features/compose/services/contracts/ISVGGenerator";
import type { ITrailCapturer } from "$lib/features/compose/services/contracts/ITrailCapturer";

/**
 * Prop dimensions
 */
export interface PropDimensions {
  width: number;
  height: number;
}

/**
 * Default prop dimensions
 */
export const DEFAULT_PROP_DIMENSIONS: PropDimensions = {
  width: 100,
  height: 100,
};

/**
 * Reactive state for prop textures
 */
export interface PropTextureState {
  blueDimensions: PropDimensions;
  redDimensions: PropDimensions;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Service for managing prop texture loading
 */
export interface IPropTextureLoader {
  /**
   * Reactive state - owned by service, read by component via $derived
   */
  state: PropTextureState;

  /**
   * Initialize the service with required dependencies
   */
  initialize(
    renderer: IAnimationRenderer,
    svgGenerator: ISVGGenerator,
    TrailCapturer: ITrailCapturer | null
  ): void;

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
