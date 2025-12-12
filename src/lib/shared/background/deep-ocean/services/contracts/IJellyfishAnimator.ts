import type { Dimensions } from "$lib/shared/background/shared/domain/types/background-types";
import type { JellyfishMarineLife } from "../../domain/models/DeepOceanModels";

/**
 * Contract for jellyfish animation and movement
 */
export interface IJellyfishAnimator {
  /**
   * Initialize jellyfish population
   */
  initializeJellyfish(dimensions: Dimensions, count: number): JellyfishMarineLife[];

  /**
   * Create a single jellyfish
   */
  createJellyfish(dimensions: Dimensions): JellyfishMarineLife;

  /**
   * Update all jellyfish positions and animations
   */
  updateJellyfish(
    jellyfish: JellyfishMarineLife[],
    dimensions: Dimensions,
    frameMultiplier: number
  ): JellyfishMarineLife[];

  /**
   * Get optimal jellyfish count for quality level
   */
  getJellyfishCount(quality: string): number;
}
