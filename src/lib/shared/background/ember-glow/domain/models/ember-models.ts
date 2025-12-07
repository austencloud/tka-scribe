/**
 * Domain models for Ember Glow background
 */

export interface Ember {
  x: number; // Horizontal position
  y: number; // Vertical position
  size: number; // Size of the ember
  vx: number; // Horizontal velocity (drift)
  vy: number; // Vertical velocity (rising)
  opacity: number; // Current opacity
  glowRadius: number; // Glow effect radius
  flickerOffset: number; // Offset for flicker animation
  color: { r: number; g: number; b: number }; // RGB color values
}
