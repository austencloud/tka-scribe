/**
 * 🎪 PROP POSITIONING SERVICE
 * 
 * Enterprise-grade prop positioning service with sophisticated calculation algorithms.
 * Based on modern desktop app prop positioning patterns.
 * 
 * Source: src/desktop/modern/src/application/services/core/prop_positioning_service.py
 */

import type { 
  IPropPositioningService,
  PropPosition,
  Location,
  Orientation,
  MotionType,
  MotionData
} from '../interfaces/IPictographRenderer.js';

// ============================================================================
// PROP POSITIONING SERVICE IMPLEMENTATION
// ============================================================================

export class PropPositioningService implements IPropPositioningService {
  private readonly CENTER_X = 475;
  private readonly CENTER_Y = 475;
  private readonly HAND_RADIUS = 143.1;
  private readonly PROP_OFFSET = 20; // Distance from hand point

  // ============================================================================
  // MAIN POSITIONING METHODS
  // ============================================================================

  calculatePropPosition(motionData: MotionData): PropPosition {
    try {
      // Get hand point coordinates
      const handPoint = this.getHandPointCoordinates(motionData.startLoc);
      
      // Calculate prop rotation
      const rotation = this.calculatePropRotation(motionData, motionData.startOri);
      
      // Apply prop-specific positioning offset
      const propPosition = this.applyPropOffset(handPoint, rotation, motionData);
      
      return {
        x: propPosition.x,
        y: propPosition.y,
        rotation,
        handPointX: handPoint.x,
        handPointY: handPoint.y
      };
      
    } catch (error) {
      console.error('Error calculating prop position:', error);
      return this.getDefaultPosition();
    }
  }

  calculatePropRotation(motionData: MotionData, startOrientation: Orientation): number {
    // Base rotation from motion direction
    let baseRotation = this.getMotionDirectionAngle(motionData);
    
    // Apply orientation adjustment
    baseRotation += this.getOrientationRotation(startOrientation);
    
    // Apply motion-specific rotation
    baseRotation += this.getMotionTypeRotation(motionData.motionType);
    
    // Apply prop rotation direction if specified
    if (motionData.propRotDir) {
      baseRotation += this.getPropRotationDirectionAdjustment(motionData.propRotDir);
    }
    
    // Apply turns
    baseRotation += this.getTurnsRotation(motionData.turns);
    
    // Normalize to 0-360 range
    return this.normalizeAngle(baseRotation);
  }

