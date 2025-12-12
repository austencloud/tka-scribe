import { injectable } from "inversify";
import type { FishMarineLife } from "../../domain/models/DeepOceanModels";
import type { IFishRenderer } from "../contracts/IFishRenderer";

@injectable()
export class FishRenderer implements IFishRenderer {
  drawFish(ctx: CanvasRenderingContext2D, fish: FishMarineLife[]): void {
    // Sort by depth layer for proper z-ordering (far first, near last)
    const sorted = [...fish].sort((a, b) => {
      const order = { far: 0, mid: 1, near: 2 };
      return order[a.depthLayer] - order[b.depthLayer];
    });

    ctx.save();
    for (const f of sorted) {
      this.drawSingleFish(ctx, f);
    }
    ctx.restore();
  }

  private drawSingleFish(ctx: CanvasRenderingContext2D, fish: FishMarineLife): void {
    ctx.save();
    ctx.globalAlpha = fish.opacity;
    ctx.translate(fish.x, fish.y);

    // Apply rotation for natural movement feel
    ctx.rotate(fish.rotation);

    // Scale and flip for direction
    ctx.scale(fish.direction, 1);

    // Use pre-rendered canvas (color variant baked in, no runtime filter)
    const canvas = fish.canvas;

    if (canvas) {
      // No filter needed - color variant is pre-rendered
      // Note: Tail wiggle removed - was causing clipping on long fish (eel)
      // The tailPhase is still used for fallback fish drawing
      ctx.drawImage(
        canvas as CanvasImageSource,
        -fish.width / 2,
        -fish.height / 2,
        fish.width,
        fish.height
      );
    } else {
      this.drawFallbackFish(ctx, fish);
    }

    ctx.restore();
  }

  private drawFallbackFish(ctx: CanvasRenderingContext2D, fish: FishMarineLife): void {
    const w = fish.width;
    const h = fish.height * 0.6;

    // Depth-based color (far fish are more blue/faded)
    const colors = {
      far: "#6ba3b5",
      mid: "#7dd3fc",
      near: "#93e0fd",
    };

    ctx.fillStyle = colors[fish.depthLayer];

    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail with wiggle
    const tailOffset = Math.sin(fish.tailPhase) * h * 0.15;
    ctx.beginPath();
    ctx.moveTo(w * 0.4, 0);
    ctx.lineTo(w * 0.65, -h * 0.3 + tailOffset);
    ctx.lineTo(w * 0.65, h * 0.3 + tailOffset);
    ctx.closePath();
    ctx.fill();
  }
}
