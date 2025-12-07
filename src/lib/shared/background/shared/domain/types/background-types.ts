export type QualityLevel = "high" | "medium" | "low" | "minimal";
export type Dimensions = {
  width: number;
  height: number;
};

// Re-export QualitySettings from models for convenient access
export type { QualitySettings } from "../models/background-models";

export type PerformanceMetrics = {
  fps: number;
  warnings: string[];
  particleCount?: number;
  renderTime?: number;
  memoryUsage?: number;
};
export type BackgroundEvent =
  | { type: "ready" }
  | { type: "performanceReport"; metrics: PerformanceMetrics }
  | { type: "qualityChanged"; quality: QualityLevel }
  | { type: "error"; message: string; stack?: string };
