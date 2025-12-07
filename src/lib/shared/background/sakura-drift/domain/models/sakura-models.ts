/**
 * Domain models for Sakura Drift background
 */

export interface SakuraPetal {
  x: number; // Horizontal position
  y: number; // Vertical position
  size: number; // Size of the petal
  vx: number; // Horizontal velocity (drift)
  vy: number; // Vertical velocity (falling)
  rotation: number; // Current rotation angle
  rotationSpeed: number; // Rotation speed
  opacity: number; // Current opacity
  swayOffset: number; // Offset for sway animation
  swayAmplitude: number; // How much the petal sways
  color: { r: number; g: number; b: number }; // RGB color values
  isFlower: boolean; // True if this is a full flower, false if just a petal
}

export interface SakuraCluster {
  x: number; // Center position
  y: number; // Center position
  petals: SakuraPetal[]; // Petals in this cluster
  vy: number; // Falling speed for the whole cluster
}
