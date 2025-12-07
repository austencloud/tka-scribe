/**
 * Ember Glow Configuration Constants
 * 
 * Centralized configuration for ember particle behavior, colors, and physics.
 * Extracted for easy tuning and AI-friendly selective reading.
 */

/** Particle counts per quality tier */
export const EMBER_COUNTS = {
  high: 200,
  medium: 140,
  low: 80,
} as const;

/** Physics behavior constants */
export const EMBER_PHYSICS = {
  /** Base rising speed (negative = upward) */
  RISING_SPEED_BASE: 0.3,
  /** Additional random rising speed range */
  RISING_SPEED_RANGE: 0.8,
  /** Horizontal drift amplitude */
  DRIFT_AMPLITUDE: 0.3,
  /** Glow radius multiplier (relative to ember size) */
  GLOW_MULTIPLIER: 12,
  /** Flicker animation speed (radians per frame) */
  FLICKER_SPEED: 0.08,
  /** Minimum opacity during flicker (prevents invisible embers) */
  FLICKER_MIN_OPACITY: 0.4,
  /** Flicker intensity range (0.8 to 1.0) */
  FLICKER_AMPLITUDE: 0.2,
  /** Base flicker factor */
  FLICKER_BASE: 0.8,
} as const;

/** Ember size configuration */
export const EMBER_SIZE = {
  /** Minimum ember size */
  MIN: 2,
  /** Size range (added to minimum) */
  RANGE: 5,
} as const;

/** Ember opacity configuration */
export const EMBER_OPACITY = {
  /** Minimum base opacity */
  MIN: 0.6,
  /** Opacity range (added to minimum) */
  RANGE: 0.4,
  /** Core opacity multiplier (for solid center) */
  CORE_MULTIPLIER: 1.2,
} as const;

/** Color definitions for ember variants */
export const EMBER_COLORS = {
  /** Bright orange-red embers (30% probability) */
  ORANGE_RED: {
    r: 255,
    gMin: 120,
    gMax: 170,
    bMin: 20,
    bMax: 50,
    probability: 0.3,
  },
  /** Bright amber/orange embers (40% probability) */
  AMBER: {
    r: 255,
    gMin: 160,
    gMax: 220,
    bMin: 30,
    bMax: 70,
    probability: 0.7, // Cumulative with ORANGE_RED
  },
  /** Very bright white-hot embers (30% probability) */
  WHITE_HOT: {
    r: 255,
    gMin: 220,
    gMax: 255,
    bMin: 100,
    bMax: 150,
  },
} as const;

/** Gradient rendering constants */
export const EMBER_GRADIENT = {
  /** Inner gradient stop position */
  INNER_STOP: 0.4,
  /** Inner gradient opacity multiplier */
  INNER_OPACITY: 0.6,
} as const;

/** Respawn and wrap behavior */
export const EMBER_BOUNDS = {
  /** Buffer distance outside viewport for respawning */
  RESPAWN_BUFFER: 20,
} as const;

/** Dark amber background gradient */
export const EMBER_BACKGROUND_GRADIENT = [
  { position: 0, color: "#1a0a0a" },      // Very dark brown-red
  { position: 0.3, color: "#2d1410" },    // Dark burgundy
  { position: 0.6, color: "#4a1f1a" },    // Dark amber
  { position: 1, color: "#3d1814" },      // Dark rust
] as const;
