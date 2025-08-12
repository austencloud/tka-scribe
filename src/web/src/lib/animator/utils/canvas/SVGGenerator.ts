/**
 * SVG Generator for creating prop staff images
 * Generates blue and red staff SVGs for animation rendering
 */

import { PROP_COLORS, ANIMATION_CONSTANTS } from '../../constants/index.js';

export class SVGGenerator {
	/**
	 * Generate blue staff SVG
	 */
	static generateBlueStaffSvg(): string {
		const { STAFF_VIEWBOX_WIDTH, STAFF_VIEWBOX_HEIGHT, STAFF_CENTER_X, STAFF_CENTER_Y } =
			ANIMATION_CONSTANTS;

		return `
			<svg viewBox="0 0 ${STAFF_VIEWBOX_WIDTH} ${STAFF_VIEWBOX_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<style>
						.staff-blue { fill: ${PROP_COLORS.BLUE}; stroke: #000; stroke-width: 2; }
						.center-dot { fill: #fff; stroke: #000; stroke-width: 1; }
					</style>
				</defs>
				<g transform="translate(${STAFF_CENTER_X}, ${STAFF_CENTER_Y})">
					<!-- Staff body -->
					<rect x="-40" y="-10" width="80" height="20" rx="2" class="staff-blue"/>
					<!-- Center dot -->
					<circle cx="0" cy="0" r="4" class="center-dot"/>
				</g>
			</svg>
		`.trim();
	}

	/**
	 * Generate red staff SVG
	 */
	static generateRedStaffSvg(): string {
		const { STAFF_VIEWBOX_WIDTH, STAFF_VIEWBOX_HEIGHT, STAFF_CENTER_X, STAFF_CENTER_Y } =
			ANIMATION_CONSTANTS;

		return `
			<svg viewBox="0 0 ${STAFF_VIEWBOX_WIDTH} ${STAFF_VIEWBOX_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<style>
						.staff-red { fill: ${PROP_COLORS.RED}; stroke: #000; stroke-width: 2; }
						.center-dot { fill: #fff; stroke: #000; stroke-width: 1; }
					</style>
				</defs>
				<g transform="translate(${STAFF_CENTER_X}, ${STAFF_CENTER_Y})">
					<!-- Staff body -->
					<rect x="-40" y="-10" width="80" height="20" rx="2" class="staff-red"/>
					<!-- Center dot -->
					<circle cx="0" cy="0" r="4" class="center-dot"/>
				</g>
			</svg>
		`.trim();
	}

	/**
	 * Generate grid SVG
	 */
	static generateGridSvg(width: number, height: number): string {
		const { GRID_VIEWBOX_SIZE, GRID_CENTER } = ANIMATION_CONSTANTS;
		const scale = Math.min(width, height) / GRID_VIEWBOX_SIZE;

		return `
			<svg viewBox="0 0 ${GRID_VIEWBOX_SIZE} ${GRID_VIEWBOX_SIZE}" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<style>
						.grid-line { stroke: #ddd; stroke-width: 1; fill: none; }
						.grid-label { font-family: sans-serif; font-size: 14px; fill: #666; text-anchor: middle; }
						.grid-center { stroke: #999; stroke-width: 2; fill: none; }
					</style>
				</defs>
				
				<!-- Outer diamond -->
				<path d="M ${GRID_CENTER} 50 L ${GRID_VIEWBOX_SIZE - 50} ${GRID_CENTER} L ${GRID_CENTER} ${GRID_VIEWBOX_SIZE - 50} L 50 ${GRID_CENTER} Z" class="grid-line"/>
				
				<!-- Inner diamond -->
				<path d="M ${GRID_CENTER} 200 L ${GRID_VIEWBOX_SIZE - 200} ${GRID_CENTER} L ${GRID_CENTER} ${GRID_VIEWBOX_SIZE - 200} L 200 ${GRID_CENTER} Z" class="grid-line"/>
				
				<!-- Center lines -->
				<line x1="${GRID_CENTER}" y1="0" x2="${GRID_CENTER}" y2="${GRID_VIEWBOX_SIZE}" class="grid-center"/>
				<line x1="0" y1="${GRID_CENTER}" x2="${GRID_VIEWBOX_SIZE}" y2="${GRID_CENTER}" class="grid-center"/>
				
				<!-- Position labels -->
				<text x="${GRID_CENTER}" y="40" class="grid-label">N</text>
				<text x="${GRID_VIEWBOX_SIZE - 40}" y="${GRID_CENTER + 5}" class="grid-label">E</text>
				<text x="${GRID_CENTER}" y="${GRID_VIEWBOX_SIZE - 25}" class="grid-label">S</text>
				<text x="40" y="${GRID_CENTER + 5}" class="grid-label">W</text>
			</svg>
		`.trim();
	}
}
