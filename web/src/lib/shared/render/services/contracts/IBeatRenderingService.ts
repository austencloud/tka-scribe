import type { BeatData, SequenceData } from "$shared";
import type { BeatRenderOptions } from "../../domain";

/**
 * Beat rendering service for individual beat conversion
 * Equivalent to desktop BeatDrawer and ImageExportBeatFactory
 */
export interface IBeatRenderingService {
  /**
   * Render a single beat to canvas
   */
  renderBeatToCanvas(
    beatData: BeatData,
    size: number,
    options: BeatRenderOptions
  ): Promise<HTMLCanvasElement>;

  /**
   * Render start position to canvas
   */
  renderStartPositionToCanvas(
    sequence: SequenceData,
    size: number,
    options: BeatRenderOptions
  ): Promise<HTMLCanvasElement>;

  /**
   * Batch render multiple beats
   */
  renderBeatsToCanvases(
    beats: BeatData[],
    size: number,
    options: BeatRenderOptions
  ): Promise<HTMLCanvasElement[]>;

  /**
   * Apply visibility settings to rendered beat
   */
  applyVisibilitySettings(
    canvas: HTMLCanvasElement,
    options: BeatRenderOptions
  ): HTMLCanvasElement;
}
