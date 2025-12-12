import type { Bubble } from "../../domain/models/DeepOceanModels";

/**
 * Contract for bubble rendering
 */
export interface IBubbleRenderer {
  /**
   * Draw all bubbles with highlights
   */
  drawBubbles(ctx: CanvasRenderingContext2D, bubbles: Bubble[]): void;
}
