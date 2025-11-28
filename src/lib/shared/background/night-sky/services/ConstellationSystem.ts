// src/lib/components/backgrounds/systems/nightSky/ConstellationSystem.ts
import type { AccessibilitySettings } from "$shared/background/shared/domain/models/background-models";
import type { QualityLevel } from "$shared/background/shared/domain/types/background-types";
import type { Star } from "../domain/models/night-sky-models";
// Removed resolve import - calculation service now injected via constructor
import type { INightSkyCalculationService } from "../services";

export interface ConstellationConfig {
  maxLines: number;
  opacity: number;
  twinkleSpeed: number;
  enabledOnQuality: QualityLevel[];
}

interface ConstellationLine {
  a: Star;
  b: Star;
  opacity: number;
  dir: number;
}

export class ConstellationSystem {
  private constellationLines: ConstellationLine[] = [];
  private config: ConstellationConfig;
  private calculationService: INightSkyCalculationService;

  constructor(
    config: ConstellationConfig,
    calculationService: INightSkyCalculationService
  ) {
    this.config = config;
    this.calculationService = calculationService;
  }

  update(
    nearStars: Star[],
    quality: QualityLevel,
    a11y: AccessibilitySettings,
    frameMultiplier: number = 1.0
  ) {
    if (!this.config.enabledOnQuality.includes(quality)) {
      this.constellationLines = [];
      return;
    }

    if (!nearStars || nearStars.length === 0) return;

    // Initialize constellation lines if they don't exist yet
    if (this.constellationLines.length === 0 && nearStars.length > 1) {
      const numLines = Math.min(
        this.config.maxLines,
        Math.floor(nearStars.length / 2)
      );

      for (let i = 0; i < numLines; i++) {
        const aIndex = this.calculationService.randInt(0, nearStars.length - 1);
        let bIndex = this.calculationService.randInt(0, nearStars.length - 1);
        while (bIndex === aIndex) {
          // Ensure different stars
          bIndex = this.calculationService.randInt(0, nearStars.length - 1);
        }
        const starA = nearStars[aIndex];
        const starB = nearStars[bIndex];
        if (starA && starB) {
          this.constellationLines.push({
            a: starA,
            b: starB,
            opacity: Math.random() * this.config.opacity,
            dir: Math.random() > 0.5 ? 1 : -1,
          });
        }
      }
    }

    // Update twinkling with frame multiplier for consistent speed
    const effectiveSpeed = frameMultiplier * (a11y.reducedMotion ? 0.3 : 1);
    this.constellationLines.forEach((l) => {
      l.opacity += l.dir * this.config.twinkleSpeed * effectiveSpeed;
      if (l.opacity > this.config.opacity || l.opacity < 0) {
        l.dir *= -1;
        l.opacity = Math.max(0, Math.min(this.config.opacity, l.opacity));
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D, a11y: AccessibilitySettings) {
    if (!this.constellationLines.length) return;

    ctx.lineWidth = 0.7;
    const baseColor = a11y.highContrast ? "#FFFFFF" : "#89A7FF";
    this.constellationLines.forEach((l) => {
      if (!l.a || !l.b) return; // Guard against undefined stars if layers were reset
      ctx.globalAlpha = l.opacity * (a11y.reducedMotion ? 0.5 : 1);
      ctx.strokeStyle = baseColor;
      ctx.beginPath();
      ctx.moveTo(l.a.x, l.a.y);
      ctx.lineTo(l.b.x, l.b.y);
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  cleanup() {
    this.constellationLines = [];
  }
}
