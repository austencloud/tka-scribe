/**
 * 🎯 ARROW POSITIONING ORCHESTRATOR
 * 
 * Enterprise-grade arrow positioning service with sophisticated calculation algorithms.
 * Based on modern desktop app positioning patterns.
 * 
 * Source: src/desktop/modern/src/application/services/core/arrow_positioning_orchestrator.py
 */

import type { 
  IArrowPositioningOrchestrator,
  ArrowPosition,
  Location,
  Orientation,
  MotionType,
  MotionData
} from '../interfaces/IPictographRenderer.js';

import type { PictographData } from '@tka/domain';

// ============================================================================
// ARROW POSITIONING ORCHESTRATOR IMPLEMENTATION
// ============================================================================

export class ArrowPositioningOrchestrator implements IArrowPositioningOrchestrator {
  private readonly CENTER_X = 475;
  private readonly CENTER_Y = 475;
  private readonly HAND_RADIUS = 143.1;
  private readonly BETA_OFFSET = 30; // Offset for beta positioning

  // ============================================================================
  // MAIN POSITIONING METHODS
  // ============================================================================

  calculateArrowPosition(
    color: string,
    motionData: MotionData,
    pictographData?: PictographData
  ): ArrowPosition {
    try {
      // Get base position from start location
      const basePosition = this.getLocationCoordinates(motionData.startLoc);
      
      // Calculate rotation based on motion
      const rotation = this.calculateRotation(motionData);
      
      // Apply beta positioning if needed
      let finalPosition = basePosition;
      if (this.shouldApplyBetaPositioning(color, motionData, pictographData)) {
        finalPosition = this.applyBetaPositioning(basePosition, motionData);
      }
      
      // Apply motion-specific adjustments
      finalPosition = this.applyMotionAdjustments(finalPosition, motionData);
      
      return {
        x: finalPosition.x,
        y: finalPosition.y,
        rotation,
        isMirrored: this.shouldMirrorArrow(motionData)
      };
      
    } catch (error) {
      console.error('Error calculating arrow position:', error);
      return this.getDefaultPosition();
    }
  }

  shouldMirrorArrow(motionData: MotionData): boolean {
    // Determine if arrow should be mirrored based on motion characteristics
    if (motionData.motionType === MotionType.ANTI) {
      return true;
    }
    
    // Mirror based on location and orientation combinations
    const mirrorLocations = [Location.WEST, Location.NORTHWEST, Location.SOUTHWEST];
    const mirrorOrientations = [Orientation.OUT, Orientation.COUNTER];
    
    return mirrorLocations.includes(motionData.startLoc) && 
           mirrorOrientations.includes(motionData.startOri);
  }

  applyBetaPositioning(position: ArrowPosition, motionData: MotionData): ArrowPosition {
    // Apply beta positioning adjustments for dual-arrow scenarios
    const offset = this.calculateBetaOffset(motionData);
    
    return {
      ...position,
      x: position.x + offset.x,
      y: position.y + offset.y
    };
  }

  // ============================================================================
  // COORDINATE CALCULATION METHODS
  // ============================================================================

  private getLocationCoordinates(location: Location): { x: number; y: number } {
    const angleMap: Record<Location, number> = {
      [Location.NORTH]: 270,      // Top
      [Location.NORTHEAST]: 315,  // Top-right
      [Location.EAST]: 0,         // Right
      [Location.SOUTHEAST]: 45,   // Bottom-right
      [Location.SOUTH]: 90,       // Bottom
      [Location.SOUTHWEST]: 135,  // Bottom-left
      [Location.WEST]: 180,       // Left
      [Location.NORTHWEST]: 225   // Top-left
    };
    
    const angle = angleMap[location] || 0;
    const radians = (angle * Math.PI) / 180;
    
    return {
      x: this.CENTER_X + this.HAND_RADIUS * Math.cos(radians),
      y: this.CENTER_Y + this.HAND_RADIUS * Math.sin(radians)
    };
  }

  private calculateRotation(motionData: MotionData): number {
    // Base rotation from start to end location
    const startCoords = this.getLocationCoordinates(motionData.startLoc);
    const endCoords = this.getLocationCoordinates(motionData.endLoc);
    
    const deltaX = endCoords.x - startCoords.x;
    const deltaY = endCoords.y - startCoords.y;
    
    let baseRotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // Apply motion-specific rotation adjustments
    baseRotation += this.getMotionRotationAdjustment(motionData);
    
    // Apply orientation adjustments
    baseRotation += this.getOrientationAdjustment(motionData.startOri, motionData.endOri);
    
    // Apply turns adjustment
    baseRotation += this.getTurnsAdjustment(motionData.turns);
    
    // Normalize to 0-360 range
    return this.normalizeAngle(baseRotation);
  }

  private getMotionRotationAdjustment(motionData: MotionData): number {
    const adjustments: Record<MotionType, number> = {
      [MotionType.STATIC]: 0,
      [MotionType.PRO]: 15,
      [MotionType.ANTI]: -15,
      [MotionType.DASH]: 0,
      [MotionType.FLOAT]: 0
    };
    
    return adjustments[motionData.motionType] || 0;
  }