  getHandPointCoordinates(location: Location): { x: number; y: number } {
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

  // ============================================================================
  // ROTATION CALCULATION METHODS
  // ============================================================================

  private getMotionDirectionAngle(motionData: MotionData): number {
    // Calculate angle from start to end location
    const startCoords = this.getHandPointCoordinates(motionData.startLoc);
    const endCoords = this.getHandPointCoordinates(motionData.endLoc);
    
    const deltaX = endCoords.x - startCoords.x;
    const deltaY = endCoords.y - startCoords.y;
    
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  }

  private getOrientationRotation(orientation: Orientation): number {
    const orientationAngles: Record<Orientation, number> = {
      [Orientation.IN]: 0,
      [Orientation.OUT]: 180,
      [Orientation.CLOCK]: 90,
      [Orientation.COUNTER]: 270
    };
    
    return orientationAngles[orientation] || 0;
  }

  private getMotionTypeRotation(motionType: MotionType): number {
    const motionAdjustments: Record<MotionType, number> = {
      [MotionType.STATIC]: 0,
      [MotionType.PRO]: 30,
      [MotionType.ANTI]: -30,
      [MotionType.DASH]: 0,
      [MotionType.FLOAT]: 45
    };
    
    return motionAdjustments[motionType] || 0;
  }

  private getPropRotationDirectionAdjustment(propRotDir: string): number {
    // Apply rotation based on prop rotation direction
    switch (propRotDir.toLowerCase()) {
      case 'cw':
      case 'clockwise':
        return 90;
      case 'ccw':
      case 'counterclockwise':
        return -90;
      case 'none':
      case 'static':
        return 0;
      default:
        return 0;
    }
  }

  private getTurnsRotation(turns: number): number {
    // Each turn adds 360 degrees to prop rotation
    return turns * 360;
  }

  // ============================================================================
  // POSITIONING OFFSET METHODS
  // ============================================================================

  private applyPropOffset(
    handPoint: { x: number; y: number },
    rotation: number,
    motionData: MotionData
  ): { x: number; y: number } {
    // Calculate offset based on prop type and motion
    const offset = this.calculatePropOffset(motionData);
    
    // Apply offset in the direction of rotation
    const radians = (rotation * Math.PI) / 180;
    
    return {
      x: handPoint.x + offset * Math.cos(radians),
      y: handPoint.y + offset * Math.sin(radians)
    };
  }

  private calculatePropOffset(motionData: MotionData): number {
    // Different motion types may require different offsets
    const offsetMap: Record<MotionType, number> = {
      [MotionType.STATIC]: this.PROP_OFFSET,
      [MotionType.PRO]: this.PROP_OFFSET * 1.2,
      [MotionType.ANTI]: this.PROP_OFFSET * 1.2,
      [MotionType.DASH]: this.PROP_OFFSET * 0.8,
      [MotionType.FLOAT]: this.PROP_OFFSET * 1.5
    };
    
    return offsetMap[motionData.motionType] || this.PROP_OFFSET;
  }

  // ============================================================================
  // SPECIAL POSITIONING CASES
  // ============================================================================

  private applySpecialPositioning(
    position: PropPosition,
    motionData: MotionData
  ): PropPosition {
    // Apply special positioning for specific motion combinations
    if (this.isFloatMotion(motionData)) {
      return this.applyFloatPositioning(position, motionData);
    }
    
    if (this.isDashMotion(motionData)) {
      return this.applyDashPositioning(position, motionData);
    }
    
    if (this.isStaticMotion(motionData)) {
      return this.applyStaticPositioning(position, motionData);
    }
    
    return position;
  }

  private isFloatMotion(motionData: MotionData): boolean {
    return motionData.motionType === MotionType.FLOAT;
  }

  private isDashMotion(motionData: MotionData): boolean {
    return motionData.motionType === MotionType.DASH;
  }

  private isStaticMotion(motionData: MotionData): boolean {
    return motionData.motionType === MotionType.STATIC;
  }

  private applyFloatPositioning(
    position: PropPosition,
    motionData: MotionData
  ): PropPosition {
    // Float props are positioned between start and end points
    const startPoint = this.getHandPointCoordinates(motionData.startLoc);
    const endPoint = this.getHandPointCoordinates(motionData.endLoc);
    
    return {
      ...position,
      x: (startPoint.x + endPoint.x) / 2,
      y: (startPoint.y + endPoint.y) / 2
    };
  }

  private applyDashPositioning(
    position: PropPosition,
    motionData: MotionData
  ): PropPosition {
    // Dash props may have slight positioning adjustments
    const dashOffset = 10;
    
    return {
      ...position,
      x: position.x + dashOffset,
      y: position.y + dashOffset
    };
  }

  private applyStaticPositioning(
    position: PropPosition,
    motionData: MotionData
  ): PropPosition {
    // Static props are positioned directly at hand points
    const handPoint = this.getHandPointCoordinates(motionData.startLoc);
    
    return {
      ...position,
      x: handPoint.x,
      y: handPoint.y
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

  private getDefaultPosition(): PropPosition {
    return {
      x: this.CENTER_X,
      y: this.CENTER_Y,
      rotation: 0,
      handPointX: this.CENTER_X,
      handPointY: this.CENTER_Y
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
    const handPoint = this.getHandPointCoordinates(motionData.startLoc);
    const rotation = this.calculatePropRotation(motionData, motionData.startOri);
    const position = this.calculatePropPosition(motionData);
    
    return {
      startLocation: motionData.startLoc,
      endLocation: motionData.endLoc,
      handPoint,
      rotation,
      finalPosition: position,
      motionType: motionData.motionType,
      turns: motionData.turns,
      propRotDir: motionData.propRotDir
    };
  }
}
