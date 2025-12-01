/**
 * MediaPipeDetectionService (Refactored) - Hand Detection Orchestrator
 * 
 * This service orchestrates multiple focused sub-services for hand detection:
 * - HandLandmarkerService: MediaPipe initialization and raw detection
 * - HandednessAnalyzer: Anatomical left/right hand detection
 * - HandStateAnalyzer: Open/closed/partial state detection
 * - HandTrackingStabilizer: Temporal smoothing and history
 * - HandAssignmentService: Blue/red slot assignment
 * 
 * This orchestrator maintains backward compatibility with IPositionDetectionService
 * while internally using decomposed, single-responsibility services.
 */

import { injectable } from "inversify";
import type {
  IPositionDetectionService,
  DetectionCapabilities,
} from "../contracts/IPositionDetectionService";
import type {
  DetectionFrame,
  DetectedPosition,
} from "../../domain/models/DetectionFrame";
import type { HandLandmark } from "../contracts/IHandLandmarkerService";
import type { DetectedHandData } from "../contracts/IHandAssignmentService";
import { QuadrantMapper } from "./QuadrantMapper";

// Sub-services (using direct instantiation for now, can migrate to DI later)
import { HandLandmarkerService } from "./HandLandmarkerService";
import { HandednessAnalyzer } from "./HandednessAnalyzer";
import { HandStateAnalyzer } from "./HandStateAnalyzer";
import { HandTrackingStabilizer } from "./HandTrackingStabilizer";

// How many frames to persist a hand after it disappears (for stability)
const HAND_PERSISTENCE_FRAMES = 5;

@injectable()
export class MediaPipeDetectionService implements IPositionDetectionService {
  // Sub-services
  private _landmarker: HandLandmarkerService;
  private _handednessAnalyzer: HandednessAnalyzer;
  private _stateAnalyzer: HandStateAnalyzer;
  private _stabilizer: HandTrackingStabilizer;

  // State
  private _isDetecting = false;
  private _quadrantMapper = new QuadrantMapper();
  private _frameCallback: ((frame: DetectionFrame) => void) | null = null;
  private _animationFrameId: number | null = null;
  private _videoElement: HTMLVideoElement | null = null;
  private _isMirrored = true;

  // Persistence tracking
  private _lastBluePosition: DetectedPosition | null = null;
  private _lastRedPosition: DetectedPosition | null = null;
  private _blueFramesMissing = 0;
  private _redFramesMissing = 0;

  constructor() {
    // Initialize sub-services (direct instantiation for backward compatibility)
    // In the future, these can be injected via DI
    this._landmarker = new HandLandmarkerService();
    this._handednessAnalyzer = new HandednessAnalyzer();
    this._stateAnalyzer = new HandStateAnalyzer();
    this._stabilizer = new HandTrackingStabilizer();
  }

  get isInitialized(): boolean {
    return this._landmarker.isInitialized;
  }

  get isDetecting(): boolean {
    return this._isDetecting;
  }

  getCapabilities(): DetectionCapabilities {
    return {
      supportsRealtime: true,
      supportsPostRecording: true,
      requiresCalibration: false,
    };
  }

  async initialize(): Promise<void> {
    await this._landmarker.initialize();
  }

  async startRealTimeDetection(
    video: HTMLVideoElement,
    onFrame: (frame: DetectionFrame) => void,
    options?: { mirrored?: boolean }
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this._isDetecting) {
      this.stopDetection();
    }

    this._videoElement = video;
    this._frameCallback = onFrame;
    this._isMirrored = options?.mirrored ?? true;
    this._isDetecting = true;

