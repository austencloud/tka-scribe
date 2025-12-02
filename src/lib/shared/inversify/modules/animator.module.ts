import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { AngleCalculator } from "../../../features/animate/services/implementations/AngleCalculator";
import { AnimationLoopService } from "../../../features/animate/services/implementations/AnimationLoopService";
import { AnimationPlaybackController } from "../../../features/animate/services/implementations/AnimationPlaybackController";
import { AnimationStateManager as AnimationStateService } from "../../../features/animate/services/implementations/AnimationStateManager";
import { AnimatedImageTranscoder } from "../../../features/animate/services/implementations/AnimatedImageTranscoder";
import { BeatCalculator as BeatCalculationService } from "../../../features/animate/services/implementations/BeatCalculator";
import { CanvasRenderer } from "../../../features/animate/services/implementations/CanvasRenderer";
import { CoordinateUpdater } from "../../../features/animate/services/implementations/CoordinateUpdater";
import { EndpointCalculator } from "../../../features/animate/services/implementations/EndpointCalculator";
import { GifExportService } from "../../../features/animate/services/implementations/GifExportService";
import { GifExportOrchestrator } from "../../../features/animate/services/implementations/GifExportOrchestrator";
import { MotionCalculator } from "../../../features/animate/services/implementations/MotionCalculator";
// PixiAnimationRenderer moved to on-demand loading in PixiModule (pixi.js ~500KB)
import { PropInterpolator as PropInterpolationService } from "../../../features/animate/services/implementations/PropInterpolator";
import { SequenceAnimationOrchestrator } from "../../../features/animate/services/implementations/SequenceAnimationOrchestrator";
import { SequenceLoopabilityChecker } from "../../../features/animate/services/implementations/SequenceLoopabilityChecker";
import { SequenceNormalizationService } from "../../../features/animate/services/implementations/SequenceNormalizationService";
import { SVGGenerator } from "../../../features/animate/services/implementations/SVGGenerator";
import { TrailCaptureService } from "../../../features/animate/services/implementations/TrailCaptureService";
import { TunnelModeSequenceManager } from "../../../features/animate/services/implementations/TunnelModeSequenceManager";
import { AnimationService } from "../../application/services/implementations/AnimationService";
import { TYPES } from "../types";

export const animatorModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === CORE ANIMATION SERVICES ===
    options.bind(TYPES.IAnimationService).to(AnimationService);
    options.bind(TYPES.IAnimationLoopService).to(AnimationLoopService);
    options
      .bind(TYPES.IAnimationPlaybackController)
      .to(AnimationPlaybackController);
    options
      .bind(TYPES.ISequenceAnimationOrchestrator)
      .to(SequenceAnimationOrchestrator);
    options.bind(TYPES.IAnimationStateService).to(AnimationStateService);
    options.bind(TYPES.IBeatCalculationService).to(BeatCalculationService);
    options.bind(TYPES.IPropInterpolationService).to(PropInterpolationService);
    options
      .bind(TYPES.ISequenceLoopabilityChecker)
      .to(SequenceLoopabilityChecker);

    // === CALCULATION SERVICES ===
    options.bind(TYPES.IAngleCalculator).to(AngleCalculator);
    options.bind(TYPES.ICoordinateUpdater).to(CoordinateUpdater);
    options.bind(TYPES.IMotionCalculator).to(MotionCalculator);
    options.bind(TYPES.IEndpointCalculator).to(EndpointCalculator);

    // === RENDERING SERVICES ===
    options.bind(TYPES.ICanvasRenderer).to(CanvasRenderer);
    // IPixiAnimationRenderer loaded on-demand via PixiModule when animation canvas is used
    options.bind(TYPES.ISVGGenerator).to(SVGGenerator);
    options.bind(TYPES.IGifExportService).to(GifExportService);
    options.bind(TYPES.IAnimatedImageTranscoder).to(AnimatedImageTranscoder);
    options.bind(TYPES.IGifExportOrchestrator).to(GifExportOrchestrator);

    // === TRAIL SERVICES ===
    options.bind(TYPES.ITrailCaptureService).to(TrailCaptureService);

    // === MODE-SPECIFIC SERVICES ===
    options
      .bind(TYPES.ISequenceNormalizationService)
      .to(SequenceNormalizationService);
    options
      .bind(TYPES.ITunnelModeSequenceManager)
      .to(TunnelModeSequenceManager);

    // ============================================================================
    // ARCHIVED BINDINGS (services moved to archive/animator-unused-services/)
    // ============================================================================
    // options.bind(TYPES.IAnimationControlService).to(AnimationControlService);
    // options.bind(TYPES.IMotionParameterService).to(MotionParameterService);
    // options.bind(TYPES.IMotionLetterIdentificationService).to(MotionLetterIdentificationService);
    // options.bind(TYPES.IOverlayRenderer).to(OverlayRenderer);
    // options.bind(TYPES.ISvgConfig).to(SvgConfig);
    // options.bind(TYPES.ISvgUtilityService).to(SvgUtilityService);
  }
);
