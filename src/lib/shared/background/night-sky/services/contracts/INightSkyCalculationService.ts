import type { AccessibilitySettings } from "$lib/shared/background/shared/domain/models/background-models";
import type { Dimensions } from "$lib/shared/background/shared/domain/types/background-types";
import type { StarConfig, Star } from "../../domain/models/night-sky-models";

/**
 * Service for night sky calculations and star generation
 */
export interface INightSkyCalculationService {
  /**
   * Generate a random float between min and max
   */
  randFloat(min: number, max: number): number;

  /**
   * Generate a random integer between min and max (inclusive)
   */
  randInt(min: number, max: number): number;

  /**
   * Pick a random item from an array
   */
  randItem<T>(arr: T[]): T;

  /**
   * Create a star with randomized properties
   */
  makeStar(
    dimensions: Dimensions,
    config: StarConfig,
    accessibility: AccessibilitySettings
  ): Star;

  /**
   * Simple moon phase calculation without external dependencies
   */
  getMoonIllumination(date: Date): {
    fraction: number;
    phase: number;
    angle: number;
  };
}
