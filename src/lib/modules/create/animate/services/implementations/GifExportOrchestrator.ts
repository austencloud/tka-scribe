/**
 * GIF Export Orchestrator Service Implementation
 *
 * Coordinates frame-by-frame capture and GIF encoding by managing
 * animation playback state and interfacing with the GIF export service.
 */

import {
    GIF_EXPORT_FPS,
    GIF_EXPORT_QUALITY,
    GIF_FRAMES_PER_BEAT,
    GIF_FRAME_RENDER_DELAY_MS,
    GIF_INITIAL_CAPTURE_DELAY_MS,
} from "$create/animate/constants/timing";
import type { AnimationPanelState } from "$create/animate/state/animation-panel-state.svelte";
import { Letter, TYPES, type ISvgImageService } from "$shared";
import { getLetterImagePath } from "$shared/pictograph/tka-glyph/utils";
import { inject, injectable } from "inversify";
import type { IAnimationPlaybackController } from "../contracts/IAnimationPlaybackController";
import type { ICanvasRenderer } from "../contracts/ICanvasRenderer";
import type {
    GifExportOrchestratorOptions,
    IGifExportOrchestrator,
} from "../contracts/IGifExportOrchestrator";
import type { GifExportProgress, IGifExportService } from "../contracts/IGifExportService";

@injectable()
export class GifExportOrchestrator implements IGifExportOrchestrator {
  private _isExporting = false;
  private shouldCancel = false;

  constructor(
    @inject(TYPES.IGifExportService) private gifExportService: IGifExportService,
    @inject(TYPES.ICanvasRenderer) private canvasRenderer: ICanvasRenderer,
    @inject(TYPES.ISvgImageService) private svgImageService: ISvgImageService
  ) {}

  async executeExport(
    canvas: HTMLCanvasElement,
    playbackController: IAnimationPlaybackController,
    panelState: AnimationPanelState,
    onProgress: (progress: GifExportProgress) => void,
    options: GifExportOrchestratorOptions = {}
  ): Promise<void> {
    if (this._isExporting) {
      throw new Error("Export already in progress");
    }

    this._isExporting = true;
    this.shouldCancel = false;

    try {
      // Initialize progress
      onProgress({ progress: 0, stage: 'capturing' });

      // Create manual exporter with specified options
      const { addFrame, finish } = await this.gifExportService.createManualExporter(
        canvas.width,
        canvas.height,
        {
          fps: options.fps ?? GIF_EXPORT_FPS,
          quality: options.quality ?? GIF_EXPORT_QUALITY,
          filename: options.filename ?? `${panelState.sequenceWord || 'animation'}.gif`,
        }
      );

      // Preserve current animation state
      const wasPlaying = panelState.isPlaying;
      const currentBeat = panelState.currentBeat;

      // Stop animation and reset to beginning
      if (wasPlaying) {
        playbackController.togglePlayback();
      }
      playbackController.jumpToBeat(0);

      // Wait for initial render
      await this.delay(GIF_INITIAL_CAPTURE_DELAY_MS);

      // Load letter image if there's a sequence word
      let letterImage: HTMLImageElement | null = null;
      let letterDimensions = { width: 0, height: 0 };

      if (panelState.sequenceWord) {
        try {
          const letter = panelState.sequenceWord as Letter;
          const imagePath = getLetterImagePath(letter);
          const response = await fetch(imagePath);

          if (response.ok) {
            const svgText = await response.text();
            const viewBoxMatch = svgText.match(/viewBox\s*=\s*"[\d.-]+\s+[\d.-]+\s+([\d.-]+)\s+([\d.-]+)"/i);
            letterDimensions.width = viewBoxMatch ? parseFloat(viewBoxMatch[1]!) : 100;
            letterDimensions.height = viewBoxMatch ? parseFloat(viewBoxMatch[2]!) : 100;
            letterImage = await this.svgImageService.convertSvgStringToImage(svgText, letterDimensions.width, letterDimensions.height);
          }
        } catch (err) {
          console.warn('Failed to load letter image for GIF export:', err);
        }
      }

      // Calculate frame capture parameters
      const totalBeats = panelState.totalBeats;
      const totalFrames = totalBeats * GIF_FRAMES_PER_BEAT;
      const frameDelay = Math.floor(1000 / (options.fps ?? GIF_EXPORT_FPS));
      const ctx = canvas.getContext('2d');

      // Capture frames through one full loop
      for (let i = 0; i < totalFrames; i++) {
        // Check for cancellation
        if (this.shouldCancel) {
          throw new Error('Export cancelled');
        }

        // Calculate beat position
        const beat = i / GIF_FRAMES_PER_BEAT;
        playbackController.jumpToBeat(beat);

        // Wait for frame to render
        await this.delay(GIF_FRAME_RENDER_DELAY_MS);

        // Render letter onto canvas if we have one
        if (letterImage && ctx && letterDimensions.width > 0) {
          this.canvasRenderer.renderLetterToCanvas(ctx, canvas.width, letterImage, letterDimensions);
        }

        // Capture the frame
        addFrame(canvas, frameDelay);

        // Update progress
        onProgress({
          progress: i / totalFrames,
          stage: 'capturing',
          currentFrame: i,
          totalFrames,
        });
      }

      // Check for cancellation before encoding
      if (this.shouldCancel) {
        throw new Error('Export cancelled');
      }

      // Start encoding
      onProgress({ progress: 0, stage: 'encoding' });
      await finish();

      // Export complete
      onProgress({ progress: 1, stage: 'complete' });

      // Restore original animation state
      playbackController.jumpToBeat(currentBeat);
      if (wasPlaying) {
        playbackController.togglePlayback();
      }

    } catch (error) {
      // Handle errors
      if (!this.shouldCancel) {
        onProgress({
          progress: 0,
          stage: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      throw error;
    } finally {
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

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
