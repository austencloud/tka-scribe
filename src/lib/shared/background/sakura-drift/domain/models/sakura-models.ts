/**
 * Domain models for Sakura Drift background
 */

export interface SakuraPetal {
  x: number; // Horizontal position
  y: number; // Vertical position
  size: number; // Size of the petal
  vx: number; // Horizontal velocity (drift)
  vy: number; // Vertical velocity (falling)
  baseVy: number; // Base falling speed (before tumble modulation)
  rotation: number; // Current rotation angle
  rotationSpeed: number; // Rotation speed
  opacity: number; // Current opacity
  swayOffset: number; // Primary sway oscillation phase
  swayAmplitude: number; // How much the petal sways
  secondarySwayOffset: number; // Secondary oscillation for complexity
  tumblePhase: number; // Phase for tumble-drag coupling
  tumbleSpeed: number; // How fast the tumble phase advances
  flutterIntensity: number; // How much this petal flutters (0-1)
  driftBias: number; // Tendency to drift left (-1) or right (1)
  color: { r: number; g: number; b: number }; // RGB color values
  isFlower: boolean; // True if this is a full flower, false if just a petal
}

export interface SakuraCluster {
  x: number; // Center position
  y: number; // Center position
  petals: SakuraPetal[]; // Petals in this cluster
  vy: number; // Falling speed for the whole cluster
}
