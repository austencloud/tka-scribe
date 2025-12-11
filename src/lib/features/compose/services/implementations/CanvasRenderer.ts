/**
 * Canvas Renderer for animation visualization
 * Based on the exact implementation from standalone_animator.html
 */

import { injectable } from "inversify";
import type { PropState } from "../../shared/domain/types/PropState";
import type { ICanvasRenderer } from "../contracts/ICanvasRenderer";

// Constants from standalone_animator.html
// Using "strict" hand point offset (actual hand position, further from center)
// From gridCoordinates.ts: n_diamond_hand_point_strict at (475, 325.0) = 152px from center
const GRID_HALFWAY_POINT_OFFSET = 150;

@injectable()
export class CanvasRenderer implements ICanvasRenderer {
  /**
   * Render the complete animation scene
   * @param bluePropViewBoxDimensions - ViewBox dimensions from the blue prop SVG (default: staff 252.8 x 77.8)
   * @param redPropViewBoxDimensions - ViewBox dimensions from the red prop SVG (default: staff 252.8 x 77.8)
   */
  renderScene(
    ctx: CanvasRenderingContext2D,
    canvasSize: number,
    gridVisible: boolean,
    gridImage: HTMLImageElement | null,
    blueStaffImage: HTMLImageElement | null,
    redStaffImage: HTMLImageElement | null,
    blueProp: PropState | null,
    redProp: PropState | null,
    bluePropViewBoxDimensions: { width: number; height: number } = {
      width: 252.8,
      height: 77.8,
    },
    redPropViewBoxDimensions: { width: number; height: number } = {
      width: 252.8,
      height: 77.8,
    }
  ): void {
    // Rendering logging removed - too noisy, use beat transition logging instead

    // Clear canvas exactly as in standalone
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Draw white background (required for GIF export)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid exactly as in standalone
    this.drawGrid(ctx, canvasSize, gridVisible, gridImage);

    // Draw props with their viewBox dimensions (only if both image and prop state are available)
    if (blueStaffImage && blueProp) {
      this.drawStaff(
        ctx,
        canvasSize,
        blueProp,
        blueStaffImage,
        bluePropViewBoxDimensions
      );
    }

    if (redStaffImage && redProp) {
      this.drawStaff(
        ctx,
        canvasSize,
        redProp,
        redStaffImage,
        redPropViewBoxDimensions
      );
    }
  }

  /**
   * Render a letter glyph onto the canvas at the standard position
   * This is called separately during GIF export to overlay the glyph
   */
  renderLetterToCanvas(
    ctx: CanvasRenderingContext2D,
    canvasSize: number,
    letterImage: HTMLImageElement,
    letterViewBoxDimensions: { width: number; height: number }
  ): void {
    this.drawLetter(ctx, canvasSize, letterImage, letterViewBoxDimensions);
  }

  /**
   * Render a beat number onto the canvas at the standard position (top-left)
   * Matches BeatNumber.svelte positioning: x=50, y=50 in 950px viewBox
   */
  renderBeatNumberToCanvas(
    ctx: CanvasRenderingContext2D,
    canvasSize: number,
    beatNumber: number | null
  ): void {
    this.drawBeatNumber(ctx, canvasSize, beatNumber);
  }

  /**
   * Draw grid exactly as in standalone_animator.html
   */
  private drawGrid(
    ctx: CanvasRenderingContext2D,
    canvasSize: number,
    gridVisible: boolean,
    gridImage: HTMLImageElement | null
  ): void {
    if (!gridVisible || !gridImage) return;
    ctx.drawImage(gridImage, 0, 0, canvasSize, canvasSize);
  }

