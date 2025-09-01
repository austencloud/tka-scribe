/**
 * Core Type Aliases
 *
 * Fundamental type aliases and unions used across multiple service domains.
 * Only contains type aliases, not interface models.
 */

// ============================================================================
// TYPE ALIASES
// ============================================================================

// Use centralized enum types - no duplicates!
export type HandRotDir = "cw_shift" | "ccw_shift";

// Re-export types from domain
export { GridMode } from "../../enums/enums";
export type {
  DifficultyLevel,
  MotionColor,
  PropContinuity,
} from "../../enums/enums";

// ============================================================================
// SERVICE REGISTRY TYPES
// ============================================================================

export type ServiceInterface<T> = {
  readonly name: string;
  readonly _type?: T;
};

/**
 * Helper function to define service interfaces for the DI container
 */
export function defineService<T>(name: string): ServiceInterface<T> {
  return { name } as ServiceInterface<T>;
}
