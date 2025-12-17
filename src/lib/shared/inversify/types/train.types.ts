/**
 * Train Module Service Type Identifiers
 *
 * Services for practice mode, hand detection, and performance tracking.
 */

export const TrainTypes = {
  // Core Training
  IPositionDetectionService: Symbol.for("IPositionDetectionService"),
  IOrientationTracker: Symbol.for("IOrientationTracker"),
  ICameraService: Symbol.for("ICameraService"),
  IPerformanceScoringService: Symbol.for("IPerformanceScoringService"),
  IPerformanceRecordingService: Symbol.for("IPerformanceRecordingService"),
  ITrainPersistenceService: Symbol.for("ITrainPersistenceService"),

  // Hand Detection
  IHandLandmarkerService: Symbol.for("IHandLandmarkerService"),
  IHandednessAnalyzer: Symbol.for("IHandednessAnalyzer"),
  IHandStateAnalyzer: Symbol.for("IHandStateAnalyzer"),
  IHandTrackingStabilizer: Symbol.for("IHandTrackingStabilizer"),
  IHandAssignmentService: Symbol.for("IHandAssignmentService"),

  // Practice
  IVoiceCommandService: Symbol.for("IVoiceCommandService"),

  // Challenges & Progress
  ITrainChallengeService: Symbol.for("ITrainChallengeService"),
  IPerformanceHistoryService: Symbol.for("IPerformanceHistoryService"),
} as const;
