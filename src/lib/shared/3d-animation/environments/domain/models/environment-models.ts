/**
 * Environment Models
 *
 * Configuration interfaces for 3D environments and primitives.
 */

import type { EnvironmentType, ForestVariant, CosmicVariant } from "../enums/environment-enums";

/**
 * Base environment configuration
 */
export interface EnvironmentConfig {
  type: EnvironmentType;
  name: string;
  description: string;
  icon: string;
}

/**
 * Ground plane configuration
 */
export interface GroundPlaneConfig {
  color: string;
  opacity: number;
  size: number;
  segments?: number;
  position?: [number, number, number];
}

/**
 * Fog configuration
 */
export interface FogConfig {
  color: string;
  near: number;
  far: number;
}

/**
 * Sky gradient configuration
 */
export interface SkyGradientConfig {
  topColor: string;
  bottomColor: string;
  midColor?: string;
  radius?: number;
}

/**
 * Particle type for FallingParticles
 */
export type ParticleType = "leaves" | "snow" | "petals" | "embers" | "stars";

/**
 * Falling particles configuration
 */
export interface FallingParticlesConfig {
  type: ParticleType;
  count: number;
  area: { width: number; height: number; depth: number };
  speed: number;
  colors: string[];
  sizeRange: [number, number];
  spin?: boolean;
}

/**
 * Forest scene configuration
 */
export interface ForestSceneConfig {
  variant: ForestVariant;
  ground: GroundPlaneConfig;
  fog: FogConfig;
  sky: SkyGradientConfig;
  particles: FallingParticlesConfig;
}

/**
 * Cosmic scene configuration
 */
export interface CosmicSceneConfig {
  variant: CosmicVariant;
  fog: FogConfig;
  sky: SkyGradientConfig;
  particles: FallingParticlesConfig;
}

/**
 * Environment metadata for the picker UI
 */
export const environmentMetadata: EnvironmentConfig[] = [
  {
    type: EnvironmentType.NONE,
    name: "None",
    description: "No environment - just the grid",
    icon: "fa-border-none",
  },
  {
    type: EnvironmentType.FOREST,
    name: "Forest",
    description: "Misty forest with falling leaves",
    icon: "fa-tree",
  },
  {
    type: EnvironmentType.COSMIC,
    name: "Cosmic",
    description: "Floating in space with drifting stars",
    icon: "fa-stars",
  },
];

/**
 * Get environment metadata by type
 */
export function getEnvironmentConfig(type: EnvironmentType): EnvironmentConfig | undefined {
  return environmentMetadata.find((env) => env.type === type);
}
