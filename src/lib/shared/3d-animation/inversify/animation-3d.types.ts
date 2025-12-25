/**
 * Animation 3D Service Types
 *
 * Dependency injection symbols for the 3D animation services.
 */

export const ANIMATION_3D_TYPES = {
  // Core math services
  IAngleMathService: Symbol.for("IAngleMathService"),
  IOrientationService: Symbol.for("IOrientationService"),
  IMotionCalculatorService: Symbol.for("IMotionCalculatorService"),

  // Coordinate and interpolation services
  IPlaneCoordinateMapper: Symbol.for("IPlaneCoordinateMapper"),
  IPropStateInterpolatorService: Symbol.for("IPropStateInterpolatorService"),

  // Conversion services
  ISequenceConverterService: Symbol.for("ISequenceConverterService"),

  // Persistence
  IAnimation3DPersistenceService: Symbol.for("IAnimation3DPersistenceService"),

  // Avatar system (production-quality rigged model support)
  IAvatarSkeletonService: Symbol.for("IAvatarSkeletonService"),
  IIKSolverService: Symbol.for("IIKSolverService"),
  IAvatarCustomizationService: Symbol.for("IAvatarCustomizationService"),
  IAvatarAnimationService: Symbol.for("IAvatarAnimationService"),
};
