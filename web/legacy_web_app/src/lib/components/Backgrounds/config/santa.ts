// src/lib/components/Backgrounds/config/santa.ts

export const SantaConfig = {
  santa: {
    size: 60, // Santa's size in pixels
    speed: 1.2, // Santa's movement speed
    verticalBobbing: {
      amplitude: 10, // How much Santa bobs up and down
      frequency: 0.02, // How fast Santa bobs
    },
    spawnChance: 0.001, // Chance per frame to spawn Santa
    minInterval: 30000, // Minimum time between Santa appearances (ms)
    maxInterval: 120000, // Maximum time between Santa appearances (ms)
    direction: {
      leftToRight: true, // Santa moves left to right by default
      changeChance: 0.3, // Chance to change direction
    },
    sleigh: {
      enabled: true,
      length: 40, // Length of sleigh trail
      opacity: 0.7,
    },
    reindeer: {
      count: 8, // Number of reindeer
      spacing: 15, // Space between reindeer
      bobOffset: 0.5, // Phase offset for reindeer bobbing
    },
  },
  enabledOnQuality: ["high", "medium"] as ("high" | "medium" | "low" | "minimal")[],
  enabledDuringDecember: true, // Only show during December
};

export const SeasonalConfig = {
  december: {
    enableSanta: true,
    enableSnowfall: true,
    enableChristmasColors: true,
    santaFrequency: 0.001, // Chance per frame
  },
  halloween: {
    enableBats: false, // Could be implemented later
    enablePumpkins: false,
    enableSpookyColors: false,
  },
  general: {
    checkSeasonalEvents: true,
    enableHolidayEffects: true,
  },
};

export type SantaConfigType = typeof SantaConfig;
export type SeasonalConfigType = typeof SeasonalConfig;