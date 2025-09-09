/**
 * Arrow Positioning Coordination Service Implementation
 *
 * Coordinates bulk arrow positioning by using the existing ArrowPositioningService.
 * Replaces the React-style hook with proper Svelte 5 service architecture.
 */

import { injectable, inject } from 'inversify';
import { TYPES, type IArrowPositioningService, type MotionData, type PictographData } from '$shared';

import type { 
  IArrowPositioningCoordinator, 
  ArrowPositioningResult,
  ArrowPositionResult 
} from '../contracts/IArrowPositioningCoordinator';

@injectable()
export class ArrowPositioningCoordinator implements IArrowPositioningCoordinator {
  constructor(
    @inject(TYPES.IArrowPositioningService)
    private readonly arrowPositioningService: IArrowPositioningService
  ) {}

  async calculateAllArrowPositions(
    pictographData: PictographData | null
  ): Promise<ArrowPositioningResult> {
    if (!pictographData?.motions) {
      return {
        positions: {},
        mirroring: {},
        showArrows: true,
      };
    }

    try {
      const positions: Record<string, ArrowPositionResult> = {};
      const mirroring: Record<string, boolean> = {};

      console.log('🎯 ArrowPositioningCoordinator: Starting calculation for all arrows');

      // Process each motion/arrow using the existing ArrowPositioningService
      for (const [color, motionData] of Object.entries(pictographData.motions || {})) {
        const typedMotionData = motionData as MotionData;
        
        if (this.isValidMotionData(typedMotionData)) {
          try {
            const arrowPlacement = typedMotionData.arrowPlacementData;

            // Use existing service for individual arrow positioning
            const position = await this.arrowPositioningService.calculatePosition(
              arrowPlacement,
              typedMotionData,
              pictographData
            );

            const shouldMirror = this.arrowPositioningService.shouldMirror(
              arrowPlacement,
              typedMotionData,
              pictographData
            );

            positions[color] = position;
            mirroring[color] = shouldMirror;
          } catch (error) {
            console.error(`❌ ArrowPositioningCoordinator: Failed to calculate position for ${color} arrow:`, error);
            
            // Fallback to center position if calculation fails
            positions[color] = this.createFallbackPosition();
            mirroring[color] = false;
          }
        }
      }

      return {
        positions,
        mirroring,
        showArrows: true,
      };
    } catch (error) {
      console.error('❌ ArrowPositioningCoordinator: Bulk positioning failed:', error);
      
      // Fallback: show arrows without coordination
      return {
        positions: {},
        mirroring: {},
        showArrows: true,
      };
    }
  }

  private isValidMotionData(motionData: MotionData): boolean {
    return motionData && 
           motionData.isVisible && 
           !!motionData.arrowPlacementData;
  }

  private createFallbackPosition(): ArrowPositionResult {
    return {
      x: 475,
      y: 475,
      rotation: 0,
    };
  }
}