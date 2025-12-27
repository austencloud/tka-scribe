/**
 * Animation Precomputer Implementation
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
import {
  AnimationPathCache,
  type AnimationPathCacheData,
} from "$lib/features/compose/services/implementations/AnimationPathCache";
import {
  SequenceFramePreRenderer,
  type PreRenderProgress,
} from "$lib/features/compose/services/implementations/SequenceFramePreRenderer";
import type {
  IAnimationPrecomputer,
  PrecomputationServiceConfig,
  PrecomputationStateCallback,
  PropDimensions,
} from "../contracts/IAnimationPrecomputer";

export class AnimationPrecomputer implements IAnimationPrecomputer {
  private orchestrator: ISequenceAnimationOrchestrator | null = null;
  private trailCaptureService: ITrailCaptureService | null = null;
  private renderer: IAnimationRenderer | null = null;
  private propDimensions: PropDimensions = { width: 100, height: 100 };
  private canvasSize: number = 950;
  private instanceId: string = "unknown";

  private pathCache: AnimationPathCache | null = null;
  private framePreRenderer: SequenceFramePreRenderer | null = null;
  private stateCallback: PrecomputationStateCallback | null = null;

  initialize(config: PrecomputationServiceConfig): void {
    this.orchestrator = config.orchestrator;
    this.trailCaptureService = config.trailCaptureService;
    this.renderer = config.renderer;
    this.propDimensions = config.propDimensions;
    this.canvasSize = config.canvasSize;
    this.instanceId = config.instanceId ?? "unknown";
  }

  updateConfig(config: Partial<PrecomputationServiceConfig>): void {
    if (config.orchestrator !== undefined)
      this.orchestrator = config.orchestrator;
    if (config.trailCaptureService !== undefined)
      this.trailCaptureService = config.trailCaptureService;
    if (config.renderer !== undefined)
      this.renderer = config.renderer;
    if (config.propDimensions !== undefined)
      this.propDimensions = config.propDimensions;
    if (config.canvasSize !== undefined) this.canvasSize = config.canvasSize;
  }

  setStateCallback(callback: PrecomputationStateCallback): void {
    this.stateCallback = callback;
  }

  initializeFramePreRenderer(): void {
    if (this.orchestrator && this.renderer && !this.framePreRenderer) {
      this.framePreRenderer = new SequenceFramePreRenderer(
        this.orchestrator,
        this.renderer
      );
    }
  }

  async precomputeAnimationPaths(
    seqData: SequenceData,
    totalBeats: number,
    beatDurationMs: number,
    trailSettings: TrailSettings
  ): Promise<void> {
    if (
      !trailSettings.usePathCache ||
      !this.orchestrator ||
      !this.trailCaptureService
    ) {
      this.emitState({ pathCacheData: null });
      return;
    }

    try {
      this.emitState({ isCachePrecomputing: true });

      // Create path cache instance if needed
      // IMPORTANT: Always use standard 950x950 coordinate system for cache (matches viewBox)
      if (!this.pathCache) {
        this.pathCache = new AnimationPathCache({
          cacheFps: 120, // High FPS for ultra-smooth trails
          canvasSize: 950, // Always use standard viewBox size for resolution-independent caching
          propDimensions: this.propDimensions,
        });

        // Wire cache to trail capture service for backfill support
        this.trailCaptureService.setAnimationCacheService(
          this.pathCache as any
        );
      }

      // CRITICAL: Initialize orchestrator with sequence data BEFORE pre-computation!
      const initSuccess = this.orchestrator.initializeWithDomainData(seqData);
      if (!initSuccess) {
        throw new Error("Failed to initialize orchestrator with sequence data");
      }

      // Create function to calculate prop states at any beat
      const orchestrator = this.orchestrator;
      const calculateStateFunc = (beat: number) => {
        orchestrator.calculateState(beat);
        return {
          blueProp: orchestrator.getBluePropState(),
          redProp: orchestrator.getRedPropState(),
        };
      };

      const startTime = performance.now();

      // Pre-compute paths
      const cacheData = await this.pathCache.precomputePaths(
        calculateStateFunc,
        totalBeats,
        beatDurationMs
      );

      const computeTime = performance.now() - startTime;

      this.emitState({ pathCacheData: cacheData });
      console.log(
        `✅ [${this.instanceId}] Cache precomputation complete in ${computeTime.toFixed(1)}ms, isValid=${this.pathCache?.isValid()}`
      );
    } catch (error) {
      console.error(
        `❌ [${this.instanceId}] Failed to pre-compute animation paths:`,
        error
      );
      this.emitState({ pathCacheData: null });
    } finally {
      this.emitState({ isCachePrecomputing: false });
    }
  }

  async preRenderSequenceFrames(
    seqData: SequenceData,
    trailSettings: TrailSettings,
    isInitialized: () => boolean
  ): Promise<void> {
    try {
      this.emitState({
        isPreRendering: true,
        preRenderedFramesReady: false,
        preRenderProgress: null,
      });

      // CRITICAL: Wait for renderer to be initialized before pre-rendering
      const maxWaitTime = 5000; // 5 seconds max
      const startWait = performance.now();
      while (!isInitialized() && performance.now() - startWait < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (!isInitialized()) {
        console.error(
          "⚠️ Renderer not initialized after 5s, skipping pre-render"
        );
        return;
      }

      console.log("🎬 Starting frame pre-render for perfect playback...");

      if (!this.framePreRenderer) {
        console.error("⚠️ Frame pre-renderer not available");
        return;
      }

      // Pre-render with progress updates
      await this.framePreRenderer.preRenderSequence(
        seqData,
        {
          fps: 60,
          canvasSize: this.canvasSize,
          nonBlocking: true,
          framesPerChunk: 3,
          trailSettings,
        },
        (progress) => {
          this.emitState({ preRenderProgress: progress });
          console.log(
            `📊 Pre-render progress: ${progress.percent.toFixed(1)}%`
          );
        }
      );

      this.emitState({ preRenderedFramesReady: true });
      console.log(
        "✅ Frame pre-render complete! Switching to perfect playback."
      );
    } catch (error) {
      console.error("❌ Failed to pre-render frames:", error);
      this.emitState({ preRenderedFramesReady: false });
    } finally {
      this.emitState({
        isPreRendering: false,
        preRenderProgress: null,
      });
    }
  }

  getPathCache(): AnimationPathCache | null {
    return this.pathCache;
  }

  getFramePreRenderer(): SequenceFramePreRenderer | null {
    return this.framePreRenderer;
  }

  clearCaches(): void {
    this.pathCache?.clear();
    this.framePreRenderer?.clear();
    this.emitState({
      pathCacheData: null,
      preRenderedFramesReady: false,
    });
  }

  dispose(): void {
    this.clearCaches();
    this.orchestrator = null;
    this.trailCaptureService = null;
    this.renderer = null;
    this.pathCache = null;
    this.framePreRenderer = null;
    this.stateCallback = null;
  }

  private emitState(
    state: Partial<{
      pathCacheData: AnimationPathCacheData | null;
      isCachePrecomputing: boolean;
      isPreRendering: boolean;
      preRenderProgress: PreRenderProgress | null;
      preRenderedFramesReady: boolean;
    }>
  ): void {
    this.stateCallback?.(state);
  }
}