  private getOrientationAdjustment(startOri: Orientation, endOri: Orientation): number {
    // Calculate rotation adjustment based on orientation change
    const orientationAngles: Record<Orientation, number> = {
      [Orientation.IN]: 0,
      [Orientation.OUT]: 180,
      [Orientation.CLOCK]: 90,
      [Orientation.COUNTER]: 270
    };
    
    const startAngle = orientationAngles[startOri] || 0;
    const endAngle = orientationAngles[endOri] || 0;
    
    return endAngle - startAngle;
  }

  private getTurnsAdjustment(turns: number): number {
    // Each turn adds 360 degrees
    return turns * 360;
  }

  // ============================================================================
  // BETA POSITIONING METHODS
  // ============================================================================

  private shouldApplyBetaPositioning(
    color: string,
    motionData: MotionData,
    pictographData?: PictographData
  ): boolean {
    // Apply beta positioning when there are multiple arrows
    if (!pictographData) return false;
    
    const arrowCount = Object.keys(pictographData.arrows).length;
    return arrowCount > 1 && color === 'red'; // Red arrow gets beta positioning
  }

  private calculateBetaOffset(motionData: MotionData): { x: number; y: number } {
    // Calculate offset for beta positioning based on location
    const offsetMap: Record<Location, { x: number; y: number }> = {
      [Location.NORTH]: { x: 0, y: -this.BETA_OFFSET },
      [Location.NORTHEAST]: { x: this.BETA_OFFSET * 0.7, y: -this.BETA_OFFSET * 0.7 },
      [Location.EAST]: { x: this.BETA_OFFSET, y: 0 },
      [Location.SOUTHEAST]: { x: this.BETA_OFFSET * 0.7, y: this.BETA_OFFSET * 0.7 },
      [Location.SOUTH]: { x: 0, y: this.BETA_OFFSET },
      [Location.SOUTHWEST]: { x: -this.BETA_OFFSET * 0.7, y: this.BETA_OFFSET * 0.7 },
      [Location.WEST]: { x: -this.BETA_OFFSET, y: 0 },
      [Location.NORTHWEST]: { x: -this.BETA_OFFSET * 0.7, y: -this.BETA_OFFSET * 0.7 }
    };
    
    return offsetMap[motionData.startLoc] || { x: 0, y: 0 };
  }

  // ============================================================================
  // MOTION-SPECIFIC ADJUSTMENTS
  // ============================================================================

  private applyMotionAdjustments(
    position: { x: number; y: number },
    motionData: MotionData
  ): { x: number; y: number } {
    switch (motionData.motionType) {
      case MotionType.FLOAT:
        return this.applyFloatAdjustment(position, motionData);
      case MotionType.DASH:
        return this.applyDashAdjustment(position, motionData);
      default:
        return position;
    }
  }

  private applyFloatAdjustment(
    position: { x: number; y: number },
    motionData: MotionData
  ): { x: number; y: number } {
    // Float arrows are positioned between start and end locations
    const startCoords = this.getLocationCoordinates(motionData.startLoc);
    const endCoords = this.getLocationCoordinates(motionData.endLoc);
    
    return {
      x: (startCoords.x + endCoords.x) / 2,
      y: (startCoords.y + endCoords.y) / 2
    };
  }

  private applyDashAdjustment(
    position: { x: number; y: number },
    motionData: MotionData
  ): { x: number; y: number } {
    // Dash arrows may have slight positioning adjustments
    const dashOffset = 5;
    
    return {
      x: position.x + dashOffset,
      y: position.y + dashOffset
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private normalizeAngle(angle: number): number {
    // Normalize angle to 0-360 range
    while (angle < 0) angle += 360;
    while (angle >= 360) angle -= 360;
    return angle;
  }

  private getDefaultPosition(): ArrowPosition {
    return {
      x: this.CENTER_X,
      y: this.CENTER_Y,
      rotation: 0,
      isMirrored: false
    };
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  private isValidLocation(location: Location): boolean {
    return Object.values(Location).includes(location);
  }

  private isValidOrientation(orientation: Orientation): boolean {
    return Object.values(Orientation).includes(orientation);
  }

  private isValidMotionType(motionType: MotionType): boolean {
    return Object.values(MotionType).includes(motionType);
  }

  // ============================================================================
  // DEBUG AND TESTING METHODS
  // ============================================================================

  getPositionDebugInfo(motionData: MotionData): any {
    const basePosition = this.getLocationCoordinates(motionData.startLoc);
    const rotation = this.calculateRotation(motionData);
    
    return {
      startLocation: motionData.startLoc,
      endLocation: motionData.endLoc,
      basePosition,
      rotation,
      motionType: motionData.motionType,
      turns: motionData.turns,
      shouldMirror: this.shouldMirrorArrow(motionData)
    };
  }
}
