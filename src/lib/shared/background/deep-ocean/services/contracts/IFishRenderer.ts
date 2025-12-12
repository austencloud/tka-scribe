import type { FishMarineLife } from "../../domain/models/DeepOceanModels";

/**
 * Contract for fish rendering
 */
export interface IFishRenderer {
  /**
   * Draw all fish with depth-based rendering
   */
  drawFish(ctx: CanvasRenderingContext2D, fish: FishMarineLife[]): void;
}
