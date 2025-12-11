/**
 * Animation Export Orchestrator
 *
 * Coordinates frame capture, encoding, and final delivery for GIF/WebP exports.
 */

import {
  GIF_EXPORT_FPS,
  GIF_EXPORT_QUALITY,
  GIF_INITIAL_CAPTURE_DELAY_MS,
} from "../../shared/domain/constants/timing";
import type { AnimationPanelState } from "../../state/animation-panel-state.svelte";
import type { Letter } from "$lib/shared/foundation/domain/models/Letter";
import type { ISvgImageService } from "$lib/shared/foundation/services/contracts/ISvgImageService";
import { TYPES } from "$lib/shared/inversify/types";
import type { IFileDownloadService } from "$lib/shared/foundation/services/contracts/IFileDownloadService";
import { getLetterImagePath } from "$lib/shared/pictograph/tka-glyph/utils/letter-image-getter";
import { inject, injectable } from "inversify";
import type { IAnimationPlaybackController } from "../contracts/IAnimationPlaybackController";
import type { ICanvasRenderer } from "../contracts/ICanvasRenderer";
import type {
  AnimationExportFormat,
  GifExportOrchestratorOptions,
  IGifExportOrchestrator,
} from "../contracts/IGifExportOrchestrator";
import type { IAnimatedImageTranscoder } from "../contracts/IAnimatedImageTranscoder";
import type { IGifExportService } from "../contracts/IGifExportService";
import type { GifExportProgress } from "../contracts/IGifExportService";
import type { IVideoExportService } from "../contracts/IVideoExportService";
import type { ISequenceAnimationOrchestrator } from "../contracts/ISequenceAnimationOrchestrator";
import { SequenceAnimationOrchestrator } from "./SequenceAnimationOrchestrator";

interface LetterOverlayAssets {
  image: HTMLImageElement | null;
  dimensions: { width: number; height: number };
}

@injectable()
export class GifExportOrchestrator implements IGifExportOrchestrator {
  private _isExporting = false;
  private shouldCancel = false;

  // Cache for loaded letter glyphs to avoid re-fetching the same letter multiple times
  private letterGlyphCache = new Map<Letter, LetterOverlayAssets>();

  constructor(
    @inject(TYPES.IGifExportService)
    private readonly gifExportService: IGifExportService,
    @inject(TYPES.IVideoExportService)
    private readonly videoExportService: IVideoExportService,
    @inject(TYPES.ICanvasRenderer)
    private readonly canvasRenderer: ICanvasRenderer,
    @inject(TYPES.ISvgImageService)
    private readonly svgImageService: ISvgImageService,
    @inject(TYPES.IFileDownloadService)
    private readonly fileDownloadService: IFileDownloadService,
    @inject(TYPES.IAnimatedImageTranscoder)
    private readonly animatedImageTranscoder: IAnimatedImageTranscoder,
    @inject(TYPES.IAnimationStateService)
    private readonly animationStateService: any,
    @inject(TYPES.IBeatCalculationService)
    private readonly beatCalculationService: any,
    @inject(TYPES.IPropInterpolationService)
    private readonly propInterpolationService: any
  ) {}

