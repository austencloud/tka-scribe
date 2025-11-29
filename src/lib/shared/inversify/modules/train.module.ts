/**
 * Train Module - DI Container Module
 * 
 * Registers all hand detection and training services for the Train feature.
 */

import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { TYPES } from "../types";

// Service implementations
import { HandLandmarkerService } from "../../../modules/train/services/implementations/HandLandmarkerService";
import { HandednessAnalyzer } from "../../../modules/train/services/implementations/HandednessAnalyzer";
import { HandStateAnalyzer } from "../../../modules/train/services/implementations/HandStateAnalyzer";
import { HandTrackingStabilizer } from "../../../modules/train/services/implementations/HandTrackingStabilizer";
import { HandAssignmentService } from "../../../modules/train/services/implementations/HandAssignmentService";

export const trainModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === HAND DETECTION SERVICES ===
    // Core MediaPipe wrapper
    options.bind(TYPES.IHandLandmarkerService).to(HandLandmarkerService).inSingletonScope();

    // Analysis services
    options.bind(TYPES.IHandednessAnalyzer).to(HandednessAnalyzer).inSingletonScope();
    options.bind(TYPES.IHandStateAnalyzer).to(HandStateAnalyzer).inSingletonScope();

    // Tracking and assignment
    options.bind(TYPES.IHandTrackingStabilizer).to(HandTrackingStabilizer).inSingletonScope();
    options.bind(TYPES.IHandAssignmentService).to(HandAssignmentService).inSingletonScope();
  }
);
