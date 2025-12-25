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

// Avatar system (production-quality rigged model support)
import { AvatarSkeletonService } from "../services/implementations/AvatarSkeletonService";
import { IKSolverService } from "../services/implementations/IKSolverService";
import { AvatarCustomizationService } from "../services/implementations/AvatarCustomizationService";
import { AvatarAnimationService } from "../services/implementations/AvatarAnimationService";

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

    // ═══════════════════════════════════════════════════════════════════════════
    // AVATAR SYSTEM (Production-quality rigged model support)
    // ═══════════════════════════════════════════════════════════════════════════

    // Skeleton management (GLTF loading, bone access)
    options
      .bind(ANIMATION_3D_TYPES.IAvatarSkeletonService)
      .to(AvatarSkeletonService)
      .inSingletonScope();

    // IK solver (analytic, CCD, FABRIK algorithms)
    options
      .bind(ANIMATION_3D_TYPES.IIKSolverService)
      .to(IKSolverService)
      .inSingletonScope();

    // Customization (body type, skin tone, proportions)
    options
      .bind(ANIMATION_3D_TYPES.IAvatarCustomizationService)
      .to(AvatarCustomizationService)
      .inSingletonScope();

    // Animation (pose blending, transitions)
    options
      .bind(ANIMATION_3D_TYPES.IAvatarAnimationService)
      .to(AvatarAnimationService)
      .inSingletonScope();
  }
);
