// Autumn Drift Background Constants
// All tuning parameters for the autumn leaf particle system

export const AUTUMN_PARTICLE_COUNTS = {
  high: 100,
  medium: 70,
  low: 45,
  minimal: 20,
  "ultra-minimal": 10,
} as const;

export const AUTUMN_PHYSICS = {
  // Base falling speed (faster than sakura's 0.2 for heavier feel)
  baseSpeed: 0.5,
  speedVariance: 0.7,
  // Horizontal drift
  baseDrift: 0.15,
  driftVariance: 0.2,
  // Rotation (faster than sakura for tumbling effect)
  rotationSpeed: { min: 0.02, max: 0.06 },
  // Secondary rotation axis for 3D tumble
  tumbleSpeed: { min: 0.015, max: 0.045 },
  // Size affects speed (larger = slower)
  sizeSpeedFactor: 0.6,
  // Spiral descent chance
  spiralChance: 0.25,
  spiralSpeed: 0.03,
  spiralRadius: 0.4,
} as const;

export const AUTUMN_WIND = {
  // Frames between gusts
  gustIntervalMin: 180,
  gustIntervalMax: 360,
  // Gust duration in frames
  gustDurationMin: 50,
  gustDurationMax: 100,
  // Gust strength (horizontal acceleration)
  gustStrengthMin: 0.4,
  gustStrengthMax: 1.2,
  // Decay rate per frame
  gustDecay: 0.02,
} as const;

export const AUTUMN_COLORS = {
  // Warm golds (30% chance)
  golds: ["#D4A017", "#C9A227", "#B8860B", "#DAA520", "#E6B422"],
  // Burnt oranges (30% chance)
  oranges: ["#CC5500", "#E25822", "#D2691E", "#FF6B35", "#CD853F"],
  // Deep reds (25% chance)
  reds: ["#8B0000", "#A52A2A", "#CD5C5C", "#B22222", "#C41E3A"],
  // Browns (10% chance)
  browns: ["#8B4513", "#A0522D", "#6B4423", "#5D4037", "#704214"],
  // Transitional greens (5% chance - leaves still turning)
  greens: ["#556B2F", "#6B8E23", "#808000"],
} as const;

export const AUTUMN_LEAF_SIZES = {
  maple: { min: 18, max: 30 },
  oak: { min: 16, max: 26 },
  oval: { min: 12, max: 20 },
} as const;

export const AUTUMN_LEAF_DISTRIBUTION = {
  maple: 0.4, // 40%
  oak: 0.35, // 35%
  oval: 0.25, // 25%
} as const;

export const AUTUMN_OPACITY = {
  min: 0.7,
  max: 1.0,
  // Depth affects opacity (further = more transparent)
  depthFactor: 0.3,
} as const;

export const AUTUMN_BOUNDS = {
  // Respawn buffer outside viewport
  respawnBuffer: 30,
  // Horizontal wrap margin
  wrapMargin: 50,
} as const;

export const AUTUMN_BACKGROUND = {
  // Gradient stops for the dusk sky
  gradient: [
    { stop: 0, color: "#1a1520" }, // Deep purple-brown sky
    { stop: 0.3, color: "#2d1f28" }, // Warm purple
    { stop: 0.6, color: "#3d2a1f" }, // Amber-brown
    { stop: 1.0, color: "#2a1810" }, // Dark earth
  ],
} as const;
