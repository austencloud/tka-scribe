import type { SequenceData } from "../../../foundation/domain/models/SequenceData";
import type {
  CompositionOptions,
  LayoutData,
} from "../../domain/models/SequenceExportOptions";
import type { ImageRenderOptions } from "./IDimensionCalculationService";

/**
 * Progress callback for tracking image composition
 */
export type CompositionProgressCallback = (progress: {
  current: number;
  total: number;
  stage: "preparing" | "rendering" | "finalizing";
}) => void;

/**
 * Image composition service for assembling final images
 * Equivalent to desktop ImageCreator
 */
export interface IImageCompositionService {
  /**
   * Compose complete sequence image from rendered beats
   * @param onProgress Optional callback for progress tracking
   */
  composeSequenceImage(
    sequence: SequenceData,
    options: ImageRenderOptions,
    onProgress?: CompositionProgressCallback
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

  /**
   * Get cache statistics for debugging/monitoring
   */
  getCacheStats(): {
    cacheSize: number;
    cacheHits: number;
    cacheMisses: number;
    hitRate: string;
  };

  /**
   * Clear the rendered image cache
   */
  clearCache(): void;
}
