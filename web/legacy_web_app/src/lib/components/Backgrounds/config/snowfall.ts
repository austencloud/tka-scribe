// src/lib/components/Backgrounds/config/snowfall.ts

export const SnowfallConfig = {
  snowflake: {
    density: 0.00008, // Snowflakes per pixel
    minSize: 2,
    maxSize: 8,
    minSpeed: 0.5,
    maxSpeed: 2.5,
    colors: [
      "#ffffff",
      "#f0f8ff", // Alice blue
      "#e6f3ff", // Light blue
      "#ddeeff", // Very light blue
      "#f5f5f5", // White smoke
    ],
    windChangeInterval: 300, // Frames between wind changes
  },
  shootingStar: {
    minInterval: 3000, // Minimum time between shooting stars (ms)
    maxInterval: 8000, // Maximum time between shooting stars (ms)
    minSize: 1,
    maxSize: 3,
    minSpeed: 2,
    maxSpeed: 5,
    colors: [
      "#ffffff",
      "#ffff99", // Light yellow
      "#99ccff", // Light blue
      "#ffcc99", // Light orange
      "#ccffcc", // Light green
    ],
    tailLength: {
      min: 8,
      max: 20,
    },
    fadeRate: 0.02, // How fast shooting stars fade when off-screen
    twinkleChance: 0.3, // Chance for a shooting star to twinkle
  },
  background: {
    gradientStops: [
      { position: 0, color: "#0a0a1a" }, // Dark blue-black
      { position: 0.3, color: "#1a1a2e" }, // Dark blue
      { position: 0.7, color: "#16213e" }, // Medium blue
      { position: 1, color: "#0f3460" }, // Lighter blue
    ],
  },
  performance: {
    lowPerformanceThreshold: 45, // FPS threshold for low performance
    criticalPerformanceThreshold: 30, // FPS threshold for critical performance
  },
};

export type SnowfallConfigType = typeof SnowfallConfig;