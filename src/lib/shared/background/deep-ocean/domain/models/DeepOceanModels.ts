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

/** Depth layer for parallax effect */
export type DepthLayer = "far" | "mid" | "near";

/** Fish behavior state */
export type FishBehavior = "cruising" | "turning" | "darting" | "schooling";

export interface FishMarineLife extends MarineLifeBase {
  type: "fish";
  sprite: FishSprite;
  /** Pre-rendered canvas with color variant baked in (no runtime filters) */
  canvas?: HTMLCanvasElement | OffscreenCanvas;
  /** @deprecated Use canvas instead - kept for fallback only */
  image?: HTMLImageElement;
  width: number;
  height: number;
  direction: 1 | -1;
  speed: number;
  baseSpeed: number; // Original speed for behavior resets
  verticalDrift: number;
  bobAmplitude: number;
  bobSpeed: number;
  depthBand: { min: number; max: number };
  baseY: number;

  // Depth/parallax properties
  depthLayer: DepthLayer;
  depthScale: number; // 0.5-1.0, affects size and speed

  // Behavior properties
  behavior: FishBehavior;
  behaviorTimer: number; // Time until behavior change
  targetDirection?: 1 | -1; // For turning behavior
  dartSpeed?: number; // For darting behavior

  // Schooling properties
  schoolId?: number; // Fish in same school follow each other
  leaderOffset?: { x: number; y: number }; // Offset from school leader

  // Visual enhancements
  rotation: number; // Slight tilt based on vertical movement
  tailPhase: number; // For tail wiggle animation
  hueRotate: number; // Color variant (degrees) - now baked into canvas
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

/** Light ray from surface */
export interface LightRay {
  x: number;
  opacity: number;
  width: number;
  angle: number;
  phase: number;
  speed: number;
}

export interface DeepOceanState {
  bubbles: Bubble[];
  fish: FishMarineLife[];
  jellyfish: JellyfishMarineLife[];
  particles: OceanParticle[];
  currentGradient: {
    top: string;
    bottom: string;
  };
  lightRays: LightRay[];
  pendingFishSpawns: number[]; // Spawn times
  schools: Map<number, FishMarineLife[]>; // schoolId -> fish in school
}

/** @deprecated Use fish + jellyfish arrays separately */
export type MarineLife = FishMarineLife | JellyfishMarineLife;