  async executeExport(
    canvas: HTMLCanvasElement,
    playbackController: IAnimationPlaybackController,
    panelState: AnimationPanelState,
    onProgress: (progress: GifExportProgress) => void,
    options: GifExportOrchestratorOptions = {}
  ): Promise<void> {
    console.log("🎬 GifExportOrchestrator.executeExport called");
    console.log("  Canvas:", canvas);
    console.log("  Playback controller:", playbackController);
    console.log("  Panel state:", panelState);
    console.log("  Sequence data:", panelState.sequenceData);

    if (this._isExporting) {
      throw new Error("Export already in progress");
    }

    this._isExporting = true;
    this.shouldCancel = false;

    // Clear glyph cache for fresh export
    this.letterGlyphCache.clear();

    // Default to GIF - WebP transcoding causes quality loss and timing issues
    const exportFormat: AnimationExportFormat = options.format ?? "gif";
    const isVideoFormat = exportFormat === "webm" || exportFormat === "mp4";
    const filename = this.resolveFilename(
      options.filename,
      panelState.sequenceWord,
      exportFormat
    );

    // Create the appropriate exporter based on format
    const exporter = isVideoFormat
      ? await this.videoExportService.createManualExporter(canvas.width, canvas.height, {
          format: exportFormat as "webm" | "mp4",
          fps: options.fps ?? GIF_EXPORT_FPS,
          filename,
          autoDownload: false,
        })
      : await this.gifExportService.createManualExporter(canvas.width, canvas.height, {
          fps: options.fps ?? GIF_EXPORT_FPS,
          quality: options.quality ?? GIF_EXPORT_QUALITY,
          filename,
          autoDownload: false,
        });

    const captureState = {
      wasPlaying: panelState.isPlaying,
      beat: panelState.currentBeat,
    };

    try {
      onProgress({ progress: 0, stage: "capturing" });

      if (captureState.wasPlaying) {
        playbackController.togglePlayback();
      }
      playbackController.jumpToBeat(0);
      await this.delay(GIF_INITIAL_CAPTURE_DELAY_MS);

      // Calculate effective duration at user's BPM/speed
      // At speed=1.0 (60 BPM): 1 second per beat
      // At speed=2.0 (120 BPM): 0.5 seconds per beat
      const secondsPerBeat = 1.0 / panelState.speed;
      const singleLoopDurationSeconds = panelState.totalBeats * secondsPerBeat;

      // Use fixed high frame rate for smooth playback at any BPM
      // This ensures visual quality is consistent regardless of tempo
      const fps = options.fps ?? GIF_EXPORT_FPS;
      const frameDelay = Math.floor(1000 / fps); // Fixed ~20ms at 50fps
      const framesPerLoop = Math.ceil(singleLoopDurationSeconds * fps);

      // Apply loop count for circular sequences
      const loopCount = panelState.exportLoopCount ?? 1;
      const totalFrames = framesPerLoop * loopCount;

      // Calculate beat progression per frame to match timing
      // beatsPerFrame = totalBeats / framesPerLoop (for single loop)
      const beatsPerFrame = panelState.totalBeats / framesPerLoop;

      console.log(`📊 Export settings: ${totalFrames} frames @ ${fps} FPS, ${loopCount} loop(s), ${panelState.speed}x speed (${Math.round(panelState.speed * 60)} BPM), ${secondsPerBeat.toFixed(2)}s per beat, frame delay ${frameDelay}ms`);

      // CRITICAL: Use actual canvas pixel size, not CSS display size
      // The canvas.width is the actual pixel dimension used for rendering
      // getBoundingClientRect().width would give the CSS display size which is different
      const actualCanvasSize = canvas.width;

      // Create offscreen canvas for compositing (so we don't touch the visible canvas)
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      const offscreenCtx = offscreenCanvas.getContext("2d", {
        willReadFrequently: false,
      });

      if (!offscreenCtx) {
        throw new Error("Failed to create offscreen canvas context");
      }

      // Track the current letter to avoid reloading the same glyph for consecutive frames
      let currentLetter: Letter | null = null;
      let currentGlyph: LetterOverlayAssets | null = null;

      for (let i = 0; i < totalFrames; i++) {
        if (this.shouldCancel) {
          throw new Error("Export cancelled");
        }

        // Calculate beat position for this frame
        // Uses modulo to loop through the sequence for multiple loops
        const frameInLoop = i % framesPerLoop;
        const beat = frameInLoop * beatsPerFrame;
        playbackController.jumpToBeat(beat);

        // Wait for the UI + canvas to render the new beat
        await this.waitForAnimationFrame();
        await this.waitForAnimationFrame();

        // Copy the live canvas to the offscreen canvas (preserves visible animation)
        offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        offscreenCtx.drawImage(canvas, 0, 0);

        // Get the letter for the current beat
        const beatLetter = this.getLetterForBeat(beat, panelState);

        // Load the glyph if the letter changed
        if (beatLetter !== currentLetter) {
          currentLetter = beatLetter;
          currentGlyph = beatLetter
            ? await this.loadLetterGlyph(beatLetter)
            : null;
        }

        // Calculate beat number for display (matches AnimatorCanvas logic)
        const beatNumber = this.getBeatNumberForFrame(beat, panelState);

        // Render the glyph on top of the OFFSCREEN canvas (not the visible one!)
        if (currentGlyph?.image) {
          this.canvasRenderer.renderLetterToCanvas(
            offscreenCtx,
            actualCanvasSize,
            currentGlyph.image,
            currentGlyph.dimensions
          );
        }

        // Render the beat number overlay
        this.canvasRenderer.renderBeatNumberToCanvas(
          offscreenCtx,
          actualCanvasSize,
          beatNumber
        );

        // Capture from the offscreen canvas (not the visible one!)
        // Video: WebCodecs sets explicit timestamps per frame - no delays needed
        // GIF: gif.js uses frame delay metadata
        if (isVideoFormat) {
          await exporter.addFrame(offscreenCanvas);
        } else {
          (exporter as { addFrame: (canvas: HTMLCanvasElement, delay: number) => void }).addFrame(offscreenCanvas, frameDelay);
        }

        onProgress({
          progress: (i + 1) / totalFrames,
          stage: "capturing",
          currentFrame: i + 1,
          totalFrames,
        });
      }

      console.log(`✅ Captured ${totalFrames} frames`);

      if (this.shouldCancel) {
        throw new Error("Export cancelled");
      }

      console.log(`🔄 Encoding ${isVideoFormat ? 'video' : 'GIF'}...`);
      onProgress({ progress: 0, stage: "encoding" });
      const outputBlob = await exporter.finish();
      console.log(`✅ ${exportFormat.toUpperCase()} encoded, size: ${(outputBlob.size / 1024 / 1024).toFixed(2)} MB`);

      if (isVideoFormat || exportFormat === "gif") {
        console.log(`📥 Downloading ${exportFormat.toUpperCase()}: ${filename}`);
        await this.fileDownloadService.downloadBlob(outputBlob, filename);
        console.log("✅ Download triggered");
      } else if (exportFormat === "webp") {
        onProgress({ progress: 0.9, stage: "transcoding" });
        const webpBlob = await this.animatedImageTranscoder.convertGifToWebp(
          outputBlob,
          options.webp
        );
        await this.fileDownloadService.downloadBlob(webpBlob, filename);
      }

      console.log("✅ Export complete!");
      onProgress({ progress: 1, stage: "complete" });
    } catch (error) {
      console.error("❌ Export failed:", error);
      if (!this.shouldCancel) {
        onProgress({
          progress: 0,
          stage: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
      throw error;
    } finally {
      this.restorePlaybackState(playbackController, captureState);
      this._isExporting = false;
      this.shouldCancel = false;
    }
  }

  cancelExport(): void {
    this.shouldCancel = true;
    this.gifExportService.cancelExport();
    this._isExporting = false;
  }

  isExporting(): boolean {
    return this._isExporting;
  }

  private restorePlaybackState(
    playbackController: IAnimationPlaybackController,
    snapshot: { wasPlaying: boolean; beat: number }
  ): void {
    playbackController.jumpToBeat(snapshot.beat);
    if (snapshot.wasPlaying) {
      playbackController.togglePlayback();
    }
  }

  private resolveFilename(
    explicitFilename: string | undefined,
    sequenceWord: string | null,
    format: AnimationExportFormat
  ): string {
    if (explicitFilename) {
      return explicitFilename;
    }

    const baseName = sequenceWord || "animation";
    // Map format to file extension
    const extensionMap: Record<AnimationExportFormat, string> = {
      gif: "gif",
      webp: "webp",
      webm: "webm",
      mp4: "mp4",
    };
    const extension = extensionMap[format] || "gif";
    return this.fileDownloadService.generateTimestampedFilename(
      baseName,
      extension
    );
  }

  /**
   * Get the letter for a specific beat from the sequence data
   * Matches the logic in AnimationSheetCoordinator.svelte's currentLetter derived
   */
  private getLetterForBeat(
    beat: number,
    panelState: AnimationPanelState
  ): Letter | null {
    if (!panelState.sequenceData) {
      return null;
    }

    // During animation: show beat letters using floor(beat) as index
    // This matches the live canvas behavior where:
    // - beat 0.0-0.99 shows beats[0] (first beat)
    // - beat 1.0-1.99 shows beats[1] (second beat)
    // - etc.
    if (
      panelState.sequenceData.beats &&
      panelState.sequenceData.beats.length > 0
    ) {
      const beatIndex = Math.floor(beat);
      const clampedIndex = Math.max(
        0,
        Math.min(beatIndex, panelState.sequenceData.beats.length - 1)
      );
      const beatData = panelState.sequenceData.beats[clampedIndex];
      return beatData?.letter ? (beatData.letter as Letter) : null;
    }

    return null;
  }

  /**
   * Get the beat number for a specific frame
   * Matches the logic in AnimatorCanvas.svelte's beatNumber derived
   * Beat numbers are 1-indexed (beats[0] = beat 1, beats[1] = beat 2, etc.)
   */
  private getBeatNumberForFrame(
    beat: number,
    panelState: AnimationPanelState
  ): number | null {
    if (!panelState.sequenceData?.beats) {
      return null;
    }

    // Calculate which beat index we're showing
    const beatIndex = Math.floor(beat);
    const clampedIndex = Math.max(
      0,
      Math.min(beatIndex, panelState.sequenceData.beats.length - 1)
    );

    // Beat numbers are 1-indexed
    return clampedIndex + 1;
  }

  /**
   * Load a letter glyph with caching
   */
  private async loadLetterGlyph(letter: Letter): Promise<LetterOverlayAssets> {
    // Check cache first
    if (this.letterGlyphCache.has(letter)) {
      return this.letterGlyphCache.get(letter)!;
    }

    try {
      const imagePath = getLetterImagePath(letter);
      const response = await fetch(imagePath);

      if (!response.ok) {
        const result = { image: null, dimensions: { width: 0, height: 0 } };
        this.letterGlyphCache.set(letter, result);
        return result;
      }

      const svgText = await response.text();
      const viewBoxMatch = svgText.match(
        /viewBox\s*=\s*"[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)"/i
      );
      const width = viewBoxMatch?.[1] ? parseFloat(viewBoxMatch[1]) : 100;
      const height = viewBoxMatch?.[2] ? parseFloat(viewBoxMatch[2]) : 100;
      const image = await this.svgImageService.convertSvgStringToImage(
        svgText,
        width,
        height
      );

      const result = { image, dimensions: { width, height } };
      this.letterGlyphCache.set(letter, result);
      return result;
    } catch (error) {
      console.warn(`Failed to load letter glyph for ${letter}:`, error);
      const result = { image: null, dimensions: { width: 0, height: 0 } };
      this.letterGlyphCache.set(letter, result);
      return result;
    }
  }

  private waitForAnimationFrame(): Promise<void> {
    if (typeof window === "undefined") {
      return Promise.resolve();
    }

    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
