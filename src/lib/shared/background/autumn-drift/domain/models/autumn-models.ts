// Autumn Drift Background Models
// Type definitions for the autumn leaf particle system

export type LeafType = "maple" | "oak" | "oval";

export interface Leaf {
  // Position
  x: number;
  y: number;

  // Velocity
  vx: number; // horizontal velocity (affected by wind)
  vy: number; // vertical velocity (falling)

  // Visual properties
  size: number;
  type: LeafType;
  color: string;
  opacity: number;

  // Primary rotation (2D spin)
  rotation: number;
  rotationSpeed: number;

  // Secondary rotation for 3D tumble effect
  tumblePhase: number;
  tumbleSpeed: number;

  // Depth for parallax (0 = far, 1 = close)
  depth: number;

  // Optional spiral descent
  spiralPhase?: number;
  spiralActive?: boolean;
}

export interface WindGust {
  active: boolean;
  strength: number; // positive = right, negative = left
  duration: number; // frames remaining
  currentStrength: number; // decaying value applied to leaves
}

export interface WindState {
  gust: WindGust;
  framesSinceLastGust: number;
  nextGustIn: number;
}

export interface LeafSystemConfig {
  particleCount: number;
  canvasWidth: number;
  canvasHeight: number;
}

export interface AutumnDriftConfig {
  quality: "high" | "medium" | "low" | "minimal";
  reducedMotion?: boolean;
}
