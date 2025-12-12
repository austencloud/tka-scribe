import { injectable } from "inversify";
import type { Dimensions } from "$lib/shared/background/shared/domain/types/background-types";
import type { LightRay } from "../../domain/models/DeepOceanModels";
import type { ILightRayRenderer } from "../contracts/ILightRayRenderer";

@injectable()
export class LightRayRenderer implements ILightRayRenderer {
  drawLightRays(
    ctx: CanvasRenderingContext2D,
    dimensions: Dimensions,
    lightRays: LightRay[],
    quality: string
  ): void {
    if (quality === "minimal") return;

    ctx.save();
    for (const ray of lightRays) {
      ctx.save();
      ctx.translate(ray.x, 0);
      ctx.rotate((ray.angle * Math.PI) / 180);

      const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height * 0.6);
      gradient.addColorStop(0, `rgba(135, 206, 250, ${ray.opacity})`);
      gradient.addColorStop(0.4, `rgba(100, 149, 237, ${ray.opacity * 0.7})`);
      gradient.addColorStop(1, `rgba(70, 130, 180, 0)`);

      ctx.fillStyle = gradient;
      ctx.fillRect(-ray.width / 2, 0, ray.width, dimensions.height * 0.6);
      ctx.restore();
    }
    ctx.restore();
  }
}
