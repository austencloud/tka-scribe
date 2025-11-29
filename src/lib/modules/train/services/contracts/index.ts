export type { IPositionDetectionService, DetectionCapabilities } from "./IPositionDetectionService";
export type { IOrientationTracker, OrientationState } from "./IOrientationTracker";
export type { ICameraService, CameraConfig } from "./ICameraService";
export type {
	IPerformanceScoringService,
	ExpectedBeatPosition
} from "./IPerformanceScoringService";
export type {
	IPerformanceRecordingService,
	RecordingConfig
} from "./IPerformanceRecordingService";

// Hand Detection Services (refactored from MediaPipeDetectionService)
export type {
	IHandLandmarkerService,
	HandLandmark,
	HandednessResult,
	HandLandmarkerResult
} from "./IHandLandmarkerService";
export type {
	IHandednessAnalyzer,
	HandednessAnalysisResult,
	PalmOrientation,
	AnatomicalHandedness
} from "./IHandednessAnalyzer";
export type {
	IHandStateAnalyzer,
	HandStateAnalysisResult
} from "./IHandStateAnalyzer";
export type {
	IHandTrackingStabilizer,
	HandHistory,
	SmoothedPosition,
	StabilizerConfig
} from "./IHandTrackingStabilizer";
export type {
	IHandAssignmentService,
	DetectedHandData,
	HandAssignmentResult
} from "./IHandAssignmentService";
