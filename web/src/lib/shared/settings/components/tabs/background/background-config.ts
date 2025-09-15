// background-config.ts - Background metadata configuration
import { BackgroundType } from "$shared/background/shared/domain/enums/background-enums";

export interface BackgroundMetadata {
  type: BackgroundType;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  animation: string;
}

/**
 * Available backgrounds with their metadata and animation configurations
 */
export const backgroundsConfig: BackgroundMetadata[] = [
  {
    type: BackgroundType.AURORA,
    name: "Aurora",
    description: "Colorful flowing aurora with animated blobs",
    icon: "🌌",
    gradient:
      "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
    animation: "aurora-flow",
  },
  {
    type: BackgroundType.SNOWFALL,
    name: "Snowfall",
    description: "Gentle falling snowflakes with shooting stars",
    icon: "❄️",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    animation: "snow-fall",
  },
  {
    type: BackgroundType.NIGHT_SKY,
    name: "Night Sky",
    description: "Starry night with twinkling celestial bodies",
    icon: "🌙",
    gradient: "linear-gradient(135deg, #0a0e2c 0%, #1a2040 50%, #2a3060 100%)",
    animation: "star-twinkle",
  },
  {
    type: BackgroundType.DEEP_OCEAN,
    name: "Deep Ocean",
    description:
      "Immersive underwater scene with marine life and floating bubbles",
    icon: "🌊",
    gradient: "linear-gradient(135deg, #001122 0%, #000c1e 50%, #000511 100%)",
    animation: "ocean-life",
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
