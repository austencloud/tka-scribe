// src/lib/components/objects/Arrow/services/ArrowSvgLoader.ts
import type { Color, MotionType, Orientation, TKATurns } from '$lib/types/Types';
import type { ArrowSvgData } from '$lib/components/SvgManager/ArrowSvgData';
import { parseArrowSvg } from '$lib/components/SvgManager/parseArrowSvg';
import type SvgManager from '$lib/components/SvgManager/SvgManager';

/**
 * Service for loading and managing Arrow SVG data
 */
export class ArrowSvgLoader {
	constructor(private svgManager: SvgManager) {}

	/**
	 * Loads an arrow SVG based on motion properties
	 */
	async loadSvg(
		motionType: MotionType,
		startOri: Orientation,
		turns: TKATurns,
		color: Color,
		mirrored: boolean = false
	): Promise<{ svgData: ArrowSvgData }> {
		// Fetch SVG from manager
		const svgText = await this.svgManager.getArrowSvg(motionType, startOri, turns, color);

		// Validate SVG content
		if (!svgText?.includes('<svg')) {
			throw new Error('Invalid SVG content: Missing <svg> element');
		}

		// Parse SVG data
		const originalSvgData = parseArrowSvg(svgText);

		// Adjust center point if mirrored
		const center = { ...originalSvgData.center };
		if (mirrored) {
			center.x = originalSvgData.viewBox.width - center.x;
		}

		// Create and return SVG data object
		return {
			svgData: {
				imageSrc: `data:image/svg+xml;base64,${btoa(svgText)}`,
				viewBox: originalSvgData.viewBox,
				center
			}
		};
	}

	/**
	 * Returns fallback SVG data for error situations
	 */
	getFallbackSvgData(): ArrowSvgData {
		return {
			imageSrc:
				'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIgLz48dGV4dCB4PSIyMCIgeT0iNTAiIGZpbGw9IiNmMDAiPkVycm9yPC90ZXh0Pjwvc3ZnPg==',
			viewBox: { x: 0, y: 0, width: 100, height: 100 },
			center: { x: 50, y: 50 }
		};
	}
}
