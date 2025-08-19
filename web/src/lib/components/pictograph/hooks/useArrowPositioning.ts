/**
 * useArrowPositioning.ts - Arrow Positioning Coordination Hook
 *
 * Provides a factory function for arrow positioning coordination.
 * The actual reactive state is managed within the Svelte component.
 */

import type { ArrowData, PictographData } from "$lib/domain";
import type { IArrowPositioningOrchestrator } from "$lib/services/positioning/core-services";
import { resolve } from "$lib/services/bootstrap";

export interface ArrowPositioningProps {
  /** Current pictograph data containing arrows */
  pictographData: PictographData | null;
}

/**
 * Factory function for arrow positioning coordination.
 * Returns the orchestrator and calculation function.
 */
export function useArrowPositioning(_props: ArrowPositioningProps) {
  // Get the orchestrator - SINGLE SOURCE OF TRUTH for arrow positioning
  const orchestrator = resolve(
    "IArrowPositioningOrchestrator"
  ) as IArrowPositioningOrchestrator;

  // MANUAL ARROW POSITIONING: Calculate positions when needed without reactive loops
  async function calculateArrowPositions(
    pictographData: PictographData | null
  ) {
    if (!pictographData?.arrows) {
      return {
        positions: {},
        mirroring: {},
        showArrows: true,
      };
    }

    try {
      // Use the orchestrator's calculateAllArrowPositions() method - the ONLY positioning authority
      const updatedPictographData =
        await orchestrator.calculateAllArrowPositions(pictographData);

      // Extract calculated positions and mirroring from the updated pictograph data
      const newPositions: Record<
        string,
        { x: number; y: number; rotation: number }
      > = {};
      const newMirroring: Record<string, boolean> = {};

      if (updatedPictographData.arrows) {
        Object.entries(updatedPictographData.arrows).forEach(
          ([color, arrowData]) => {
            if (arrowData) {
              // Type assertion to ArrowData from the orchestrator
              const arrow = arrowData as ArrowData;
              newPositions[color] = {
                x: arrow.position_x || 475,
                y: arrow.position_y || 475,
                rotation: arrow.rotation_angle || 0,
              };
              newMirroring[color] = arrow.isMirrored || false;
            }
          }
        );
      }

      return {
        positions: newPositions,
        mirroring: newMirroring,
        showArrows: true,
      };
    } catch (error) {
      console.error("Orchestrator positioning failed:", error);
      // Fallback: show arrows without coordination
      return {
        positions: {},
        mirroring: {},
        showArrows: true,
      };
    }
  }

  return {
    orchestrator,
    calculateArrowPositions,
  };
}
