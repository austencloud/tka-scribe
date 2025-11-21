/**
 * PixiJS Prop Renderer
 *
 * Handles prop positioning and rendering:
 * - Position calculation (Cartesian and angular)
 * - Prop scaling based on canvas size
 * - Coordinate transformations
 * - Grid-relative positioning
 *
 * Single Responsibility: Prop positioning logic
 */

import type { Sprite,Texture } from "pixi.js";

import type { PropState } from "../../../domain/types/PropState";

// Constants matching AnimatorCanvas EXACTLY (strict hand points for animation mode)
const VIEWBOX_SIZE = 950;
const GRID_HALFWAY_POINT_OFFSET = 150; // Strict hand points (animation mode)
const INWARD_FACTOR = 1.0; // No inward adjustment - use exact grid coordinates

export class PixiPropRenderer {
  private currentSize: number;

  constructor(currentSize: number) {
    this.currentSize = currentSize;
  }

  /**
   * Calculate prop position and dimensions
   * Matches CanvasRenderer logic for consistency
   */
  calculatePropTransform(
    propState: PropState,
    propDimensions: { width: number; height: number }
  ): {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  } {
    // Calculate position (matching CanvasRenderer logic)
    const centerX = this.currentSize / 2;
    const centerY = this.currentSize / 2;
    const gridScaleFactor = this.currentSize / VIEWBOX_SIZE;
    const scaledHalfwayRadius = GRID_HALFWAY_POINT_OFFSET * gridScaleFactor;

    let x: number, y: number;

    if (propState.x !== undefined && propState.y !== undefined) {
      // Dash motion: use Cartesian coordinates
      x = centerX + propState.x * scaledHalfwayRadius * INWARD_FACTOR;
      y = centerY + propState.y * scaledHalfwayRadius * INWARD_FACTOR;
    } else {
      // Regular motion: calculate from angle
      x =
        centerX +
        Math.cos(propState.centerPathAngle) *
          scaledHalfwayRadius *
          INWARD_FACTOR;
      y =
        centerY +
        Math.sin(propState.centerPathAngle) *
          scaledHalfwayRadius *
          INWARD_FACTOR;
    }

    // Scale prop dimensions
    const propWidth = propDimensions.width * gridScaleFactor;
    const propHeight = propDimensions.height * gridScaleFactor;

    return {
      x,
      y,
      width: propWidth,
      height: propHeight,
      rotation: propState.staffRotationAngle,
    };
  }

  /**
   * Apply calculated transform to sprite
   */
  applyTransformToSprite(
    sprite: Sprite,
    texture: Texture,
    transform: {
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
    }
  ): void {
    sprite.texture = texture;
    sprite.visible = true;
    sprite.width = transform.width;
    sprite.height = transform.height;
    sprite.anchor.set(0.5, 0.5); // Center anchor point
    sprite.position.set(transform.x, transform.y);
    sprite.rotation = transform.rotation;
  }

  /**
   * Update canvas size for position calculations
   */
  updateSize(newSize: number): void {
    this.currentSize = newSize;
  }
}