  /**
   * Draw prop with proper aspect ratio preservation
   * The prop's length (height in viewBox) is constrained to fit between center and outer point,
   * and the width is scaled proportionally to preserve the aspect ratio.
   *
   * For dash motions, uses pre-calculated Cartesian x,y coordinates for straight-line movement.
   * For other motions, calculates position from angle using polar coordinates.
   */
  private drawStaff(
    ctx: CanvasRenderingContext2D,
    canvasSize: number,
    propState: PropState,
    staffImage: HTMLImageElement,
    viewBoxDimensions: { width: number; height: number }
  ): void {

    // Calculate position
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const inwardFactor = 0.95;
    const gridScaleFactor = canvasSize / 950; // 950 is the viewBox size
    const scaledHalfwayRadius = GRID_HALFWAY_POINT_OFFSET * gridScaleFactor;

    // Use pre-calculated x,y if provided (dash motions), otherwise calculate from angle
    let x: number, y: number;
    if (propState.x !== undefined && propState.y !== undefined) {
      // Dash motion: use Cartesian coordinates directly (already in unit circle space)
      x = centerX + propState.x * scaledHalfwayRadius * inwardFactor;
      y = centerY + propState.y * scaledHalfwayRadius * inwardFactor;
    } else {
      // Regular motion: calculate from angle using polar coordinates
      x =
        centerX +
        Math.cos(propState.centerPathAngle) *
          scaledHalfwayRadius *
          inwardFactor;
      y =
        centerY +
        Math.sin(propState.centerPathAngle) *
          scaledHalfwayRadius *
          inwardFactor;
    }

    // Scale the prop dimensions from viewBox coordinate space to canvas pixels
    // This preserves the aspect ratio of the prop
    const propWidth = viewBoxDimensions.width * gridScaleFactor;
    const propHeight = viewBoxDimensions.height * gridScaleFactor;

    // Calculate center point from viewBox dimensions
    const propCenterX = viewBoxDimensions.width / 2;
    const propCenterY = viewBoxDimensions.height / 2;

    // Draw the prop
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(propState.staffRotationAngle);
    ctx.drawImage(
      staffImage,
      -propCenterX * gridScaleFactor,
      -propCenterY * gridScaleFactor,
      propWidth,
      propHeight
    );
    ctx.restore();
  }

  /**
   * Draw letter glyph in the bottom-left area of the canvas
   * Position matches the SVG overlay positioning: x=50, y=800 in 952px viewBox
   */
  private drawLetter(
    ctx: CanvasRenderingContext2D,
    canvasSize: number,
    letterImage: HTMLImageElement,
    letterViewBoxDimensions: { width: number; height: number }
  ): void {

    const gridScaleFactor = canvasSize / 950; // 950 is the viewBox size

    // Position matches TKAGlyph.svelte defaults: x=50, y=800 in 952px viewBox
    const x = 50 * gridScaleFactor;
    const y = 800 * gridScaleFactor;

    // Scale letter to match canvas size relative to 952px viewBox (same as props and grid)
    // All SVGs are designed relative to the 950×950 viewBox, so we use gridScaleFactor consistently
    const scaledWidth = letterViewBoxDimensions.width * gridScaleFactor;
    const scaledHeight = letterViewBoxDimensions.height * gridScaleFactor;

    ctx.drawImage(letterImage, x, y, scaledWidth, scaledHeight);
  }

  /**
   * Draw beat number in the top-left area of the canvas
   * Position matches BeatNumber.svelte: x=50, y=50 in 950px viewBox
   * Style matches: Georgia serif, bold, black fill with white stroke
   */
  private drawBeatNumber(
    ctx: CanvasRenderingContext2D,
    canvasSize: number,
    beatNumber: number | null
  ): void {
    if (beatNumber === null) return;

    const gridScaleFactor = canvasSize / 950;

    // Position matches BeatNumber.svelte: x=50, y=50 in 950px viewBox
    const x = 50 * gridScaleFactor;
    const y = 50 * gridScaleFactor;

    // Font size matches BeatNumber.svelte: 100 for numbers, 80 for "Start"
    const isStart = beatNumber === 0;
    const fontSize = (isStart ? 80 : 100) * gridScaleFactor;
    const strokeWidth = (isStart ? 5 : 6) * gridScaleFactor;
    const displayText = isStart ? "Start" : beatNumber.toString();

    ctx.save();

    // Set font style to match BeatNumber.svelte
    ctx.font = `bold ${fontSize}px Georgia, serif`;
    ctx.textBaseline = "hanging";
    ctx.textAlign = "start";

    // Draw stroke first (white outline)
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = "round";
    ctx.strokeText(displayText, x, y);

    // Draw fill (black text)
    ctx.fillStyle = "#000000";
    ctx.fillText(displayText, x, y);

    ctx.restore();
  }
}
