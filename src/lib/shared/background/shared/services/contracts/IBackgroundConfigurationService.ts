import type { QUALITY_CONFIGS } from "../../domain/constants/BackgroundConfigs";
import type { QualityLevel } from "../../domain/types/background-types";

/**
 * Service for managing background configuration and quality detection
 */
export interface IBackgroundConfigurationService {
  /**
   * Detects the appropriate quality level based on device capabilities
   */
  detectAppropriateQuality(): QualityLevel;

  /**
   * Get configuration for a specific quality level
   */
  getQualityConfig(
    quality: QualityLevel
  ): (typeof QUALITY_CONFIGS)[keyof typeof QUALITY_CONFIGS];

  /**
   * Get optimized configuration for a specific quality level
   */
  getOptimizedConfig(quality: QualityLevel): {
    config: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      core: { background: any };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      nightSky: any;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    qualitySettings: any;
  };

  /**
   * Gets normalized configuration with quality adjustments
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getQualityAdjustedConfig<T extends Record<string, any>>(
    baseConfig: T,
    quality: QualityLevel
  ): T & { quality: (typeof QUALITY_CONFIGS)[QualityLevel] };

  /**
   * Creates a bounded random value within min/max range
   */
  createBoundedRandom(min: number, max: number): () => number;

  /**
   * Gets a random color from an array of colors
   */
  getRandomColor(colors: string[]): string;
}
