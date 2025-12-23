import { injectable } from "inversify";
import type { JellyfishMarineLife } from "../../domain/models/DeepOceanModels";
import type { IJellyfishRenderer } from "../contracts/IJellyfishRenderer";

@injectable()
export class JellyfishRenderer implements IJellyfishRenderer {
  drawJellyfish(
    ctx: CanvasRenderingContext2D,
    jellyfish: JellyfishMarineLife[]
  ): void {
    ctx.save();
    for (const jelly of jellyfish) {
      this.drawSingleJellyfish(ctx, jelly);
    }
    ctx.restore();
  }

  private drawSingleJellyfish(
    ctx: CanvasRenderingContext2D,
    jelly: JellyfishMarineLife
  ): void {
    ctx.save();
    ctx.globalAlpha = jelly.opacity;
    ctx.translate(jelly.x, jelly.y);

    const radius = jelly.size * 0.55;
    const pulse = 1 + Math.sin(jelly.animationPhase * 0.9) * 0.05;
    const bellRadius = radius * pulse;

    // Bell gradient
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bellRadius);
    gradient.addColorStop(0, this.lightenColor(jelly.color, 0.4));
    gradient.addColorStop(0.65, jelly.color);
    gradient.addColorStop(1, this.darkenColor(jelly.color, 0.25));

    // Glow effect
    ctx.shadowColor = this.lightenColor(jelly.color, 0.5);
    ctx.shadowBlur = jelly.glowIntensity * 35;

    // Draw bell
    ctx.beginPath();
    ctx.fillStyle = gradient;
    ctx.arc(0, 0, bellRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw tentacles
    this.drawTentacles(ctx, jelly, bellRadius);

    ctx.restore();
  }

  private drawTentacles(
    ctx: CanvasRenderingContext2D,
    jelly: JellyfishMarineLife,
    bellRadius: number
  ): void {
    const tentacleOriginY = bellRadius * 0.4;
    ctx.lineWidth = Math.max(1.4, jelly.size * 0.08);
    ctx.lineCap = "round";
    ctx.strokeStyle = this.lightenColor(jelly.color, 0.2);

    jelly.tentacleSeeds.forEach((seed, index) => {
      const offset =
        jelly.tentacleSeeds.length === 1
          ? 0
          : index / (jelly.tentacleSeeds.length - 1) - 0.5;
      const sway =
        Math.sin(jelly.animationPhase + seed) * jelly.waveAmplitude * 0.6;
      const startX = offset * bellRadius * 0.9;
      const length =
        jelly.size * (1.2 + Math.sin(jelly.animationPhase + seed) * 0.15);

      ctx.beginPath();
      ctx.moveTo(startX, tentacleOriginY);
      ctx.bezierCurveTo(
        startX + sway * 0.4,
        tentacleOriginY + length * 0.35,
        startX - sway * 0.25,
        tentacleOriginY + length * 0.7,
        startX + sway,
        tentacleOriginY + length
      );
      ctx.stroke();
    });
  }

  private lightenColor(color: string, amount: number): string {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const nr = Math.min(255, Math.round(r + (255 - r) * amount));
    const ng = Math.min(255, Math.round(g + (255 - g) * amount));
    const nb = Math.min(255, Math.round(b + (255 - b) * amount));

    return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
  }

  private darkenColor(color: string, amount: number): string {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    const nr = Math.max(0, Math.round(r * (1 - amount)));
    const ng = Math.max(0, Math.round(g * (1 - amount)));
    const nb = Math.max(0, Math.round(b * (1 - amount)));

    return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
  }
}
