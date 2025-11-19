/**
 * Canvas Renderer Service Contract
 *
 * Handles rendering of animation visualization on canvas.
 */

import type { PropState } from "../../domain/types/PropState";

export interface ICanvasRenderer {
  /**
   * Render the complete animation scene
   * @param bluePropViewBoxDimensions - ViewBox dimensions from the blue prop SVG (default: staff 252.8 x 77.8)
   * @param redPropViewBoxDimensions - ViewBox dimensions from the red prop SVG (default: staff 252.8 x 77.8)
   */
  renderScene(
    ctx: CanvasRenderingContext2D,
    canvasSize: number,
    gridVisible: boolean,
    gridImage: HTMLImageElement | null,
    blueStaffImage: HTMLImageElement | null,
    redStaffImage: HTMLImageElement | null,
    blueProp: PropState | null,
    redProp: PropState | null,
    bluePropViewBoxDimensions?: { width: number; height: number },
    redPropViewBoxDimensions?: { width: number; height: number }
  ): void;

  /**
   * Render a letter glyph onto the canvas at the standard position
   * @param letterImage - The letter image to render
   * @param letterViewBoxDimensions - ViewBox dimensions from the letter SVG
   */
  renderLetterToCanvas(
    ctx: CanvasRenderingContext2D,
    canvasSize: number,
    letterImage: HTMLImageElement,
    letterViewBoxDimensions: { width: number; height: number }
  ): void;
}
