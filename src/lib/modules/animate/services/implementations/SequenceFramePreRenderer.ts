/**
 * Sequence Frame Pre-Renderer
 *
 * Pre-renders entire animation sequence to ImageBitmap frames for perfect smooth playback.
 *
 * Two-phase approach:
 * 1. Immediate preview with current rendering (may stutter)
 * 2. Background pre-render to ImageBitmap frames (perfect smoothness)
 *
 * Once pre-render completes, playback switches to frame-based rendering
 * which is immune to device stutters and provides perfect trail loops.
 */

import type { SequenceData } from "$shared";
import type { ISequenceAnimationOrchestrator } from "../contracts/ISequenceAnimationOrchestrator";
import type { IPixiAnimationRenderer } from "../contracts/IPixiAnimationRenderer";
import type { TrailSettings } from "../../domain/types/TrailTypes";

/**
 * Pre-rendered frame data
 */
export interface PreRenderedFrame {
  /** Frame number (0-indexed) */
  frameNumber: number;
  /** Beat number this frame represents */
  beat: number;
  /** Timestamp in ms from animation start */
  timestamp: number;
  /** Rendered frame as ImageBitmap (GPU-ready) */
  bitmap: ImageBitmap;
}

/**
 * Complete pre-rendered sequence
 */
export interface PreRenderedSequence {
  /** Sequence ID for cache lookup */
  sequenceId: string;
  /** Array of all frames */
  frames: PreRenderedFrame[];
  /** Total duration in ms */
  totalDurationMs: number;
  /** Total beats */
  totalBeats: number;
  /** Frames per second */
  fps: number;
  /** Canvas size used for rendering */
  canvasSize: number;
  /** Whether this sequence is fully rendered and ready */
  isComplete: boolean;
}

/**
 * Progress callback for UI updates
 */
export interface PreRenderProgress {
  /** Current frame being rendered */
  currentFrame: number;
  /** Total frames to render */
  totalFrames: number;
  /** Progress percentage (0-100) */
  percent: number;
  /** Estimated time remaining in seconds */
  estimatedSecondsRemaining: number;
}

/**
 * Configuration for pre-rendering
 */
export interface PreRenderConfig {
  /** Frames per second (default: 60) */
  fps: number;
  /** Canvas size (default: 950) */
  canvasSize: number;
  /** Whether to use requestIdleCallback for non-blocking render (default: true) */
  nonBlocking: boolean;
  /** Max frames to render per chunk in non-blocking mode (default: 5) */
  framesPerChunk: number;
  /** Trail settings for rendering */
  trailSettings: TrailSettings;
}

const DEFAULT_CONFIG: PreRenderConfig = {
  fps: 60,
  canvasSize: 950,
  nonBlocking: true,
  framesPerChunk: 5,
  trailSettings: {} as any, // Will be provided by caller
};

/**
 * Sequence Frame Pre-Renderer Service
 *
 * Pre-renders entire animation to ImageBitmap frames for stutter-free playback.
 */
export class SequenceFramePreRenderer {
  private currentRender: PreRenderedSequence | null = null;
  private isRendering = false;
  private shouldCancel = false;

  constructor(
    private readonly orchestrator: ISequenceAnimationOrchestrator,
    private readonly renderer: IPixiAnimationRenderer
  ) {}

