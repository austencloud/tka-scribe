import { inject, injectable } from "inversify";
import type { Dimensions } from "$lib/shared/background/shared/domain/types/background-types";
import { TYPES } from "../../../../inversify/types";
import type { JellyfishMarineLife } from "../../domain/models/DeepOceanModels";
import type { IFishSpriteManager } from "../contracts/IFishSpriteManager";
import type { IJellyfishAnimator } from "../contracts/IJellyfishAnimator";
import { JELLYFISH_COUNTS } from "../../domain/constants/fish-constants";

/** Jellyfish-specific constants */
const JELLYFISH_CONFIG = {
  size: { min: 18, max: 33 },
  horizontalSpeed: 8, // Max ± pixels/second
  verticalSpeed: { min: -12, max: -6 }, // Always upward
  waveAmplitude: { min: 4, max: 8 },
  waveFrequency: { min: 0.008, max: 0.02 },
  glowIntensity: { min: 0.15, max: 0.3 },
  opacity: { min: 0.45, max: 0.8 },
  tentacles: { min: 5, max: 8 },
  spawnMargin: 60, // Pixels from edge
  verticalBand: { min: 0.25, max: 0.7 }, // Fraction of screen height
};

@injectable()
export class JellyfishAnimator implements IJellyfishAnimator {
  constructor(
    @inject(TYPES.IFishSpriteManager)
    private fishSpriteManager: IFishSpriteManager
  ) {}

  initializeJellyfish(dimensions: Dimensions, count: number): JellyfishMarineLife[] {
    const jellyfish: JellyfishMarineLife[] = [];
    for (let i = 0; i < count; i++) {
      jellyfish.push(this.createJellyfish(dimensions));
    }
    return jellyfish;
  }

  createJellyfish(dimensions: Dimensions): JellyfishMarineLife {
    const size = this.randomInRange(JELLYFISH_CONFIG.size.min, JELLYFISH_CONFIG.size.max);
    const baseY =
      dimensions.height * JELLYFISH_CONFIG.verticalBand.min +
      Math.random() * dimensions.height * (JELLYFISH_CONFIG.verticalBand.max - JELLYFISH_CONFIG.verticalBand.min);

    const tentacleCount = JELLYFISH_CONFIG.tentacles.min +
      Math.floor(Math.random() * (JELLYFISH_CONFIG.tentacles.max - JELLYFISH_CONFIG.tentacles.min + 1));
    const tentacleSeeds = Array.from({ length: tentacleCount }, () => Math.random() * Math.PI * 2);

    return {
      type: "jellyfish",
      size,
      color: this.fishSpriteManager.getMarineLifeColor("jellyfish"),
      horizontalSpeed: (Math.random() - 0.5) * JELLYFISH_CONFIG.horizontalSpeed * 2,
      verticalSpeed: this.randomInRange(JELLYFISH_CONFIG.verticalSpeed.min, JELLYFISH_CONFIG.verticalSpeed.max),
      waveAmplitude: this.randomInRange(JELLYFISH_CONFIG.waveAmplitude.min, JELLYFISH_CONFIG.waveAmplitude.max),
      waveFrequency: this.randomInRange(JELLYFISH_CONFIG.waveFrequency.min, JELLYFISH_CONFIG.waveFrequency.max),
      glowIntensity: this.randomInRange(JELLYFISH_CONFIG.glowIntensity.min, JELLYFISH_CONFIG.glowIntensity.max),
      tentacleSeeds,
      baseY,
      x: JELLYFISH_CONFIG.spawnMargin + Math.random() * (dimensions.width - JELLYFISH_CONFIG.spawnMargin * 2),
      y: baseY,
      opacity: this.randomInRange(JELLYFISH_CONFIG.opacity.min, JELLYFISH_CONFIG.opacity.max),
      animationPhase: Math.random() * Math.PI * 2,
    };
  }

  updateJellyfish(
    jellyfish: JellyfishMarineLife[],
    dimensions: Dimensions,
    frameMultiplier: number
  ): JellyfishMarineLife[] {
    const updatedJellyfish: JellyfishMarineLife[] = [];
    const deltaSeconds = 0.016 * frameMultiplier;

    for (const jelly of jellyfish) {
      jelly.animationPhase += jelly.waveFrequency * frameMultiplier;
      jelly.x += jelly.horizontalSpeed * deltaSeconds;
      jelly.baseY += jelly.verticalSpeed * deltaSeconds;
      jelly.y = jelly.baseY + Math.sin(jelly.animationPhase) * jelly.waveAmplitude;

      const offScreen =
        jelly.x < -jelly.size ||
        jelly.x > dimensions.width + jelly.size ||
        jelly.y < -jelly.size ||
        jelly.y > dimensions.height + jelly.size;

      if (offScreen) {
        updatedJellyfish.push(this.createJellyfish(dimensions));
      } else {
        updatedJellyfish.push(jelly);
      }
    }

    return updatedJellyfish;
  }

  getJellyfishCount(quality: string): number {
    return JELLYFISH_COUNTS[quality] ?? 3;
  }

  private randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
}
