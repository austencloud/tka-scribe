import { injectable } from "inversify";
import type {
  IPositionDetectionService,
  DetectionCapabilities,
} from "../contracts/IPositionDetectionService";
import type {
  DetectionFrame,
  DetectedPosition,
} from "../../domain/models/DetectionFrame";
import { QuadrantMapper } from "./QuadrantMapper";
import type { HandState } from "../../domain/models/DetectionFrame";

// Type definitions for MediaPipe (will be loaded dynamically)
interface HandLandmark {
  x: number;
  y: number;
  z: number;
}

interface HandednessResult {
  categoryName: string;
  score: number;
}

interface HandLandmarkerResult {
  landmarks: HandLandmark[][];
  handedness: HandednessResult[][];
}

// Minimum confidence required to switch handedness assignment
const _HANDEDNESS_CONFIDENCE_THRESHOLD = 0.70;

// How many frames to persist a hand after it disappears (for stability)
const HAND_PERSISTENCE_FRAMES = 5;

// How many frames to keep in history for smoothing
const SMOOTHING_WINDOW = 3;

// Minimum distance a hand must move to switch handedness (in normalized coordinates)
const HANDEDNESS_SWITCH_THRESHOLD = 0.4;

interface HandHistory {
  positions: Array<{ x: number; y: number; timestamp: number }>;
  assignedHand: "left" | "right";
  confidenceFrames: number; // Consecutive frames with high confidence
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HandLandmarkerType = any;

@injectable()
export class MediaPipeDetectionService implements IPositionDetectionService {
  private _handLandmarker: HandLandmarkerType = null;
  private _isInitialized = false;
  private _isDetecting = false;
  private _quadrantMapper = new QuadrantMapper();
  private _frameCallback: ((frame: DetectionFrame) => void) | null = null;
  private _animationFrameId: number | null = null;
  private _videoElement: HTMLVideoElement | null = null;
  private _isMirrored = true; // Default to mirrored for front-facing camera

  // Track last known positions for stability
  private _lastBluePosition: DetectedPosition | null = null;
  private _lastRedPosition: DetectedPosition | null = null;
  private _blueFramesMissing = 0;
  private _redFramesMissing = 0;

  // Hand tracking history for temporal smoothing and identity persistence
  private _blueHistory: HandHistory = {
    positions: [],
    assignedHand: "left",
    confidenceFrames: 0,
  };
  private _redHistory: HandHistory = {
    positions: [],
    assignedHand: "right",
    confidenceFrames: 0,
  };

  get isInitialized(): boolean {
    return this._isInitialized;
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
    if (this._isInitialized) return;

    try {
      // Dynamically import MediaPipe
      const vision = await import("@mediapipe/tasks-vision");
      const { HandLandmarker, FilesetResolver } = vision;

      const wasmFileset = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      this._handLandmarker = await HandLandmarker.createFromOptions(
        wasmFileset,
        {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        }
      );

      this._isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize MediaPipe:", error);
      throw new Error(`MediaPipe initialization failed: ${error}`);
    }
  }

  async startRealTimeDetection(
    video: HTMLVideoElement,
    onFrame: (frame: DetectionFrame) => void,
    options?: { mirrored?: boolean }
  ): Promise<void> {
    if (!this._isInitialized) {
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
      const result = this._handLandmarker.detectForVideo(
        this._videoElement,
        timestamp
      );
      const frame = this._processResult(result, timestamp);
      this._frameCallback(frame);
    }

    this._animationFrameId = requestAnimationFrame(() =>
      this._processVideoFrame()
    );
  }

