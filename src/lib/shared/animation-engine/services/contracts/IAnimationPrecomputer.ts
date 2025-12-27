/**
 * Animation Precomputer Interface
 *
 * Manages pre-computation of animation data for smooth playback:
 * - Path cache pre-computation for gap-free trail rendering
 * - Frame pre-rendering for perfect smooth playback
 */

import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { TrailSettings } from "../../domain/types/TrailTypes";
import type { ISequenceAnimationOrchestrator } from "$lib/features/compose/services/contracts/ISequenceAnimationOrchestrator";
import type { ITrailCaptureService } from "$lib/features/compose/services/contracts/ITrailCaptureService";
import type { IAnimationRenderer } from "$lib/features/compose/services/contracts/IAnimationRenderer";
import type {
  AnimationPathCache,
  AnimationPathCacheData,
} from "$lib/features/compose/services/implementations/AnimationPathCache";
import type {
  SequenceFramePreRenderer,
  PreRenderProgress,
} from "$lib/features/compose/services/implementations/SequenceFramePreRenderer";

/**
 * Prop dimensions for cache configuration
 */
export interface PropDimensions {
  width: number;
  height: number;
}

/**
 * Configuration for precomputation service
 */
export interface PrecomputationServiceConfig {
  orchestrator: ISequenceAnimationOrchestrator;
  trailCaptureService: ITrailCaptureService | null;
  renderer: IAnimationRenderer | null;
  propDimensions: PropDimensions;
  canvasSize: number;
  instanceId?: string;
}

/**
 * State of precomputation operations
 */
export interface PrecomputationState {
  pathCacheData: AnimationPathCacheData | null;
  isCachePrecomputing: boolean;
  isPreRendering: boolean;
  preRenderProgress: PreRenderProgress | null;
  preRenderedFramesReady: boolean;
}

/**
 * Callback for state changes
 */
export type PrecomputationStateCallback = (
  state: Partial<PrecomputationState>
) => void;

/**
 * Service for managing animation precomputation
 */
export interface IAnimationPrecomputer {
  /**
   * Initialize the service with required dependencies
   */
  initialize(config: PrecomputationServiceConfig): void;

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PrecomputationServiceConfig>): void;

  /**
   * Set callback for state changes
   */
  setStateCallback(callback: PrecomputationStateCallback): void;

  /**
   * Pre-compute animation paths for gap-free trail rendering
   * @param seqData - Sequence data to precompute
   * @param totalBeats - Total number of beats
   * @param beatDurationMs - Duration of each beat in milliseconds
   * @param trailSettings - Trail settings including usePathCache flag
   */
  precomputeAnimationPaths(
    seqData: SequenceData,
    totalBeats: number,
    beatDurationMs: number,
    trailSettings: TrailSettings
  ): Promise<void>;

  /**
   * Pre-render entire sequence to frames for perfect smooth playback
   * @param seqData - Sequence data to pre-render
   * @param trailSettings - Trail settings for rendering
   * @param isInitialized - Function to check if renderer is initialized
   */
  preRenderSequenceFrames(
    seqData: SequenceData,
    trailSettings: TrailSettings,
    isInitialized: () => boolean
  ): Promise<void>;

  /**
   * Initialize frame pre-renderer (call after pixi is ready)
   */
  initializeFramePreRenderer(): void;

  /**
   * Get the path cache instance (for trail point retrieval)
   */
  getPathCache(): AnimationPathCache | null;

  /**
   * Get the frame pre-renderer (for frame retrieval)
   */
  getFramePreRenderer(): SequenceFramePreRenderer | null;

  /**
   * Clear all caches
   */
  clearCaches(): void;

  /**
   * Clean up resources
   */
  dispose(): void;
}
