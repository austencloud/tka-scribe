import { injectable } from "inversify";
import type { Bubble } from "../../domain/models/DeepOceanModels";
import type { IBubbleRenderer } from "../contracts/IBubbleRenderer";

@injectable()
export class BubbleRenderer implements IBubbleRenderer {
  drawBubbles(ctx: CanvasRenderingContext2D, bubbles: Bubble[]): void {
    ctx.save();
    for (const bubble of bubbles) {
      ctx.globalAlpha = bubble.opacity;

      // Main bubble
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(173, 216, 230, 0.6)";
      ctx.fill();

      // Highlight
      ctx.beginPath();
      ctx.arc(
        bubble.x - bubble.radius * 0.3,
        bubble.y - bubble.radius * 0.3,
        bubble.radius * 0.3,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.fill();
    }
    ctx.restore();
  }
}
