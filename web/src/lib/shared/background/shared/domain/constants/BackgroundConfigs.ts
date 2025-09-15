// Background Configuration Constants

/**
 * Snowfall configuration object
 */
export const SnowfallConfig = {
  snowflake: {
    colors: ["#ffffff", "#f0f8ff", "#e6f3ff", "#ddeeff"],
    minSize: 2,
    maxSize: 8,
    minSpeed: 0.5,
    maxSpeed: 2,
    density: 0.0001,
    windChangeInterval: 300,
  },
  shootingStar: {
    colors: ["#ffffff", "#ffff99", "#99ccff", "#ffcc99"],
    minSize: 2,
    maxSize: 4,
    minSpeed: 0.8,
    maxSpeed: 1.5,
    minInterval: 5000,
    maxInterval: 15000,
    tailLength: {
      min: 10,
      max: 20,
    },
  },
};

/**
 * Core background configuration
 */
export const CoreBackgroundConfig = {
  gradientStops: [
    { position: 0, color: "#1a1a2e" },
    { position: 0.5, color: "#16213e" },
    { position: 1, color: "#0f3460" },
  ],
} as const;

/**
 * Quality level configurations
 */
export const QUALITY_CONFIGS = {
  minimal: {
    maxParticles: 20,
    animationFrameRate: 15,
    enableBlur: false,
    enableGlow: false,
    particleSize: 1,
    densityMultiplier: 0.3,
  },
  low: {
    maxParticles: 50,
    animationFrameRate: 30,
    enableBlur: false,
    enableGlow: false,
    particleSize: 2,
    densityMultiplier: 0.5,
  },
  medium: {
    maxParticles: 100,
    animationFrameRate: 45,
    enableBlur: true,
    enableGlow: false,
    particleSize: 3,
    densityMultiplier: 0.75,
  },
  high: {
    maxParticles: 200,
    animationFrameRate: 60,
    enableBlur: true,
    enableGlow: true,
    particleSize: 4,
    densityMultiplier: 1.0,
  },
} as const;
