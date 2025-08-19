/**
 * Arrow Positioning Service for Svelte Components
 *
 * SINGLE SOURCE OF TRUTH: Thin wrapper around ArrowPositioningOrchestrator.
 * All positioning logic handled by the sophisticated positioning pipeline.
 * NO duplicate positioning logic allowed!
 */

import type { ArrowData, MotionData, PictographData } from "$lib/domain";
import { MotionColor } from "$lib/domain/enums";
import type { IArrowPositioningOrchestrator } from "$lib/services/positioning";
import { getPositioningServiceFactory } from "$lib/services/positioning/PositioningServiceFactory";

export interface ArrowPositionResult {
  x: number;
  y: number;
  rotation: number;
}

export interface ArrowPositioningInput {
  arrowType: MotionColor;
  motionType: string;
  location: string;
  gridMode: string;
  turns: number;
  letter?: string;
  start_orientation?: string;
  end_orientation?: string;
}

export interface Position {
  x: number;
  y: number;
}

export class ArrowPositioningService {
  private orchestrator: IArrowPositioningOrchestrator;

  constructor() {
    // Use the singleton factory to get a properly configured orchestrator
    // This prevents recreating placement services and reloading data on hot reload
    const factory = getPositioningServiceFactory();
    this.orchestrator = factory.createPositioningOrchestrator();
  }

  /**
   * Calculate arrow position using the sophisticated positioning pipeline
   */
  async calculatePosition(
    arrowData: ArrowData,
    motionData: MotionData,
    pictographData: PictographData
  ): Promise<ArrowPositionResult> {
    console.log(
      `🎯 ArrowPositioningService.calculatePosition called for ${arrowData.color} arrow`
    );
    console.log(`Arrow data:`, {
      motionType: arrowData.motionType,
      start_orientation: arrowData.start_orientation,
      end_orientation: arrowData.end_orientation,
      turns: arrowData.turns,
      position_x: arrowData.position_x,
      position_y: arrowData.position_y,
    });
    console.log(`Motion data:`, {
      motionType: motionData.motionType,
      startLocation: motionData.startLocation,
      endLocation: motionData.endLocation,
      turns: motionData.turns,
    });

    try {
      // Use the sophisticated positioning pipeline
      console.log(`🔧 Calling orchestrator.calculateArrowPosition...`);
      const [x, y, rotation] = await this.orchestrator.calculateArrowPosition(
        arrowData,
        pictographData,
        motionData
      );

      console.log(
        `✅ Orchestrator returned: (${x}, ${y}) rotation: ${rotation}°`
      );
      return { x, y, rotation };
    } catch (error) {
      console.error("🚨 CRITICAL: Orchestrator positioning failed:", error);
      console.error("This should never happen in production!");
      throw error; // Don't hide orchestrator failures
    }
  }

  /**
   * Determine if arrow should be mirrored based on motion data
   */
  shouldMirror(
    arrowData: ArrowData,
    _motionData: MotionData,
    pictographData: PictographData
  ): boolean {
    try {
      return this.orchestrator.shouldMirrorArrow(arrowData, pictographData);
    } catch (error) {
      console.error("🚨 CRITICAL: Mirror determination failed:", error);
      throw error; // Don't hide orchestrator failures
    }
  }

  /**
   * Legacy interface for backward compatibility
   */
}

// Create singleton instance
export const arrowPositioningService = new ArrowPositioningService();
