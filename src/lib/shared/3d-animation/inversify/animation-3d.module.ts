/**
 * Animation 3D DI Module
 *
 * Registers all 3D animation services with the inversify container.
 */

import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { ANIMATION_3D_TYPES } from "./animation-3d.types";

// Implementations
import { AngleMathCalculator } from "../services/implementations/AngleMathCalculator";
import { OrientationMapper } from "../services/implementations/OrientationMapper";
import { MotionCalculator } from "../services/implementations/MotionCalculator";
import { PlaneCoordinateMapper } from "../services/implementations/PlaneCoordinateMapper";
import { PropStateInterpolator } from "../services/implementations/PropStateInterpolator";
import { SequenceConverter } from "../services/implementations/SequenceConverter";
import { Animation3DPersister } from "../services/implementations/Animation3DPersister";

// Avatar system (production-quality rigged model support)
import { AvatarSkeletonBuilder } from "../services/implementations/AvatarSkeletonBuilder";
import { IKSolver } from "../services/implementations/IKSolver";
import { AvatarCustomizer } from "../services/implementations/AvatarCustomizer";
import { AvatarAnimator } from "../services/implementations/AvatarAnimator";

export const animation3DModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // Core math services (no dependencies)
    options
      .bind(ANIMATION_3D_TYPES.IAngleMathCalculator)
      .to(AngleMathCalculator)
      .inSingletonScope();

    options
      .bind(ANIMATION_3D_TYPES.IOrientationMapper)
      .to(OrientationMapper)
      .inSingletonScope();

    // Motion calculator (depends on angle math + orientation)
    options
      .bind(ANIMATION_3D_TYPES.IMotionCalculator3D)
      .to(MotionCalculator)
      .inSingletonScope();

    // Coordinate mapping
    options
      .bind(ANIMATION_3D_TYPES.IPlaneCoordinateMapper)
      .to(PlaneCoordinateMapper)
      .inSingletonScope();

    // Prop state interpolation (depends on angle math, orientation, motion calculator)
    options
      .bind(ANIMATION_3D_TYPES.IPropStateInterpolator)
      .to(PropStateInterpolator)
      .inSingletonScope();

    // Sequence conversion
    options
      .bind(ANIMATION_3D_TYPES.ISequenceConverter)
      .to(SequenceConverter)
      .inSingletonScope();

    // Persistence
    options
      .bind(ANIMATION_3D_TYPES.IAnimation3DPersister)
      .to(Animation3DPersister)
      .inSingletonScope();

    // ═══════════════════════════════════════════════════════════════════════════
    // AVATAR SYSTEM (Production-quality rigged model support)
    // ═══════════════════════════════════════════════════════════════════════════

    // Skeleton management (GLTF loading, bone access)
    options
      .bind(ANIMATION_3D_TYPES.IAvatarSkeletonBuilder)
      .to(AvatarSkeletonBuilder)
      .inSingletonScope();

    // IK solver (analytic, CCD, FABRIK algorithms)
    options
      .bind(ANIMATION_3D_TYPES.IIKSolver)
      .to(IKSolver)
      .inSingletonScope();

    // Customization (body type, skin tone, proportions)
    options
      .bind(ANIMATION_3D_TYPES.IAvatarCustomizer)
      .to(AvatarCustomizer)
      .inSingletonScope();

    // Animation (pose blending, transitions)
    options
      .bind(ANIMATION_3D_TYPES.IAvatarAnimator)
      .to(AvatarAnimator)
      .inSingletonScope();
  }
);
