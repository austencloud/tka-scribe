import type { FishSprite } from "../../domain/models/DeepOceanModels";

/**
 * Pre-rendered sprite with canvas (no runtime filters needed)
 */
export interface PreRenderedSprite {
  sprite: FishSprite;
  /** Pre-rendered canvas with color variant applied */
  canvas: HTMLCanvasElement | OffscreenCanvas;
  width: number;
  height: number;
  /** Original hue rotation for reference */
  hueRotate: number;
}

/**
 * Contract for fish sprite management and caching
 */
export interface IFishSpriteManager {
  /**
   * Preload all fish sprites and pre-render color variants
   */
  preloadSprites(): Promise<void>;

  /**
   * Get a random pre-rendered sprite (no runtime filters)
   */
  getRandomSpriteEntry(): PreRenderedSprite | undefined;

  /**
   * Get any loaded sprite entry (for fish created before sprites finished loading)
   */
  getAnyLoadedSpriteEntry(): PreRenderedSprite | undefined;

  /**
   * Get marine life color for type
   */
  getMarineLifeColor(type: "fish" | "jellyfish"): string;

  /**
   * Check if sprites are loaded and ready
   */
  isReady(): boolean;
}
