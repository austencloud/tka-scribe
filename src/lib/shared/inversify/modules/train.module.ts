/**
 * Train Module - DI Container Module
 *
 * Registers all hand detection and training services for the Train feature.
 */

import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { TYPES } from "../types";

// Service implementations
import { HandLandmarker } from "../../../features/train/services/implementations/HandLandmarker";
import { HandednessAnalyzer } from "../../../features/train/services/implementations/HandednessAnalyzer";
import { HandStateAnalyzer } from "../../../features/train/services/implementations/HandStateAnalyzer";
import { HandTrackingStabilizer } from "../../../features/train/services/implementations/HandTrackingStabilizer";
import { HandAssigner } from "../../../features/train/services/implementations/HandAssigner";
import { MediaPipeDetector } from "../../../features/train/services/implementations/MediaPipeDetector";
import { CameraManager } from "../../../features/train/services/implementations/CameraManager";
import { VoiceCommandHandler } from "../../../features/train/services/implementations/VoiceCommandHandler";
import { PerformanceHistoryTracker } from "../../../features/train/services/implementations/PerformanceHistoryTracker";
import { TrainChallengeManager } from "../../../features/train/services/implementations/TrainChallengeManager";

export const trainModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === HAND DETECTION SERVICES ===
    // Core MediaPipe wrapper
    options
      .bind(TYPES.IHandLandmarker)
      .to(HandLandmarker)
      .inSingletonScope();

    // Analysis services
    options
      .bind(TYPES.IHandednessAnalyzer)
      .to(HandednessAnalyzer)
      .inSingletonScope();
    options
      .bind(TYPES.IHandStateAnalyzer)
      .to(HandStateAnalyzer)
      .inSingletonScope();

    // Tracking and assignment
    options
      .bind(TYPES.IHandTrackingStabilizer)
      .to(HandTrackingStabilizer)
      .inSingletonScope();
    options
      .bind(TYPES.IHandAssigner)
      .to(HandAssigner)
      .inSingletonScope();

    // Position detection orchestrator
    options
      .bind(TYPES.IPositionDetector)
      .to(MediaPipeDetector)
      .inSingletonScope();

    // Camera service
    options.bind(TYPES.ICameraManager).to(CameraManager).inSingletonScope();

    // === PRACTICE SERVICES ===
    options
      .bind(TYPES.IVoiceCommandHandler)
      .to(VoiceCommandHandler)
      .inSingletonScope();

    // === CHALLENGES SERVICES ===
    options
      .bind(TYPES.ITrainChallengeManager)
      .to(TrainChallengeManager)
      .inSingletonScope();

    // === PROGRESS SERVICES ===
    options
      .bind(TYPES.IPerformanceHistoryTracker)
      .to(PerformanceHistoryTracker)
      .inSingletonScope();
  }
);
