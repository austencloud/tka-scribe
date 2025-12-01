/**
 * Animator Service Implementations
 *
 * ONLY implementation classes - NO interfaces re-exported here.
 * Interfaces are exported from contracts/index.ts
 */

// Core animation services
export { AnimationLoopService } from "./AnimationLoopService";
export { AnimationPlaybackController } from "./AnimationPlaybackController";
export { AnimationStateManager as AnimationStateService } from "./AnimationStateManager";
export { BeatCalculator as BeatCalculationService } from "./BeatCalculator";
export { PropInterpolator as PropInterpolationService } from "./PropInterpolator";
export { SequenceAnimationOrchestrator } from "./SequenceAnimationOrchestrator";
export { SequenceLoopabilityChecker } from "./SequenceLoopabilityChecker";

// Calculation services
export { AngleCalculator } from "./AngleCalculator";
export { CoordinateUpdater } from "./CoordinateUpdater";
export { EndpointCalculator } from "./EndpointCalculator";
export { MotionCalculator } from "./MotionCalculator";

// Rendering services
export { CanvasRenderer } from "./CanvasRenderer";
export { PixiAnimationRenderer } from "./PixiAnimationRenderer";
export { SVGGenerator } from "./SVGGenerator";
export { GifExportService } from "./GifExportService";
export { GifExportOrchestrator } from "./GifExportOrchestrator";
export { AnimatedImageTranscoder } from "./AnimatedImageTranscoder";
export { SequenceFramePreRenderer } from "./SequenceFramePreRenderer";
export { VideoPreRenderService, getVideoPreRenderService } from "./VideoPreRenderService";
// VideoFrameRenderer removed - now using real PixiJS renderer instead of fake Canvas 2D shapes
export { TrailPathGenerator, getTrailPathGenerator } from "./TrailPathGenerator";

// Video playback services
export { VideoPlaybackService, getVideoPlaybackService } from "./VideoPlaybackService";
export { VideoGenerationCoordinator, getVideoGenerationCoordinator } from "./VideoGenerationCoordinator";

// Trail services
export { TrailCaptureService } from "./TrailCaptureService";

// Mode-specific services
export { SequenceNormalizationService } from "./SequenceNormalizationService";
export { TunnelModeSequenceManager } from "./TunnelModeSequenceManager";
