import type { JellyfishMarineLife } from "../../domain/models/DeepOceanModels";

/**
 * Contract for jellyfish rendering
 */
export interface IJellyfishRenderer {
  /**
   * Draw all jellyfish with glow effects
   */
  drawJellyfish(ctx: CanvasRenderingContext2D, jellyfish: JellyfishMarineLife[]): void;
}
