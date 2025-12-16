export type QualityLevel = "high" | "medium" | "low" | "minimal";
export type Dimensions = {
  width: number;
  height: number;
};

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