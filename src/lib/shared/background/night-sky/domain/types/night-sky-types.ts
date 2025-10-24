// Night Sky Background Types

export type NightSkyTheme = "default" | "aurora" | "nebula" | "cosmic";

export type StarSize = "small" | "medium" | "large";

export type AnimationSpeed = "slow" | "normal" | "fast";

export interface NightSkySettings {
  theme: NightSkyTheme;
  starCount: number;
  animationSpeed: AnimationSpeed;
  enableTwinkle: boolean;
  enableDrift: boolean;
}
