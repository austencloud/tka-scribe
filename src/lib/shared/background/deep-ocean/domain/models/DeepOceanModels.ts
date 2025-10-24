// Deep Ocean Background Models

export interface Bubble {
  x: number;
  y: number;
  radius: number;
  speed: number;
  sway: number;
  opacity: number;
  swayOffset: number;
  startY: number;
}

export type MarineLifeType = "fish" | "jellyfish";

export interface FishSprite {
  name: string;
  path: string;
}

interface MarineLifeBase {
  type: MarineLifeType;
  x: number;
  y: number;
  opacity: number;
  animationPhase: number;
}

export interface FishMarineLife extends MarineLifeBase {
  type: "fish";
  sprite: FishSprite;
  image?: HTMLImageElement;
  width: number;
  height: number;
  direction: 1 | -1;
  speed: number;
  verticalDrift: number;
  bobAmplitude: number;
  bobSpeed: number;
  depthBand: { min: number; max: number };
  baseY: number;
}

export interface JellyfishMarineLife extends MarineLifeBase {
  type: "jellyfish";
  size: number;
  color: string;
  horizontalSpeed: number;
  verticalSpeed: number;
  waveAmplitude: number;
  waveFrequency: number;
  glowIntensity: number;
  tentacleSeeds: number[];
  baseY: number;
}

export type MarineLife = FishMarineLife | JellyfishMarineLife;

export interface OceanParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface MarineLifeSpawn {
  type: MarineLifeType;
  spawnTime: number; // When to spawn (in animation time)
}

export interface DeepOceanState {
  bubbles: Bubble[];
  marineLife: MarineLife[];
  particles: OceanParticle[];
  currentGradient: {
    top: string;
    bottom: string;
  };
  lightRays: Array<{
    x: number;
    opacity: number;
    width: number;
    angle: number;
    phase: number;
    speed: number;
  }>;
  pendingSpawns: MarineLifeSpawn[];
}