  /**
   * Pre-render entire sequence to frames
   *
   * @param sequenceData - Sequence to render
   * @param config - Rendering configuration
   * @param onProgress - Progress callback for UI updates
   * @returns Promise resolving to pre-rendered sequence
   */
  async preRenderSequence(
    sequenceData: SequenceData,
    config: Partial<PreRenderConfig> = {},
    onProgress?: (progress: PreRenderProgress) => void
  ): Promise<PreRenderedSequence> {
    const fullConfig = { ...DEFAULT_CONFIG, ...config };

    // Prevent multiple simultaneous renders
    if (this.isRendering) {
      throw new Error("Pre-render already in progress. Cancel first.");
    }

    this.isRendering = true;
    this.shouldCancel = false;

    try {
      // Initialize orchestrator with sequence data
      const initSuccess = this.orchestrator.initializeWithDomainData(sequenceData);
      if (!initSuccess) {
        throw new Error("Failed to initialize orchestrator with sequence data");
      }

      const metadata = this.orchestrator.getMetadata();
      const totalBeats = metadata.totalBeats;
      const beatDurationMs = 1000; // Assuming 1 second per beat (adjust as needed)
      const totalDurationMs = totalBeats * beatDurationMs;
      const frameTimeMs = 1000 / fullConfig.fps;
      const totalFrames = Math.ceil(totalDurationMs / frameTimeMs);

      console.log(`🎬 Pre-rendering sequence: ${sequenceData.word || sequenceData.id}`);
      console.log(`   Frames: ${totalFrames} @ ${fullConfig.fps} FPS`);
      console.log(`   Duration: ${totalDurationMs}ms (${totalBeats} beats)`);

      const frames: PreRenderedFrame[] = [];
      const startTime = performance.now();

      // Create offscreen canvas for rendering
      const offscreenCanvas = new OffscreenCanvas(fullConfig.canvasSize, fullConfig.canvasSize);
      const ctx = offscreenCanvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get 2D context from offscreen canvas");
      }

      // Render frames
      if (fullConfig.nonBlocking) {
        // Non-blocking: Render in chunks using requestIdleCallback
        await this.renderFramesNonBlocking(
          frames,
          totalFrames,
          totalBeats,
          beatDurationMs,
          frameTimeMs,
          offscreenCanvas,
          ctx,
          fullConfig,
          startTime,
          onProgress
        );
      } else {
        // Blocking: Render all frames immediately (for fast devices)
        await this.renderFramesBlocking(
          frames,
          totalFrames,
          totalBeats,
          beatDurationMs,
          frameTimeMs,
          offscreenCanvas,
          ctx,
          fullConfig,
          startTime,
          onProgress
        );
      }

      const renderTime = performance.now() - startTime;
      console.log(`✅ Pre-render complete in ${(renderTime / 1000).toFixed(2)}s`);
      console.log(`   Average: ${(renderTime / totalFrames).toFixed(2)}ms per frame`);

      this.currentRender = {
        sequenceId: sequenceData.id,
        frames,
        totalDurationMs,
        totalBeats,
        fps: fullConfig.fps,
        canvasSize: fullConfig.canvasSize,
        isComplete: true,
      };

      return this.currentRender;
    } finally {
      this.isRendering = false;
    }
  }

  /**
   * Render frames in non-blocking chunks
   */
  private async renderFramesNonBlocking(
    frames: PreRenderedFrame[],
    totalFrames: number,
    totalBeats: number,
    beatDurationMs: number,
    frameTimeMs: number,
    offscreenCanvas: OffscreenCanvas,
    ctx: OffscreenCanvasRenderingContext2D,
    config: PreRenderConfig,
    startTime: number,
    onProgress?: (progress: PreRenderProgress) => void
  ): Promise<void> {
    let currentFrame = 0;

    while (currentFrame < totalFrames && !this.shouldCancel) {
      // Render chunk of frames
      const chunkEnd = Math.min(currentFrame + config.framesPerChunk, totalFrames);

      for (let frame = currentFrame; frame < chunkEnd; frame++) {
        await this.renderSingleFrame(
          frame,
          frames,
          totalBeats,
          beatDurationMs,
          frameTimeMs,
          offscreenCanvas,
          ctx,
          config
        );
      }

      currentFrame = chunkEnd;

      // Update progress
      if (onProgress) {
        const elapsed = performance.now() - startTime;
        const avgTimePerFrame = elapsed / currentFrame;
        const remainingFrames = totalFrames - currentFrame;
        const estimatedRemaining = (avgTimePerFrame * remainingFrames) / 1000;

        onProgress({
          currentFrame,
          totalFrames,
          percent: (currentFrame / totalFrames) * 100,
          estimatedSecondsRemaining: estimatedRemaining,
        });
      }

      // Yield to browser (non-blocking)
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    if (this.shouldCancel) {
      throw new Error("Pre-render cancelled");
    }
  }

  /**
   * Render all frames immediately (blocking)
   */
  private async renderFramesBlocking(
    frames: PreRenderedFrame[],
    totalFrames: number,
    totalBeats: number,
    beatDurationMs: number,
    frameTimeMs: number,
    offscreenCanvas: OffscreenCanvas,
    ctx: OffscreenCanvasRenderingContext2D,
    config: PreRenderConfig,
    startTime: number,
    onProgress?: (progress: PreRenderProgress) => void
  ): Promise<void> {
    for (let frame = 0; frame < totalFrames; frame++) {
      if (this.shouldCancel) {
        throw new Error("Pre-render cancelled");
      }

      await this.renderSingleFrame(
        frame,
        frames,
        totalBeats,
        beatDurationMs,
        frameTimeMs,
        offscreenCanvas,
        ctx,
        config
      );

      // Update progress every 10 frames
      if (onProgress && frame % 10 === 0) {
        const elapsed = performance.now() - startTime;
        const avgTimePerFrame = elapsed / (frame + 1);
        const remainingFrames = totalFrames - frame - 1;
        const estimatedRemaining = (avgTimePerFrame * remainingFrames) / 1000;

        onProgress({
          currentFrame: frame + 1,
          totalFrames,
          percent: ((frame + 1) / totalFrames) * 100,
          estimatedSecondsRemaining: estimatedRemaining,
        });
      }
    }
  }

  /**
   * Render a single frame
   */
  private async renderSingleFrame(
    frameNumber: number,
    frames: PreRenderedFrame[],
    totalBeats: number,
    beatDurationMs: number,
    frameTimeMs: number,
    offscreenCanvas: OffscreenCanvas,
    ctx: OffscreenCanvasRenderingContext2D,
    config: PreRenderConfig
  ): Promise<void> {
    const timestamp = frameNumber * frameTimeMs;
    const beat = (timestamp / beatDurationMs) % totalBeats;

    // Calculate animation state for this beat
    this.orchestrator.calculateState(beat);
    const blueProp = this.orchestrator.getBluePropState();
    const redProp = this.orchestrator.getRedPropState();
    const currentLetter = this.orchestrator.getCurrentLetter();

    // Render frame using PixiJS renderer
    this.renderer.renderScene({
      blueProp,
      redProp,
      gridVisible: true,
      gridMode: "diamond", // TODO: Get from config
      letter: currentLetter?.letter || null,
      turnsTuple: null, // TODO: Get from beat data if needed
      bluePropDimensions: { width: 252.8, height: 77.8 }, // TODO: Get from config
      redPropDimensions: { width: 252.8, height: 77.8 }, // TODO: Get from config
      blueTrailPoints: [], // No trails during pre-render (trails come from cache later)
      redTrailPoints: [],
      trailSettings: config.trailSettings,
      currentTime: timestamp,
    });

    // Capture rendered frame as ImageBitmap
    const bitmap = await this.renderer.captureFrame();

    frames.push({
      frameNumber,
      beat,
      timestamp,
      bitmap,
    });
  }

  /**
   * Get frame for specific timestamp
   *
   * @param timestamp - Time in ms from animation start
   * @returns Frame bitmap or null if not available
   */
  getFrameAtTimestamp(timestamp: number): ImageBitmap | null {
    if (!this.currentRender || !this.currentRender.isComplete) {
      return null;
    }

    const frameIndex = Math.floor((timestamp / 1000) * this.currentRender.fps);
    const frame = this.currentRender.frames[frameIndex];

    return frame?.bitmap || null;
  }

  /**
   * Get frame for specific beat number
   *
   * @param beat - Beat number (fractional)
   * @returns Frame bitmap or null if not available
   */
  getFrameAtBeat(beat: number): ImageBitmap | null {
    if (!this.currentRender || !this.currentRender.isComplete) {
      return null;
    }

    const beatDurationMs = this.currentRender.totalDurationMs / this.currentRender.totalBeats;
    const timestamp = beat * beatDurationMs;

    return this.getFrameAtTimestamp(timestamp);
  }

  /**
   * Cancel current pre-render operation
   */
  cancel(): void {
    this.shouldCancel = true;
  }

  /**
   * Check if pre-render is in progress
   */
  isPreRendering(): boolean {
    return this.isRendering;
  }

  /**
   * Check if sequence is ready for playback
   */
  isReady(): boolean {
    return this.currentRender?.isComplete || false;
  }

  /**
   * Get current pre-rendered sequence
   */
  getCurrentSequence(): PreRenderedSequence | null {
    return this.currentRender;
  }

  /**
   * Clear pre-rendered frames (free memory)
   */
  clear(): void {
    if (this.currentRender) {
      // Close all ImageBitmaps to free GPU memory
      for (const frame of this.currentRender.frames) {
        frame.bitmap.close();
      }
      this.currentRender = null;
    }
  }
}
