// Night Sky Configuration Models

export interface StarConfig {
  minSize: number;
  maxSize: number;
  colors: string[];
  baseOpacityMin: number;
  baseOpacityMax: number;
  minTwinkleSpeed: number;
  maxTwinkleSpeed: number;
  twinkleChance: number;
}