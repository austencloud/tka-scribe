/**
 * Codex Service Interfaces
 *
 * Interfaces for codex management, pictograph operations, and letter-based sequence generation.
 * This includes pictograph transformations and codex data management.
 */
// ============================================================================
// PICTOGRAPH OPERATIONS INTERFACES
// ============================================================================
/**
 * Types of operations that can be performed on pictographs
 */

// ============================================================================
// DATA CONTRACTS (Domain Models)
// ============================================================================

export type PictographOperation = "rotate" | "mirror" | "colorSwap";
