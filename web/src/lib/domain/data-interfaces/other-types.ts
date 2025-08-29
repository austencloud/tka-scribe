/**
 * Other Types
 *
 * Domain models extracted from service implementations.
 */

// Add missing type definitions at the top
export type QualityLevel = "low" | "medium" | "high" | "ultra";
export type SortMethod = "alphabetical" | "chronological" | "custom" | "none";

// Import required types

export interface CometConfig {
  size: number;
  speed: number;
  color: string;
  tailLength: number;
  interval: number;
  enabledOnQuality: QualityLevel[];
}

interface JsonPlacementData {
  [placementKey: string]: {
    [turns: string]: [number, number]; // [x, y] adjustment
  };
}

// Missing type definitions
interface Type1MotionPattern {
  type: string;
  sequence: string[];
}
