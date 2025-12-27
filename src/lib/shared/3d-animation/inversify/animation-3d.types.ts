/**
 * Animation 3D Service Types
 *
 * Dependency injection symbols for the 3D animation services.
 */

export const ANIMATION_3D_TYPES = {
  // Core math services
  IAngleMathCalculator: Symbol.for("IAngleMathCalculator"),
  IOrientationMapper: Symbol.for("IOrientationMapper"),
  IMotionCalculator: Symbol.for("IMotionCalculator"),

  // Coordinate and interpolation services
  IPlaneCoordinateMapper: Symbol.for("IPlaneCoordinateMapper"),
  IPropStateInterpolator: Symbol.for("IPropStateInterpolator"),

  // Conversion services
  ISequenceConverter: Symbol.for("ISequenceConverter"),

  // Persistence
  IAnimation3DPersister: Symbol.for("IAnimation3DPersister"),

  // Avatar system (production-quality rigged model support)
  IAvatarSkeletonBuilder: Symbol.for("IAvatarSkeletonBuilder"),
  IIKSolver: Symbol.for("IIKSolver"),
  IAvatarCustomizer: Symbol.for("IAvatarCustomizer"),
  IAvatarAnimator: Symbol.for("IAvatarAnimator"),
};
