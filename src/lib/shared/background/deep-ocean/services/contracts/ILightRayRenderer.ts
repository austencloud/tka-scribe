import type { Dimensions } from "$lib/shared/background/shared/domain/types/background-types";
import type { LightRay } from "../../domain/models/DeepOceanModels";

/**
 * Contract for light ray rendering
 */
export interface ILightRayRenderer {
  /**
   * Draw light rays from surface
   */
  drawLightRays(
    ctx: CanvasRenderingContext2D,
    dimensions: Dimensions,
    lightRays: LightRay[],
    quality: string
  ): void;
}
