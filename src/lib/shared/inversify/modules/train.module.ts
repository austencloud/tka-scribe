/**
 * Train Module - DI Container Module
 *
 * Registers all hand detection and training services for the Train feature.
 */

import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { TYPES } from "../types";

// Service implementations
import { HandLandmarkerService } from "../../../features/train/services/implementations/HandLandmarkerService";
import { HandednessAnalyzer } from "../../../features/train/services/implementations/HandednessAnalyzer";
import { HandStateAnalyzer } from "../../../features/train/services/implementations/HandStateAnalyzer";
import { HandTrackingStabilizer } from "../../../features/train/services/implementations/HandTrackingStabilizer";
import { HandAssignmentService } from "../../../features/train/services/implementations/HandAssignmentService";
import { MediaPipeDetectionService } from "../../../features/train/services/implementations/MediaPipeDetectionService";
import { CameraService } from "../../../features/train/services/implementations/CameraService";
import { VoiceCommandService } from "../../../features/train/services/implementations/VoiceCommandService";
import { PerformanceHistoryService } from "../../../features/train/services/implementations/PerformanceHistoryService";
import { TrainChallengeService } from "../../../features/train/services/implementations/TrainChallengeService";

export const trainModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === HAND DETECTION SERVICES ===
    // Core MediaPipe wrapper
    options
      .bind(TYPES.IHandLandmarkerService)
      .to(HandLandmarkerService)
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
      .bind(TYPES.IHandAssignmentService)
      .to(HandAssignmentService)
      .inSingletonScope();

    // Position detection orchestrator
    options
      .bind(TYPES.IPositionDetectionService)
      .to(MediaPipeDetectionService)
      .inSingletonScope();

    // Camera service
    options.bind(TYPES.ICameraService).to(CameraService).inSingletonScope();

    // === PRACTICE SERVICES ===
    options
      .bind(TYPES.IVoiceCommandService)
      .to(VoiceCommandService)
      .inSingletonScope();

    // === CHALLENGES SERVICES ===
    options
      .bind(TYPES.ITrainChallengeService)
      .to(TrainChallengeService)
      .inSingletonScope();

    // === PROGRESS SERVICES ===
    options
      .bind(TYPES.IPerformanceHistoryService)
      .to(PerformanceHistoryService)
      .inSingletonScope();
  }
);