  private _processResult(
    result: HandLandmarkerResult,
    timestamp: number
  ): DetectionFrame {
    let bluePosition: DetectedPosition | null = null;
    let redPosition: DetectedPosition | null = null;

    if (result.landmarks && result.landmarks.length > 0) {
      // Collect all detected hands with their data
      const detectedHands: Array<{
        position: DetectedPosition;
        wristX: number; // Raw wrist X for position-based handedness
        isLeftByMediaPipe: boolean;
        confidence: number;
      }> = [];

      for (let i = 0; i < result.landmarks.length; i++) {
        const landmarks = result.landmarks[i];
        const handednessData = result.handedness[i]?.[0];
        const rawHandedness = handednessData?.categoryName;
        const handednessConfidence = handednessData?.score ?? 0;

        // Only require wrist (landmark 0) - it's always present and stable
        if (!landmarks || landmarks.length < 1) continue;
        const wrist = landmarks[0];
        if (!wrist) continue;

        // Detect hand state first to determine which landmarks to use
        const handState = this._detectHandState(landmarks);

        // Choose reference point based on hand state
        let referencePoint: HandLandmark | null = null;

        if (handState === "closed") {
          // For closed hand (fist), use the middle finger PIP joint
          // Landmark 10 = middle finger PIP (middle knuckle - furthest point when fist is closed)
          referencePoint = landmarks.length >= 11 ? (landmarks[10] ?? null) : null;
        } else {
          // For open/partial hand, use middle finger tip
          referencePoint = landmarks.length >= 13 ? (landmarks[12] ?? null) : null;
        }

        // Calculate palm center as weighted point between wrist and reference point
        // If reference point not available, just use wrist
        let palmCenterX: number;
        let palmCenterY: number;
        let palmCenterZ: number;

        if (referencePoint) {
          // Adjust weighting based on hand state
          let wristWeight: number;
          let refWeight: number;

          if (handState === "closed") {
            // For closed hand (fist), weight moderately towards the knuckles
            wristWeight = 0.5;  // 50% wrist
            refWeight = 0.5;     // 50% knuckles
          } else {
            // For open/partial hand, weight more towards wrist
            wristWeight = 0.6;  // 60% wrist
            refWeight = 0.4;     // 40% fingertip
          }

          palmCenterX = wrist.x * wristWeight + referencePoint.x * refWeight;
          palmCenterY = wrist.y * wristWeight + referencePoint.y * refWeight;
          palmCenterZ = wrist.z * wristWeight + referencePoint.z * refWeight;
        } else {
          palmCenterX = wrist.x;
          palmCenterY = wrist.y;
          palmCenterZ = wrist.z;
        }

        const palmCenter: HandLandmark = {
          x: palmCenterX,
          y: palmCenterY,
          z: palmCenterZ,
        };

        // Create debug landmarks (apply mirroring for display)
        // Show the actual reference point being used (knuckle for closed, fingertip for open)
        const debugLandmarks: { wrist: { x: number; y: number }; middleFingerTip: { x: number; y: number }; palmCenter: { x: number; y: number } } = {
          wrist: {
            x: this._isMirrored ? 1 - wrist.x : wrist.x,
            y: wrist.y,
          },
          middleFingerTip: {
            x: this._isMirrored ? 1 - (referencePoint?.x ?? wrist.x) : (referencePoint?.x ?? wrist.x),
            y: referencePoint?.y ?? wrist.y,
          },
          palmCenter: {
            x: this._isMirrored ? 1 - palmCenterX : palmCenterX,
            y: palmCenterY,
          },
        };

        // Detect handedness using ANATOMICAL features (thumb position + palm orientation)
        const anatomicalHandedness = this._detectHandednessFromAnatomy(landmarks);

        const position = this._createDetectedPosition(palmCenter, timestamp, debugLandmarks, handState);

        // Use anatomical detection as primary, fall back to MediaPipe if needed
        let isUserLeftHand: boolean;
        let finalConfidence: number;

        if (anatomicalHandedness) {
          // Anatomical detection succeeded - use it with high confidence
          isUserLeftHand = anatomicalHandedness === "left";
          finalConfidence = 0.95; // High confidence in anatomical detection
        } else {
          // Fallback to MediaPipe's handedness
          isUserLeftHand = this._isMirrored
            ? rawHandedness === "Left"
            : rawHandedness === "Right";
          finalConfidence = handednessConfidence;
        }

        detectedHands.push({
          position,
          wristX: wrist.x,
          isLeftByMediaPipe: isUserLeftHand,
          confidence: finalConfidence,
        });
      }

      // Assign hands using spatial proximity matching (track by position, not by MediaPipe handedness)
      if (detectedHands.length === 2) {
        // Two hands detected - use position to disambiguate (most reliable)
        // Sort by wrist X position (in raw camera space, not mirrored)
        detectedHands.sort((a, b) => a.wristX - b.wristX);

        // In camera space: lower X = left side of image
        // When mirrored: left side of image = right side of screen = user's right hand
        // When mirrored: right side of image = left side of screen = user's left hand
        const hand0 = detectedHands[0];
        const hand1 = detectedHands[1];
        if (hand0 && hand1) {
          if (this._isMirrored) {
            redPosition = hand0.position;  // Lower X = right side of screen = user's right hand
            bluePosition = hand1.position; // Higher X = left side of screen = user's left hand
          } else {
            bluePosition = hand0.position;
            redPosition = hand1.position;
          }
        }

        // Update histories
        if (bluePosition) {
          const smoothed = this._addToHistory(
            this._blueHistory,
            bluePosition.rawPosition.x,
            bluePosition.rawPosition.y,
            timestamp
          );
          // Apply smoothing to position
          bluePosition = {
            ...bluePosition,
            rawPosition: smoothed,
            quadrant: this._quadrantMapper.mapToQuadrant(smoothed.x, smoothed.y),
          };
        }
        if (redPosition) {
          const smoothed = this._addToHistory(
            this._redHistory,
            redPosition.rawPosition.x,
            redPosition.rawPosition.y,
            timestamp
          );
          // Apply smoothing to position
          redPosition = {
            ...redPosition,
            rawPosition: smoothed,
            quadrant: this._quadrantMapper.mapToQuadrant(smoothed.x, smoothed.y),
          };
        }
      } else if (detectedHands.length === 1) {
        const hand = detectedHands[0];
        if (hand) {
          const handX = hand.position.rawPosition.x;
          const handY = hand.position.rawPosition.y;

          // Match to existing hand based on SPATIAL PROXIMITY, not position on screen
          // This allows a hand to wave across the entire screen without switching identity
          let assignToBlue = false;

          // If we have history for both hands, match to the closest one
          if (this._blueHistory.positions.length > 0 && this._redHistory.positions.length > 0) {
            const lastBlue = this._blueHistory.positions[this._blueHistory.positions.length - 1];
            const lastRed = this._redHistory.positions[this._redHistory.positions.length - 1];

            if (lastBlue && lastRed) {
              const distToBlue = this._distance(handX, handY, lastBlue.x, lastBlue.y);
              const distToRed = this._distance(handX, handY, lastRed.x, lastRed.y);

              // Assign to whichever is closer
              assignToBlue = distToBlue < distToRed;
            }
          } else if (this._blueHistory.positions.length > 0) {
            // Only blue history exists - check if hand is close enough to be the same hand
            const lastBlue = this._blueHistory.positions[this._blueHistory.positions.length - 1];

            if (lastBlue) {
              const distToBlue = this._distance(handX, handY, lastBlue.x, lastBlue.y);

              // If close enough (within 30% of screen), assume it's the same hand
              if (distToBlue < 0.3) {
                assignToBlue = true;
              }
            }
          } else if (this._redHistory.positions.length > 0) {
            // Only red history exists - check if hand is close enough to be the same hand
            const lastRed = this._redHistory.positions[this._redHistory.positions.length - 1];

            if (lastRed) {
              const distToRed = this._distance(handX, handY, lastRed.x, lastRed.y);

              // If close enough (within 30% of screen), assume it's the same hand
              if (distToRed >= 0.3) {
                // Too far - must be the other hand
                assignToBlue = true;
              }
            }
          } else {
            // No history - use initial postion to guess which hand
            // Hand on right side of screen (in mirrored view) = left hand = blue
            assignToBlue = handX > 0.5;
          }

          if (assignToBlue) {
            const smoothed = this._addToHistory(
              this._blueHistory,
              hand.position.rawPosition.x,
              hand.position.rawPosition.y,
              timestamp
            );
            bluePosition = {
              ...hand.position,
              rawPosition: smoothed,
              quadrant: this._quadrantMapper.mapToQuadrant(smoothed.x, smoothed.y),
            };
            this._blueHistory.assignedHand = "left";
          } else {
            const smoothed = this._addToHistory(
              this._redHistory,
              hand.position.rawPosition.x,
              hand.position.rawPosition.y,
              timestamp
            );
            redPosition = {
              ...hand.position,
              rawPosition: smoothed,
              quadrant: this._quadrantMapper.mapToQuadrant(smoothed.x, smoothed.y),
            };
            this._redHistory.assignedHand = "right";
          }
        }
      }
    }

    // Clear history for hands that aren't detected
    if (!bluePosition) {
      this._blueHistory.positions = [];
      this._blueHistory.confidenceFrames = 0;
    }
    if (!redPosition) {
      this._redHistory.positions = [];
      this._redHistory.confidenceFrames = 0;
    }

    // Apply persistence - keep showing hand for a few frames after it disappears
    if (bluePosition) {
      this._lastBluePosition = bluePosition;
      this._blueFramesMissing = 0;
    } else if (this._lastBluePosition && this._blueFramesMissing < HAND_PERSISTENCE_FRAMES) {
      bluePosition = this._lastBluePosition;
      this._blueFramesMissing++;
    } else {
      this._lastBluePosition = null;
    }

    if (redPosition) {
      this._lastRedPosition = redPosition;
      this._redFramesMissing = 0;
    } else if (this._lastRedPosition && this._redFramesMissing < HAND_PERSISTENCE_FRAMES) {
      redPosition = this._lastRedPosition;
      this._redFramesMissing++;
    } else {
      this._lastRedPosition = null;
    }

    return {
      timestamp,
      blue: bluePosition,
      red: redPosition,
      source: "mediapipe",
    };
  }

