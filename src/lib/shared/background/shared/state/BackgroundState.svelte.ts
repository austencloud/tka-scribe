// BackgroundState.svelte.ts - Pure reactive state management

import type {
  Dimensions,
  PerformanceMetrics,
  QualityLevel,
} from "../domain/types";

/**
 * Background state management using Svelte 5 runes
 * Handles all reactive state for background system
 */
export function createBackgroundState() {
  // Reactive state
  let dimensions = $state<Dimensions>({ width: 0, height: 0 });
  let performanceMetrics = $state<PerformanceMetrics>({
    fps: 60,
    warnings: [],
  });
  let isActive = $state<boolean>(true);
  let qualityMode = $state<QualityLevel>("high");
  let isLoading = $state<boolean>(false);

  // Derived state
  const shouldRender = $derived(isActive && performanceMetrics.fps > 30);

  return {
    // Getters for reactive state
    get dimensions() {
      return dimensions;
    },
    get performanceMetrics() {
      return performanceMetrics;
    },
    get isActive() {
      return isActive;
    },
    get qualityMode() {
      return qualityMode;
    },
    get isLoading() {
      return isLoading;
    },
    get shouldRender() {
      return shouldRender;
    },

    // State setters
    setDimensions: (newDimensions: Dimensions) => {
      dimensions = newDimensions;
    },
    setPerformanceMetrics: (metrics: PerformanceMetrics) => {
      performanceMetrics = metrics;
    },
    setActive: (active: boolean) => {
      isActive = active;
    },
    setQualityMode: (mode: QualityLevel) => {
      qualityMode = mode;
    },
    setLoading: (loading: boolean) => {
      isLoading = loading;
    },
  };
}

export type BackgroundState = ReturnType<typeof createBackgroundState>;
