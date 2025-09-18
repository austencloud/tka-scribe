import type { ImageRenderOptions, SequenceData } from "../../../../shared";
import type { CompositionOptions, LayoutData } from "../../domain";

/**
 * Image composition service for assembling final images
 * Equivalent to desktop ImageCreator
 */
export interface IImageCompositionService {
  /**
   * Compose complete sequence image from rendered beats
   */
  composeSequenceImage(
    sequence: SequenceData,
    options: ImageRenderOptions 
  ): Promise<HTMLCanvasElement>;

  /**
   * Compose image from pre-rendered canvases
   */
  composeFromCanvases(
    beatCanvases: HTMLCanvasElement[],
    startPositionCanvas: HTMLCanvasElement | null,
    layoutData: LayoutData,
    options: CompositionOptions
  ): Promise<HTMLCanvasElement>;

  /**
   * Apply background and borders
   */
  applyBackground(
    canvas: HTMLCanvasElement,
    backgroundColor?: string
  ): HTMLCanvasElement;

  /**
   * Optimize canvas for export
   */
  optimizeForExport(canvas: HTMLCanvasElement): HTMLCanvasElement;
}
