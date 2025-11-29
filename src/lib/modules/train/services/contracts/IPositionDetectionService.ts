import type { DetectionFrame } from "../../domain/models/DetectionFrame";

export interface DetectionCapabilities {
	supportsRealtime: boolean;
	supportsPostRecording: boolean;
	requiresCalibration: boolean;
}

export interface DetectionOptions {
	/** Whether the video feed is mirrored (default: true for front-facing camera) */
	mirrored?: boolean;
}

export interface IPositionDetectionService {
	getCapabilities(): DetectionCapabilities;
	initialize(): Promise<void>;
	startRealTimeDetection(
		video: HTMLVideoElement,
		onFrame: (frame: DetectionFrame) => void,
		options?: DetectionOptions
	): Promise<void>;
	stopDetection(): void;
	processFrame(imageData: ImageData, timestamp: number): Promise<DetectionFrame>;
	dispose(): void;
	readonly isInitialized: boolean;
	readonly isDetecting: boolean;
}
