/**
 * Environment Type Enum
 *
 * Defines available 3D environments for the viewer.
 * Maps conceptually to BackgroundType but for 3D scenes.
 */
export enum EnvironmentType {
  /** No environment - just the grid planes */
  NONE = "none",

  /** Forest environment - ground, fog, falling leaves */
  FOREST = "forest",

  /** Cosmic environment - floating in space, drifting stars */
  COSMIC = "cosmic",
}

/**
 * Environment variant for theme-specific color palettes
 */
export type ForestVariant = "autumn" | "firefly";
export type CosmicVariant = "night" | "aurora";
