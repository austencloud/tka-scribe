/**
 * Animation Export Orchestrator
 *
 * Coordinates frame capture, encoding, and final delivery for GIF/WebP exports.
 */

import {
  GIF_EXPORT_FPS,
  GIF_EXPORT_QUALITY,
  GIF_FRAMES_PER_BEAT,
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

    const exportFormat: AnimationExportFormat = options.format ?? "gif";
    const filename = this.resolveFilename(
      options.filename,
      panelState.sequenceWord,
      exportFormat
    );

    const exporter = await this.gifExportService.createManualExporter(
      canvas.width,
      canvas.height,
      {
        fps: options.fps ?? GIF_EXPORT_FPS,
        quality: options.quality ?? GIF_EXPORT_QUALITY,
        filename,
        autoDownload: false,
      }
    );

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

      const totalFrames = panelState.totalBeats * GIF_FRAMES_PER_BEAT;

      // Calculate frame delay, respecting the user's current speed setting
      // Lower speed = slower playback = longer delay between frames
      // Higher speed = faster playback = shorter delay between frames
      const baseFrameDelay = Math.floor(1000 / (options.fps ?? GIF_EXPORT_FPS));
      const frameDelay = Math.floor(baseFrameDelay / panelState.speed);

      console.log(`📊 Export settings: ${totalFrames} frames @ ${options.fps ?? GIF_EXPORT_FPS} FPS, speed ${panelState.speed}x, frame delay ${frameDelay}ms`);

      const logicalCanvasSize = this.getLogicalCanvasSize(canvas);

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

        const beat = i / GIF_FRAMES_PER_BEAT;
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

        // Render the glyph on top of the OFFSCREEN canvas (not the visible one!)
        if (currentGlyph?.image) {
          this.canvasRenderer.renderLetterToCanvas(
            offscreenCtx,
            logicalCanvasSize,
            currentGlyph.image,
            currentGlyph.dimensions
          );
        }

        // Capture from the offscreen canvas (not the visible one!)
        exporter.addFrame(offscreenCanvas, frameDelay);

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

      console.log("🔄 Encoding GIF...");
      onProgress({ progress: 0, stage: "encoding" });
      const gifBlob = await exporter.finish();
      console.log(`✅ GIF encoded, size: ${(gifBlob.size / 1024 / 1024).toFixed(2)} MB`);

      if (exportFormat === "gif") {
        console.log(`📥 Downloading GIF: ${filename}`);
        await this.fileDownloadService.downloadBlob(gifBlob, filename);
        console.log("✅ Download triggered");
      } else {
        onProgress({ progress: 0.9, stage: "transcoding" });
        const webpBlob = await this.animatedImageTranscoder.convertGifToWebp(
          gifBlob,
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
    const extension = format === "gif" ? "gif" : "webp";
    return this.fileDownloadService.generateTimestampedFilename(
      baseName,
      extension
    );
  }

  /**
   * Get the letter for a specific beat from the sequence data
   */
  private getLetterForBeat(
    beat: number,
    panelState: AnimationPanelState
  ): Letter | null {
    if (!panelState.sequenceData) {
      return null;
    }

    // Beat 0 is the start position
    if (beat === 0 && panelState.sequenceData.startPosition) {
      const startLetter = panelState.sequenceData.startPosition.letter;
      return startLetter ? (startLetter as Letter) : null;
    }

    // For beats >= 1, get from the beats array
    const beatIndex = Math.floor(beat) - 1; // beats array is 0-indexed, but beatNumber is 1-indexed
    if (
      beatIndex >= 0 &&
      panelState.sequenceData.beats &&
      beatIndex < panelState.sequenceData.beats.length
    ) {
      const beatData = panelState.sequenceData.beats[beatIndex];
      return beatData.letter ? (beatData.letter as Letter) : null;
    }

    return null;
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

  private getLogicalCanvasSize(canvas: HTMLCanvasElement): number {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0) {
      return rect.width;
    }
    return canvas.width;
  }
}
