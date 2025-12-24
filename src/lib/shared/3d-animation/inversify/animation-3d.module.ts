/**
 * Animation 3D DI Module
 *
 * Registers all 3D animation services with the inversify container.
 */

import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { ANIMATION_3D_TYPES } from "./animation-3d.types";

// Implementations
import { AngleMathService } from "../services/implementations/AngleMathService";
import { OrientationService } from "../services/implementations/OrientationService";
import { MotionCalculatorService } from "../services/implementations/MotionCalculatorService";
import { PlaneCoordinateMapper } from "../services/implementations/PlaneCoordinateMapper";
import { PropStateInterpolatorService } from "../services/implementations/PropStateInterpolatorService";
import { SequenceConverterService } from "../services/implementations/SequenceConverterService";
import { Animation3DPersistenceService } from "../services/implementations/Animation3DPersistenceService";

export const animation3DModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // Core math services (no dependencies)
    options
      .bind(ANIMATION_3D_TYPES.IAngleMathService)
      .to(AngleMathService)
      .inSingletonScope();

    options
      .bind(ANIMATION_3D_TYPES.IOrientationService)
      .to(OrientationService)
      .inSingletonScope();

    // Motion calculator (depends on angle math + orientation)
    options
      .bind(ANIMATION_3D_TYPES.IMotionCalculatorService)
      .to(MotionCalculatorService)
      .inSingletonScope();

    // Coordinate mapping
    options
      .bind(ANIMATION_3D_TYPES.IPlaneCoordinateMapper)
      .to(PlaneCoordinateMapper)
      .inSingletonScope();

    // Prop state interpolation (depends on angle math, orientation, motion calculator)
    options
      .bind(ANIMATION_3D_TYPES.IPropStateInterpolatorService)
      .to(PropStateInterpolatorService)
      .inSingletonScope();

    // Sequence conversion
    options
      .bind(ANIMATION_3D_TYPES.ISequenceConverterService)
      .to(SequenceConverterService)
      .inSingletonScope();

    // Persistence
    options
      .bind(ANIMATION_3D_TYPES.IAnimation3DPersistenceService)
      .to(Animation3DPersistenceService)
      .inSingletonScope();
  }
);
