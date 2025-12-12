import { injectable } from "inversify";
import type { Dimensions } from "$lib/shared/background/shared/domain/types/background-types";
import type { IGradientRenderer } from "../contracts/IGradientRenderer";

@injectable()
export class GradientRenderer implements IGradientRenderer {
  drawOceanGradient(ctx: CanvasRenderingContext2D, dimensions: Dimensions): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
    gradient.addColorStop(0, "#0d2d47");    // Rich ocean blue
    gradient.addColorStop(0.3, "#1a3a4a");  // Mid-depth
    gradient.addColorStop(0.7, "#0f2535");  // Deeper
    gradient.addColorStop(1, "#091a2b");    // Darkest ocean depth

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
  }
}