    this._processVideoFrame();
  }

  private _processVideoFrame(): void {
    if (!this._isDetecting || !this._videoElement || !this._frameCallback) {
      return;
    }

    if (this._videoElement.readyState >= 2) {
      const timestamp = performance.now();
      const result = this._landmarker.detectForVideo(this._videoElement, timestamp);
      const frame = this._processResult(result, timestamp);
      this._frameCallback(frame);
    }

    this._animationFrameId = requestAnimationFrame(() => this._processVideoFrame());
  }

  private _processResult(
    result: { landmarks: HandLandmark[][]; handedness: Array<Array<{ categoryName: string; score: number }>> },
    timestamp: number
  ): DetectionFrame {
    let bluePosition: DetectedPosition | null = null;
    let redPosition: DetectedPosition | null = null;

    if (result.landmarks && result.landmarks.length > 0) {
      // Extract hand data using sub-services
      const detectedHands: DetectedHandData[] = [];

      for (let i = 0; i < result.landmarks.length; i++) {
        const landmarks = result.landmarks[i];
        if (!landmarks || landmarks.length < 1) continue;

        const wrist = landmarks[0];
        if (!wrist) continue;

        // Use HandStateAnalyzer to detect hand state
        const stateResult = this._stateAnalyzer.analyzeHandState(landmarks);
        const handState = stateResult.state;

        // Use HandStateAnalyzer to calculate palm center
        const palmCenter = this._stateAnalyzer.calculatePalmCenter(landmarks, handState);
        const referencePoint = this._stateAnalyzer.getReferencePoint(landmarks, handState);

        // Create debug landmarks (apply mirroring for display)
        const debugLandmarks = {
          wrist: {
            x: this._isMirrored ? 1 - wrist.x : wrist.x,
            y: wrist.y,
          },
          middleFingerTip: {
            x: this._isMirrored ? 1 - (referencePoint?.x ?? wrist.x) : (referencePoint?.x ?? wrist.x),
            y: referencePoint?.y ?? wrist.y,
          },
          palmCenter: {
            x: this._isMirrored ? 1 - palmCenter.x : palmCenter.x,
            y: palmCenter.y,
          },
        };

        // Use HandednessAnalyzer for anatomical detection
        const handednessResult = this._handednessAnalyzer.analyzeHandedness(landmarks);
        const anatomicalHandedness = handednessResult.anatomicalHandedness;

        // Determine final handedness
        const handednessData = result.handedness[i]?.[0];
        let isUserLeftHand: boolean;
        let confidence: number;

        if (anatomicalHandedness) {
          isUserLeftHand = anatomicalHandedness === "left";
          confidence = handednessResult.confidence;
        } else {
          // Fallback to MediaPipe
          const rawHandedness = handednessData?.categoryName;
          isUserLeftHand = this._isMirrored
            ? rawHandedness === "Left"
            : rawHandedness === "Right";
          confidence = handednessData?.score ?? 0;
        }

        // Create detected position
        const position = this._createDetectedPosition(palmCenter, timestamp, debugLandmarks, handState);

        detectedHands.push({
          position,
          wristX: wrist.x,
          isUserLeftHand,
          confidence,
        });
      }

      // Assign hands to blue/red slots
      const assignment = this._assignHands(detectedHands, timestamp);
      bluePosition = assignment.blue;
      redPosition = assignment.red;
    }

    // Clear history for undetected hands
    if (!bluePosition) {
      this._stabilizer.clearHistory("blue");
    }
    if (!redPosition) {
      this._stabilizer.clearHistory("red");
    }

    // Apply persistence
    const persisted = this._applyPersistence(bluePosition, redPosition);
    bluePosition = persisted.blue;
    redPosition = persisted.red;

    return {
      timestamp,
      blue: bluePosition,
      red: redPosition,
      source: "mediapipe",
    };
  }

  /**
   * Assign detected hands to blue (left) and red (right) slots
   */
  private _assignHands(
    detectedHands: DetectedHandData[],
    timestamp: number
  ): { blue: DetectedPosition | null; red: DetectedPosition | null } {
    let bluePosition: DetectedPosition | null = null;
    let redPosition: DetectedPosition | null = null;

    if (detectedHands.length === 2) {
      // Two hands - use position to disambiguate
      const sorted = [...detectedHands].sort((a, b) => a.wristX - b.wristX);
      const hand0 = sorted[0];
      const hand1 = sorted[1];

      if (hand0 && hand1) {
        if (this._isMirrored) {
          redPosition = hand0.position;
          bluePosition = hand1.position;
        } else {
          bluePosition = hand0.position;
          redPosition = hand1.position;
        }
      }

      // Apply smoothing
      if (bluePosition) {
        bluePosition = this._applySmoothingToPosition(bluePosition, "blue", timestamp);
      }
      if (redPosition) {
        redPosition = this._applySmoothingToPosition(redPosition, "red", timestamp);
      }
    } else if (detectedHands.length === 1) {
      const hand = detectedHands[0];
      if (hand) {
        const assigned = this._assignSingleHand(hand, timestamp);
        bluePosition = assigned.blue;
        redPosition = assigned.red;
      }
    }

    return { blue: bluePosition, red: redPosition };
  }

  /**
   * Assign a single detected hand using proximity matching
   */
  private _assignSingleHand(
    hand: DetectedHandData,
    timestamp: number
  ): { blue: DetectedPosition | null; red: DetectedPosition | null } {
    const handX = hand.position.rawPosition.x;
    const handY = hand.position.rawPosition.y;

    let assignToBlue = false;

    const hasBlueHistory = this._stabilizer.hasHistory("blue");
    const hasRedHistory = this._stabilizer.hasHistory("red");

    if (hasBlueHistory && hasRedHistory) {
      const lastBlue = this._stabilizer.getLastPosition("blue");
      const lastRed = this._stabilizer.getLastPosition("red");

      if (lastBlue && lastRed) {
        const distToBlue = this._stabilizer.calculateDistance(handX, handY, lastBlue.x, lastBlue.y);
        const distToRed = this._stabilizer.calculateDistance(handX, handY, lastRed.x, lastRed.y);
        assignToBlue = distToBlue < distToRed;
      }
    } else if (hasBlueHistory) {
      const lastBlue = this._stabilizer.getLastPosition("blue");
      if (lastBlue) {
        const distToBlue = this._stabilizer.calculateDistance(handX, handY, lastBlue.x, lastBlue.y);
        assignToBlue = distToBlue < 0.3;
      }
    } else if (hasRedHistory) {
      const lastRed = this._stabilizer.getLastPosition("red");
      if (lastRed) {
        const distToRed = this._stabilizer.calculateDistance(handX, handY, lastRed.x, lastRed.y);
        assignToBlue = distToRed >= 0.3;
      }
    } else {
      assignToBlue = handX > 0.5;
    }

    if (assignToBlue) {
      const smoothedPosition = this._applySmoothingToPosition(hand.position, "blue", timestamp);
      this._stabilizer.setAssignedHand("blue", "left");
      return { blue: smoothedPosition, red: null };
    } else {
      const smoothedPosition = this._applySmoothingToPosition(hand.position, "red", timestamp);
      this._stabilizer.setAssignedHand("red", "right");
      return { blue: null, red: smoothedPosition };
    }
  }

  /**
   * Apply temporal smoothing to a position
   */
  private _applySmoothingToPosition(
    position: DetectedPosition,
    handId: "blue" | "red",
    timestamp: number
  ): DetectedPosition {
    const smoothed = this._stabilizer.addPosition(
      handId,
      position.rawPosition.x,
      position.rawPosition.y,
      timestamp
    );

    return {
      ...position,
      rawPosition: smoothed,
      quadrant: this._quadrantMapper.mapToQuadrant(smoothed.x, smoothed.y),
    };
  }

  /**
   * Apply hand persistence (show hands briefly after they disappear)
   */
  private _applyPersistence(
    currentBlue: DetectedPosition | null,
    currentRed: DetectedPosition | null
  ): { blue: DetectedPosition | null; red: DetectedPosition | null } {
    let blue = currentBlue;
    let red = currentRed;

    // Blue hand persistence
    if (blue) {
      this._lastBluePosition = blue;
      this._blueFramesMissing = 0;
    } else if (this._lastBluePosition && this._blueFramesMissing < HAND_PERSISTENCE_FRAMES) {
      blue = this._lastBluePosition;
      this._blueFramesMissing++;
    } else {
      this._lastBluePosition = null;
    }

    // Red hand persistence
    if (red) {
      this._lastRedPosition = red;
      this._redFramesMissing = 0;
    } else if (this._lastRedPosition && this._redFramesMissing < HAND_PERSISTENCE_FRAMES) {
      red = this._lastRedPosition;
      this._redFramesMissing++;
    } else {
      this._lastRedPosition = null;
    }

    return { blue, red };
  }

  private _createDetectedPosition(
    landmark: HandLandmark,
    timestamp: number,
    debugLandmarks?: {
      wrist: { x: number; y: number };
      middleFingerTip: { x: number; y: number };
      palmCenter: { x: number; y: number };
    },
    handState?: "open" | "closed" | "partial"
  ): DetectedPosition {
    const x = this._isMirrored ? 1 - landmark.x : landmark.x;
    const quadrant = this._quadrantMapper.mapToQuadrant(x, landmark.y);

    return {
      quadrant,
      confidence: 1.0,
      rawPosition: { x, y: landmark.y },
      timestamp,
      debug: debugLandmarks,
      handState,
    };
  }

  stopDetection(): void {
    this._isDetecting = false;
    this._frameCallback = null;
    this._videoElement = null;

    // Reset persistence state
    this._lastBluePosition = null;
    this._lastRedPosition = null;
    this._blueFramesMissing = 0;
    this._redFramesMissing = 0;

    // Reset stabilizer
    this._stabilizer.resetAll();

    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  async processFrame(
    imageData: ImageData,
    timestamp: number
  ): Promise<DetectionFrame> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(imageData, 0, 0);

    const result = this._landmarker.detect(canvas);
    return this._processResult(result, timestamp);
  }

  dispose(): void {
    this.stopDetection();
    this._landmarker.dispose();
  }
}
