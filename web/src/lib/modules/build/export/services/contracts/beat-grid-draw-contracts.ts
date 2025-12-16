/**
 * Beat Grid Drawing Service Contracts
 *
 * Service contracts for drawing grid overlays on beat canvases.
 */

import type { CombinedGridOptions, GridMode } from "$shared";

export interface IBeatGridDrawingService {
  /**
   * Apply combined grids to a canvas
   */
  applyCombinedGrids(canvas: HTMLCanvasElement, options: CombinedGridOptions): HTMLCanvasElement;

  /**
   * Draw a single grid type
   */
  drawGrid(canvas: HTMLCanvasElement, gridMode: GridMode, options?: Partial<CombinedGridOptions>): void;

  /**
   * Clear all grids from canvas
   */
  clearGrids(canvas: HTMLCanvasElement): void;
}
