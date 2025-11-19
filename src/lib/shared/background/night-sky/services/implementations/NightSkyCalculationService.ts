import type { AccessibilitySettings, Dimensions, Star } from "$shared";
import { injectable } from "inversify";
import type { StarConfig } from "../../domain/models/night-sky-models";
import type { INightSkyCalculationService } from "../contracts/INightSkyCalculationService";

@injectable()
export class NightSkyCalculationService implements INightSkyCalculationService {
  /**
   * Generate a random float between min and max
   */
  randFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate a random integer between min and max (inclusive)
   */
  randInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Pick a random item from an array
   */
  randItem<T>(arr: readonly T[]): T {
    if (arr.length === 0) throw new Error("randItem called with empty array");
    const item = arr[Math.floor(Math.random() * arr.length)];
    if (item === undefined) throw new Error("randItem returned undefined");
    return item;
  }

  /**
   * Create a star with randomized properties
   */
  makeStar(
    dimensions: Dimensions,
    config: StarConfig,
    accessibility: AccessibilitySettings
  ): Star {
    const r =
      this.randFloat(config.minSize, config.maxSize) *
      (accessibility.visibleParticleSize > 2 ? 1.5 : 1);
    const tw = Math.random() < config.twinkleChance;

    // 30% of larger stars get the classic 4-pointed sparkle shape
    const isSparkle = r > 1.5 && Math.random() < 0.3;

    return {
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      radius: r,
      baseOpacity: this.randFloat(config.baseOpacityMin, config.baseOpacityMax),
      currentOpacity: 1, // Will be set during updates
      twinkleSpeed: tw
        ? this.randFloat(config.minTwinkleSpeed, config.maxTwinkleSpeed)
        : 0,
      twinklePhase: Math.random() * Math.PI * 2,
      isTwinkling: tw,
      color: accessibility.highContrast
        ? "#FFFFFF"
        : this.randItem(config.colors),
      isSparkle,
    };
  }

  /**
   * Simple moon phase calculation without external dependencies
   */
  getMoonIllumination(date: Date) {
    // Simple lunar phase calculation - basic approximation
    const msPerLunarCycle = 29.53058868 * 24 * 60 * 60 * 1000; // ~29.5 days in ms
    const knownNewMoon = new Date("2024-01-11T11:57:00Z").getTime(); // A known new moon
    const currentTime = date.getTime();

    const timeSinceNewMoon = currentTime - knownNewMoon;
    const cyclePosition = (timeSinceNewMoon / msPerLunarCycle) % 1;

    // Calculate illuminated fraction (0 = new moon, 0.5 = full moon)
    let fraction;
    if (cyclePosition < 0.5) {
      // Waxing
      fraction = cyclePosition * 2;
    } else {
      // Waning
      fraction = 2 - cyclePosition * 2;
    }

    return {
      fraction: Math.abs(fraction),
      phase: cyclePosition,
      angle: 0, // Simplified - no angle calculation
    };
  }
}
