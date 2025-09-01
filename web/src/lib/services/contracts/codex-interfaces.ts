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
import type { PictographTransformOperation } from "$domain/learn/codex";
import type { PictographData } from "../../domain/models/core/PictographData";

// Re-export the imported types so other services can use them
export type { PictographTransformOperation } from "$domain/learn/codex";

// ============================================================================
// SERVICE CONTRACTS (Behavioral Interfaces)
// ============================================================================

export interface IPictographOperationsService {
  rotateAllPictographs(
    pictographs: PictographData[]
  ): Promise<PictographData[]>;
  mirrorAllPictographs(
    pictographs: PictographData[]
  ): Promise<PictographData[]>;
  colorSwapAllPictographs(
    pictographs: PictographData[]
  ): Promise<PictographData[]>;
  applyOperation(
    pictographs: PictographData[],
    operation: PictographTransformOperation
  ): Promise<PictographData[]>;
}