  /**
   * Add position to hand history and apply temporal smoothing
   */
  private _addToHistory(
    history: HandHistory,
    x: number,
    y: number,
    timestamp: number
  ): { x: number; y: number } {
    // Add new position
    history.positions.push({ x, y, timestamp });

    // Keep only recent positions
    if (history.positions.length > SMOOTHING_WINDOW) {
      history.positions.shift();
    }

    // Calculate smoothed position (weighted average favoring recent frames)
    let totalWeight = 0;
    let smoothedX = 0;
    let smoothedY = 0;

    for (let i = 0; i < history.positions.length; i++) {
      // More recent frames get higher weight
      const weight = i + 1;
      const pos = history.positions[i];
      if (pos) {
        smoothedX += pos.x * weight;
        smoothedY += pos.y * weight;
        totalWeight += weight;
      }
    }

    return {
      x: smoothedX / totalWeight,
      y: smoothedY / totalWeight,
    };
  }

  /**
   * Calculate distance between two points
   */
  private _distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  /**
   * Determine if we should switch a hand's assignment based on position history
   */
  private _shouldSwitchHandedness(
    history: HandHistory,
    newX: number,
    proposedHand: "left" | "right"
  ): boolean {
    // If no history, accept the proposed assignment
    if (history.positions.length === 0) {
      return proposedHand !== history.assignedHand;
    }

    // If proposed hand matches current assignment, no switch needed
    if (proposedHand === history.assignedHand) {
      return false;
    }

    // Get last known position
    const lastPos = history.positions[history.positions.length - 1];
    if (!lastPos) {
      return proposedHand !== history.assignedHand;
    }

    // Calculate how far the hand has moved
    const distanceMoved = Math.abs(newX - lastPos.x);

    // Only switch if the hand has moved significantly across the screen
    // This prevents flickering when opening/closing hand in place
    return distanceMoved > HANDEDNESS_SWITCH_THRESHOLD;
  }

