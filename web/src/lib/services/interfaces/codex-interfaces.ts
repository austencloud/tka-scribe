/**
 * Codex Service Interfaces
 *
 * Interfaces for codex management, pictograph operations, and letter-based sequence generation.
 * This includes pictograph transformations and codex data management.
 */

import type { PictographData } from "$lib/domain/PictographData";

// ============================================================================
// PICTOGRAPH OPERATIONS INTERFACES
// ============================================================================

/**
 * Types of operations that can be performed on pictographs
 */
export type PictographOperation = "rotate" | "mirror" | "colorSwap";

/**
 * Service for performing operations on pictographs
 *
 * Handles operations that can be performed on pictographs like
 * rotation, mirroring, and color swapping.
 */
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
    operation: PictographOperation
  ): Promise<PictographData[]>;
}
