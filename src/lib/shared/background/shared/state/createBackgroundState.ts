import type { BackgroundSystem } from "../domain/models/background-models";
import type { PerformanceMetrics } from "../domain/types/background-types";
import type { QualityLevel } from "../domain/types/background-types";
import { BackgroundType } from "../domain/enums/background-enums";
import { BackgroundFactory } from "../services/implementations/BackgroundFactory";

export function createBackgroundState() {
  // Runes-based reactive state
  // Default to SOLID_COLOR to match SettingsState defaults
  let backgroundType = $state<BackgroundType>(BackgroundType.SOLID_COLOR);
  let quality = $state<QualityLevel>("medium");
  let isLoading = $state(true);
  let currentSystem = $state<BackgroundSystem | null>(null);
  let metrics = $state<PerformanceMetrics>({ fps: 60, warnings: [] });

  // Derived state
  const isReady = $derived(currentSystem !== null && !isLoading);
  const hasWarnings = $derived(metrics.warnings.length > 0);
  const shouldOptimize = $derived(metrics.fps < 30);

  return {
    // State getters
    get backgroundType() {
      return backgroundType;
    },
    get quality() {
      return quality;
    },
    get isLoading() {
      return isLoading;
    },
    get currentSystem() {
      return currentSystem;
    },
    get metrics() {
      return metrics;
    },
    get isReady() {
      return isReady;
    },
    get hasWarnings() {
      return hasWarnings;
    },
    get shouldOptimize() {
      return shouldOptimize;
    },

    // Actions
    async setBackgroundType(newType: BackgroundType) {
      isLoading = true;
      try {
        backgroundType = newType;
        currentSystem = await BackgroundFactory.createBackgroundSystem({
          type: newType,
          quality,
          initialQuality: quality,
        });
      } finally {
        isLoading = false;
      }
    },

    async setQuality(newQuality: QualityLevel) {
      quality = newQuality;
      if (currentSystem) {
        currentSystem.setQuality(newQuality);
      }
    },

    updateMetrics(newMetrics: PerformanceMetrics) {
      metrics = newMetrics;
    },
  };
}