  /**
   * Detect if palm is facing the camera or facing away
   * Uses Z-coordinates - palm facing camera has fingertips with lower Z than wrist
   */
  private _detectPalmOrientation(landmarks: HandLandmark[]): "facing" | "away" | "unknown" {
    if (landmarks.length < 13) return "unknown";

    const wrist = landmarks[0];
    const middleTip = landmarks[12];
    const indexTip = landmarks[8];

    if (!wrist || !middleTip || !indexTip) return "unknown";

    // Average Z of fingertips vs wrist
    const avgFingerZ = (middleTip.z + indexTip.z) / 2;

    // If fingers are in front of wrist (lower Z), palm facing camera
    // If fingers are behind wrist (higher Z), palm facing away
    const zDiff = avgFingerZ - wrist.z;

    if (Math.abs(zDiff) < 0.02) return "unknown"; // Too close to call

    return zDiff < 0 ? "facing" : "away";
  }

  /**
   * Detect left vs right hand based on ANATOMICAL features (thumb position)
   * This works regardless of where the hand is on screen or if crossed over body
   *
   * MUST detect palm orientation first to correctly interpret thumb position
   */
  private _detectHandednessFromAnatomy(landmarks: HandLandmark[]): "left" | "right" | null {
    if (landmarks.length < 18) return null;

    const thumbTip = landmarks[4];   // Thumb tip
    const indexBase = landmarks[5];  // Index finger MCP
    const pinkyBase = landmarks[17]; // Pinky MCP

    if (!thumbTip || !indexBase || !pinkyBase) return null;

    // First, detect palm orientation
    const palmOrientation = this._detectPalmOrientation(landmarks);

    // Calculate cross product to determine which side thumb is on
    // Vector from pinky to index
    const pinkyToIndexX = indexBase.x - pinkyBase.x;
    const pinkyToIndexY = indexBase.y - pinkyBase.y;

    // Vector from pinky to thumb
    const pinkyToThumbX = thumbTip.x - pinkyBase.x;
    const pinkyToThumbY = thumbTip.y - pinkyBase.y;

    // Cross product (z-component)
    const crossProduct = pinkyToIndexX * pinkyToThumbY - pinkyToIndexY * pinkyToThumbX;

    // DEBUG logging
    console.log('Anatomical Detection:', {
      palmOrientation,
      crossProduct: crossProduct > 0 ? 'positive (thumb right)' : 'negative (thumb left)',
      thumbX: thumbTip.x,
      indexX: indexBase.x,
      pinkyX: pinkyBase.x,
      mirrored: this._isMirrored
    });

    // Interpret based on palm orientation
    let isLeftHand: boolean;

    if (palmOrientation === "facing") {
      // Palm facing camera:
      // MediaPipe gives us UN-mirrored coordinates (from camera's perspective)
      // Positive cross product = thumb on RIGHT in camera coords = LEFT hand in real world
      // Negative cross product = thumb on LEFT in camera coords = RIGHT hand in real world
      isLeftHand = crossProduct > 0;
    } else if (palmOrientation === "away") {
      // Palm facing away (back of hand):
      // The logic is INVERTED from facing
      isLeftHand = crossProduct < 0;
    } else {
      // Can't determine orientation - fall back to MediaPipe
      return null;
    }

    // Return the anatomical result directly - DON'T flip for mirroring
    // The hand IS what it IS regardless of where it appears on screen
    const result = isLeftHand ? "left" : "right";
    console.log('Anatomical result:', result);
    return result;
  }

