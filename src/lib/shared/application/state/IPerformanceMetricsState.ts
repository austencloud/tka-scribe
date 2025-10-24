import type { UIPerformanceMetrics } from "../../foundation";

export interface IPerformanceMetricsState {
  // State getters
  readonly performanceMetrics: UIPerformanceMetrics;

  // Actions
  updateInitializationTime(time: number): void;
  updateLastRenderTime(time: number): void;
  updateMemoryUsage(): void;
  resetMetrics(): void;
}
