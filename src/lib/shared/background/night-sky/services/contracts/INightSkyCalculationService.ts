import type { AccessibilitySettings } from "$lib/shared/background/shared/domain/models/background-models";
import type { Dimensions } from "$lib/shared/background/shared/domain/types/background-types";
import type {
  StarConfig,
  Star,
  MoonIllumination,
} from "../../domain/models/night-sky-models";

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
   * Calculate moon illumination data for a given date and observer location.
   * @param date - The date/time to calculate for
   * @param latitude - Observer's latitude in degrees (positive = north, negative = south)
   */
  getMoonIllumination(date: Date, latitude?: number): MoonIllumination;

  /**
   * Set the observer's latitude for location-aware calculations.
   * @param latitude - Latitude in degrees (-90 to 90)
   */
  setObserverLatitude(latitude: number): void;

  /**
   * Get the current observer latitude.
   */
  getObserverLatitude(): number;
}
