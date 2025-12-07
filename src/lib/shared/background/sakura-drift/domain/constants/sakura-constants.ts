/**
 * Sakura Drift Configuration Constants
 * 
 * Centralized configuration for cherry blossom behavior, colors, and physics.
 * Extracted for easy tuning and AI-friendly selective reading.
 */

/** Particle counts per quality tier */
export const SAKURA_COUNTS = {
  high: 150,
  medium: 100,
  low: 60,
} as const;

/** Flower vs petal distribution */
export const SAKURA_DISTRIBUTION = {
  /** Probability of spawning a full flower (vs single petal) */
  FLOWER_PROBABILITY: 0.3,
} as const;

/** Physics behavior constants */
export const SAKURA_PHYSICS = {
  /** Base falling speed */
  FALLING_SPEED_BASE: 0.2,
  /** Additional random falling speed range */
  FALLING_SPEED_RANGE: 0.6,
  /** Horizontal drift amplitude */
  DRIFT_AMPLITUDE: 0.4,
  /** Sway animation speed (radians per frame) */
  SWAY_SPEED: 0.02,
  /** Sway animation scale factor */
  SWAY_SCALE: 0.01,
  /** Minimum sway amplitude */
  SWAY_AMPLITUDE_MIN: 20,
  /** Sway amplitude range (added to minimum) */
  SWAY_AMPLITUDE_RANGE: 40,
} as const;

/** Size configuration */
export const SAKURA_SIZE = {
  /** Flower size range */
  FLOWER: {
    MIN: 8,
    RANGE: 8,
  },
  /** Single petal size range */
  PETAL: {
    MIN: 5,
    RANGE: 6,
  },
} as const;

/** Rotation configuration */
export const SAKURA_ROTATION = {
  /** Flower rotation speed (slower than petals) */
  FLOWER_SPEED: 0.015,
  /** Petal rotation speed */
  PETAL_SPEED: 0.04,
  /** Rotation speed randomness factor */
  RANDOMNESS: 0.5,
} as const;

/** Opacity configuration */
export const SAKURA_OPACITY = {
  /** Flower opacity range */
  FLOWER: {
    MIN: 0.8,
    RANGE: 0.2,
  },
  /** Petal opacity range */
  PETAL: {
    MIN: 0.6,
    RANGE: 0.3,
  },
} as const;

/** Color definitions for sakura variants */
export const SAKURA_COLORS = {
  /** Bright pink flowers (50% probability) */
  FLOWER_PINK: {
    r: 255,
    gMin: 182,
    gMax: 222,
    bMin: 210,
    bMax: 250,
    probability: 0.5,
  },
  /** White with pink tint flowers (50% probability) */
  FLOWER_WHITE: {
    r: 255,
    gMin: 240,
    gMax: 255,
    bMin: 245,
    bMax: 255,
  },
  /** Pale pink petals (40% probability) */
  PETAL_PINK: {
    r: 255,
    gMin: 220,
    gMax: 245,
    bMin: 230,
    bMax: 255,
    probability: 0.4,
  },
  /** Cream/off-white petals (30% probability) */
  PETAL_CREAM: {
    r: 255,
    gMin: 245,
    gMax: 255,
    bMin: 240,
    bMax: 255,
    probability: 0.7, // Cumulative with PETAL_PINK
  },
  /** Soft lavender petals (30% probability) */
  PETAL_LAVENDER: {
    r: 240,
    rRange: 15,
    gMin: 220,
    gMax: 240,
    b: 255,
  },
} as const;

/** Flower rendering configuration */
export const SAKURA_FLOWER = {
  /** Number of petals per flower */
  PETAL_COUNT: 5,
  /** Petal gradient inner position */
  GRADIENT_INNER: 0,
  /** Petal gradient mid position */
  GRADIENT_MID: 0.5,
  /** Petal gradient outer position */
  GRADIENT_OUTER: 1,
  /** Mid gradient opacity multiplier */
  MID_OPACITY: 0.9,
  /** Outer gradient opacity multiplier */
  OUTER_OPACITY: 0.4,
  /** Heart-shaped petal curve positions */
  CURVE: {
    WIDTH_FACTOR: 0.3,
    TOP_Y: 0.2,
    MID_Y: 0.5,
    BOTTOM_Y: 0.7,
    END_Y: 0.6,
  },
  /** Center (stamen) configuration */
  CENTER: {
    /** Center radius multiplier (relative to flower size) */
    RADIUS_MULTIPLIER: 0.15,
    /** Center color */
    COLOR: { r: 255, g: 220, b: 100 },
    /** Center outer color */
    OUTER_COLOR: { r: 255, g: 200, b: 80 },
    /** Center outer opacity multiplier */
    OUTER_OPACITY: 0.6,
  },
} as const;

/** Single petal rendering configuration */
export const SAKURA_PETAL = {
  /** Petal gradient positions */
  GRADIENT: {
    INNER: 0,
    MID: 0.7,
    OUTER: 1,
  },
  /** Gradient opacity multipliers */
  OPACITY: {
    MID: 0.8,
    OUTER: 0.3,
  },
  /** Ellipse dimensions (relative to size) */
  ELLIPSE: {
    PRIMARY: { width: 0.6, height: 1.0 },
    SECONDARY: { width: 0.4, height: 0.8, rotation: Math.PI / 4 },
  },
} as const;

/** Respawn and wrap behavior */
export const SAKURA_BOUNDS = {
  /** Buffer distance outside viewport for respawning */
  RESPAWN_BUFFER: 20,
} as const;

/** Soft twilight background gradient */
export const SAKURA_BACKGROUND_GRADIENT = [
  { position: 0, color: "#2a1f2e" },      // Dark purple
  { position: 0.3, color: "#3d2f42" },    // Medium purple
  { position: 0.6, color: "#4a3d52" },    // Soft lavender
  { position: 1, color: "#362d40" },      // Dark lavender
] as const;
