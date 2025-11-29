// Domain exports
export type {
  DetectedPosition,
  DetectionFrame,
  DetectionSource,
  BeatResult,
  TimingGrade,
  PerformanceScore,
  PerformanceGrade,
  PerformanceData,
} from "./domain";

export {
  TrainMode,
  DetectionMethod,
  VisualizationMode,
  TIMING_WINDOWS,
  SCORE_VALUES,
  GRADE_THRESHOLDS,
  COMBO_MULTIPLIERS,
  XP_REWARDS,
} from "./domain";

// Component exports
export { TrainModePanel, CameraPreview, GridOverlay } from "./components";

// State exports
export type { TrainState, TrainStateConfig } from "./state";
export { createTrainState, initTrainState, getTrainState } from "./state";
