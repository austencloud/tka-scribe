// Configuration utilities for background systems
import { NightSkyConfig } from "./config/nightSky";
import { SnowfallConfig } from "./config/snowfall";
import { SantaConfig, SeasonalConfig } from "./config/santa";
import type { QualityLevel } from "./types/types";

// Core configuration that combines common settings
export const CoreConfig = {
  background: SnowfallConfig.background,
  performance: SnowfallConfig.performance,
};

// Export configs for use by other modules
export { SnowfallConfig, NightSkyConfig, SantaConfig, SeasonalConfig };

/**
 * Detects the appropriate quality level for the background system
 * Based on device capabilities and user preferences
 */
export function detectAppropriateQuality(): QualityLevel {
  // For now, return medium quality as default
  // This could be enhanced to check for device capabilities,
  // reduced motion preferences, etc.
  return "medium";
}

/**
 * Gets optimized configuration for a given quality level
 */
export function getOptimizedConfig(quality: QualityLevel) {
  return {
    config: NightSkyConfig,
    qualitySettings: {
      enableParallax: quality !== "low",
      enableNebula: quality === "high",
      enableShootingStars: quality !== "low",
      maxStars: quality === "low" ? 50 : quality === "medium" ? 150 : 300,
      animationFrameRate:
        quality === "low" ? 30 : quality === "medium" ? 45 : 60,
    },
  };
}