  /**
   * Detect if hand is open, closed, or partially open based on finger extension
   * Uses distance ratio between fingertips and palm/wrist
   */
  private _detectHandState(landmarks: HandLandmark[]): HandState {
    if (landmarks.length < 21) return "partial"; // Not enough landmarks

    const wrist = landmarks[0];
    if (!wrist) return "partial"; // Wrist not detected

    // Check each finger's extension
    // For each finger, compare distance from tip to wrist vs base to wrist
    const fingerTips = [
      { tip: 8, base: 5 },   // Index finger
      { tip: 12, base: 9 },  // Middle finger
      { tip: 16, base: 13 }, // Ring finger
      { tip: 20, base: 17 }, // Pinky
    ];

    let extendedCount = 0;

    for (const finger of fingerTips) {
      const tip = landmarks[finger.tip];
      const base = landmarks[finger.base];

      if (!tip || !base || !wrist) continue;

      // Calculate distances
      const tipToWristDist = Math.sqrt(
        Math.pow(tip.x - wrist.x, 2) +
        Math.pow(tip.y - wrist.y, 2)
      );

      const baseToWristDist = Math.sqrt(
        Math.pow(base.x - wrist.x, 2) +
        Math.pow(base.y - wrist.y, 2)
      );

      // If tip is significantly further from wrist than base, finger is extended
      // Use ratio > 1.2 as threshold (finger must be at least 20% more extended)
      if (tipToWristDist > baseToWristDist * 1.2) {
        extendedCount++;
      }
    }

    // Classify based on how many fingers are extended
    if (extendedCount >= 3) {
      return "open";      // 3-4 fingers extended
    } else if (extendedCount <= 1) {
      return "closed";    // 0-1 fingers extended (fist)
    } else {
      return "partial";   // 2 fingers extended (partial)
    }
  }

  private _createDetectedPosition(
    landmark: HandLandmark,
    timestamp: number,
    debugLandmarks?: {
      wrist: { x: number; y: number };
      middleFingerTip: { x: number; y: number };
      palmCenter: { x: number; y: number };
    },
    handState?: HandState
  ): DetectedPosition {
    // When mirrored, flip the X coordinate to match the mirrored video display
    // MediaPipe gives coordinates in 0-1 range, so mirroring is (1 - x)
    const x = this._isMirrored ? 1 - landmark.x : landmark.x;

    const quadrant = this._quadrantMapper.mapToQuadrant(x, landmark.y);

    return {
      quadrant,
      confidence: 1.0, // MediaPipe doesn't provide per-landmark confidence
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

    // Reset hand tracking histories
    this._blueHistory = {
      positions: [],
      assignedHand: "left",
      confidenceFrames: 0,
    };
    this._redHistory = {
      positions: [],
      assignedHand: "right",
      confidenceFrames: 0,
    };

    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }
  }

  async processFrame(
    imageData: ImageData,
    timestamp: number
  ): Promise<DetectionFrame> {
    if (!this._isInitialized) {
      await this.initialize();
    }

    // For post-recording analysis, we need to create a canvas and use IMAGE mode
    // This is a simplified implementation - full implementation would handle this better
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext("2d")!;
    ctx.putImageData(imageData, 0, 0);

    const result = this._handLandmarker.detect(canvas);
    return this._processResult(result, timestamp);
  }

  dispose(): void {
    this.stopDetection();

    if (this._handLandmarker) {
      this._handLandmarker.close();
      this._handLandmarker = null;
    }

    this._isInitialized = false;
  }
}
