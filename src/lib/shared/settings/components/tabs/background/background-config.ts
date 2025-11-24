// background-config.ts - Background metadata configuration
import { BackgroundType } from "$shared/background/shared/domain/enums/background-enums";

export interface BackgroundMetadata {
  type: BackgroundType;
  name: string;
  description: string;
  icon: string;
  // For simple backgrounds
  color?: string;
  colors?: string[];
  direction?: number;
}

/**
 * Available backgrounds with their metadata and animation configurations
 */
export const backgroundsConfig: BackgroundMetadata[] = [
  {
    type: BackgroundType.AURORA,
    name: "Aurora",
    description: "Colorful flowing aurora with lens flare",
    icon: '<i class="fas fa-star"></i>',
  },
  {
    type: BackgroundType.SNOWFALL,
    name: "Snowfall",
    description: "Gentle falling snowflakes with shooting stars",
    icon: '<i class="fas fa-snowflake"></i>',
  },
  {
    type: BackgroundType.NIGHT_SKY,
    name: "Night Sky",
    description: "Starry night with twinkling celestial bodies",
    icon: '<i class="fas fa-moon"></i>',
  },
  {
    type: BackgroundType.DEEP_OCEAN,
    name: "Deep Ocean",
    description:
      "Immersive underwater scene with marine life and floating bubbles",
    icon: '<i class="fas fa-water"></i>',
  },
  {
    type: BackgroundType.SOLID_COLOR,
    name: "Pure Black",
    description: "Classic solid black background",
    icon: '<i class="fas fa-circle"></i>',
    color: "#000000",
  },
  {
    type: BackgroundType.LINEAR_GRADIENT,
    name: "Modern",
    description: "Sleek dark gradient",
    icon: '<i class="fas fa-square"></i>',
    colors: ["#0d1117", "#161b22", "#21262d"],
    direction: 135,
  },
];

/**
 * Get background metadata by type
 */
export function getBackgroundConfig(
  type: BackgroundType
): BackgroundMetadata | undefined {
  return backgroundsConfig.find((bg) => bg.type === type);
}

/**
 * Get all available background types
 */
export function getAvailableBackgroundTypes(): BackgroundType[] {
  return backgroundsConfig.map((bg) => bg.type);
}
