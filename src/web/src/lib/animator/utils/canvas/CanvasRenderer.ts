/**
 * Canvas Renderer for animation visualization
 * Handles rendering of grid, props, and animation frames
 */

import type { PropState } from '../../types/core.js';
import { ANIMATION_CONSTANTS, CANVAS_COLORS } from '../../constants/index.js';

export class CanvasRenderer {
	/**
	 * Render the complete animation scene
	 */
	static renderScene(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		gridVisible: boolean,
		gridImage: HTMLImageElement | null,
		blueStaffImage: HTMLImageElement | null,
		redStaffImage: HTMLImageElement | null,
		blueProp: PropState,
		redProp: PropState
	): void {
		// Clear canvas
		ctx.clearRect(0, 0, width, height);
		ctx.fillStyle = CANVAS_COLORS.BACKGROUND;
		ctx.fillRect(0, 0, width, height);

		// Save context state
		ctx.save();

		// Set up coordinate system (center origin)
		ctx.translate(width / 2, height / 2);
		const scale = Math.min(width, height) / ANIMATION_CONSTANTS.GRID_VIEWBOX_SIZE;
		ctx.scale(scale, scale);
		ctx.translate(-ANIMATION_CONSTANTS.GRID_CENTER, -ANIMATION_CONSTANTS.GRID_CENTER);

		// Render grid if visible and available
		if (gridVisible && gridImage) {
			ctx.drawImage(gridImage, 0, 0, ANIMATION_CONSTANTS.GRID_VIEWBOX_SIZE, ANIMATION_CONSTANTS.GRID_VIEWBOX_SIZE);
		}

		// Render props
		if (blueStaffImage) {
			this.renderProp(ctx, blueStaffImage, blueProp);
		}

		if (redStaffImage) {
			this.renderProp(ctx, redStaffImage, redProp);
		}

		// Restore context state
		ctx.restore();
	}

	/**
	 * Render a single prop (staff) at the given state
	 */
	private static renderProp(
		ctx: CanvasRenderingContext2D,
		staffImage: HTMLImageElement,
		propState: PropState
	): void {
		ctx.save();

		// Move to prop position
		ctx.translate(propState.x, propState.y);

		// Rotate staff
		ctx.rotate(propState.staffRotationAngle);

		// Scale staff
		const scale = ANIMATION_CONSTANTS.DEFAULT_PROP_SCALE;
		ctx.scale(scale, scale);

		// Draw staff centered
		const drawWidth = ANIMATION_CONSTANTS.STAFF_VIEWBOX_WIDTH;
		const drawHeight = ANIMATION_CONSTANTS.STAFF_VIEWBOX_HEIGHT;
		
		ctx.drawImage(
			staffImage,
			-drawWidth / 2,
			-drawHeight / 2,
			drawWidth,
			drawHeight
		);

		ctx.restore();
	}

	/**
	 * Render debug information (optional)
	 */
	static renderDebugInfo(
		ctx: CanvasRenderingContext2D,
		width: number,
		height: number,
		blueProp: PropState,
		redProp: PropState
	): void {
		ctx.save();
		ctx.fillStyle = CANVAS_COLORS.LABELS;
		ctx.font = '12px sans-serif';
		
		// Blue prop info
		ctx.fillText(`Blue: (${blueProp.x.toFixed(1)}, ${blueProp.y.toFixed(1)})`, 10, 20);
		ctx.fillText(`Angle: ${(blueProp.centerPathAngle * 180 / Math.PI).toFixed(1)}°`, 10, 35);
		ctx.fillText(`Staff: ${(blueProp.staffRotationAngle * 180 / Math.PI).toFixed(1)}°`, 10, 50);
		
		// Red prop info
		ctx.fillText(`Red: (${redProp.x.toFixed(1)}, ${redProp.y.toFixed(1)})`, 10, 80);
		ctx.fillText(`Angle: ${(redProp.centerPathAngle * 180 / Math.PI).toFixed(1)}°`, 10, 95);
		ctx.fillText(`Staff: ${(redProp.staffRotationAngle * 180 / Math.PI).toFixed(1)}°`, 10, 110);
		
		ctx.restore();
	}
}
