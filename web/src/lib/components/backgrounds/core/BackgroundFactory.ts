// src/lib/components/backgrounds/core/BackgroundFactory.ts
// Step 3: Testing NightSkyBackgroundSystem with correct import path

import {
  BackgroundType,
  type BackgroundSystem,
  type QualityLevel,
  type AccessibilitySettings,
  type BackgroundFactoryParams,
} from "../types/types";
import { detectAppropriateQuality } from "../config";
import { NightSkyBackgroundSystem } from "../nightSky/NightSkyBackgroundSystem";
import { SnowfallBackgroundSystem } from "../snowfall/SnowfallBackgroundSystem";
import { AuroraBackgroundSystem } from "../aurora/AuroraBackgroundSystem";
import { BubblesBackgroundSystem } from "../bubbles/BubblesBackgroundSystem";

export class BackgroundFactory {
  // Default accessibility settings
  private static readonly defaultAccessibility: AccessibilitySettings = {
    reducedMotion: false,
    highContrast: false,
    visibleParticleSize: 2,
  };

  public static createBackgroundSystem(
    options: BackgroundFactoryParams
  ): BackgroundSystem {
    // Quality detection logic
    const quality: QualityLevel =
      options.initialQuality ?? detectAppropriateQuality();

    // Accessibility detection for window environments
    let accessibility: AccessibilitySettings = {
      ...this.defaultAccessibility,
      ...(options.accessibility || {}),
    };

    if (typeof window !== "undefined" && window.matchMedia) {
      // Auto-detect reduced motion preference if not explicitly set
      if (options.accessibility?.reducedMotion === undefined) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          accessibility = { ...accessibility, reducedMotion: true };
        }
      }

      // Auto-detect high contrast preference if not explicitly set
      if (options.accessibility?.highContrast === undefined) {
        if (window.matchMedia("(prefers-contrast: more)").matches) {
          accessibility = { ...accessibility, highContrast: true };
        }
      }
    }

    let backgroundSystem: BackgroundSystem;

    // Switch statement for background types
    switch (options.type) {
      case BackgroundType.SNOWFALL:
        backgroundSystem = new SnowfallBackgroundSystem();
        break;
      case BackgroundType.NIGHT_SKY:
        backgroundSystem = new NightSkyBackgroundSystem();
        break;
      case BackgroundType.AURORA:
        backgroundSystem = new AuroraBackgroundSystem();
        break;
      case BackgroundType.BUBBLES:
        backgroundSystem = new BubblesBackgroundSystem();
        break;
      default:
        console.warn(
          `Unknown background type "${options.type}". Defaulting to nightSky.`
        );
        backgroundSystem = new NightSkyBackgroundSystem();
    }

    // Apply accessibility settings if the background system supports them
    if (backgroundSystem.setAccessibility) {
      backgroundSystem.setAccessibility(accessibility);
    }

    // Set initial quality
    backgroundSystem.setQuality(quality);

    return backgroundSystem;
  }

  public static createOptimalBackgroundSystem(): BackgroundSystem {
    const quality = detectAppropriateQuality();

    // Default to nightSky as the preferred background
    return this.createBackgroundSystem({
      type: BackgroundType.NIGHT_SKY,
      initialQuality: quality,
    });
  }

  public static isBackgroundSupported(type: string): boolean {
    const quality = detectAppropriateQuality();

    switch (type) {
      case BackgroundType.SNOWFALL:
      case BackgroundType.NIGHT_SKY:
      case BackgroundType.AURORA:
      case BackgroundType.BUBBLES:
        return quality !== "minimal";
      default:
        return false;
    }
  }
}
