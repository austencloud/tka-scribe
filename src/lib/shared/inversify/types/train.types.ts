/**
 * Train Module Service Type Identifiers
 *
 * Services for practice mode, hand detection, and performance tracking.
 */

export const TrainTypes = {
  // Core Training
  IPositionDetector: Symbol.for("IPositionDetector"),
  IOrientationTracker: Symbol.for("IOrientationTracker"),
  ICameraManager: Symbol.for("ICameraManager"),
  IPerformanceScorer: Symbol.for("IPerformanceScorer"),
  IPerformanceRecorder: Symbol.for("IPerformanceRecorder"),
  ITrainPersistenceService: Symbol.for("ITrainPersistenceService"),

  // Hand Detection
  IHandLandmarker: Symbol.for("IHandLandmarker"),
  IHandednessAnalyzer: Symbol.for("IHandednessAnalyzer"),
  IHandStateAnalyzer: Symbol.for("IHandStateAnalyzer"),
  IHandTrackingStabilizer: Symbol.for("IHandTrackingStabilizer"),
  IHandAssigner: Symbol.for("IHandAssigner"),

  // Practice
  IVoiceCommandHandler: Symbol.for("IVoiceCommandHandler"),

  // Challenges & Progress
  ITrainChallengeManager: Symbol.for("ITrainChallengeManager"),
  IPerformanceHistoryTracker: Symbol.for("IPerformanceHistoryTracker"),
} as const;
