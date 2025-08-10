/**
 * Arrow Positioning Service
 *
 * Integrates the new microservices-based arrow positioning architecture.
 * This is a simplified integration that uses our new services directly.
 */

import type { MotionData, PictographData } from '$lib/domain';
import type { GridMode, MotionType } from '$lib/services/interfaces';
import { DefaultPlacementService } from '$lib/services/positioning/arrows/placement/DefaultPlacementService';
import { SpecialPlacementService } from '$lib/services/positioning/arrows/placement/SpecialPlacementService';

export interface ArrowPositioningInput {
	arrow_type: 'blue' | 'red';
	motion_type: string;
	location: string;
	grid_mode: string;
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
	private specialPlacementService: SpecialPlacementService;
	private defaultPlacementService: DefaultPlacementService;

	constructor() {
		this.specialPlacementService = new SpecialPlacementService();
		this.defaultPlacementService = new DefaultPlacementService();
	}

	/**
	 * Calculate the final position for an arrow using our new microservices
	 */
	async calculatePosition(input: ArrowPositioningInput): Promise<Position> {
		console.log('🎯 ArrowPositioningService.calculatePosition() called with:', input);

		try {
			// Step 1: Get initial position based on location and grid
			const initialPosition = this.getInitialPosition(input);

			// Step 2: Try special placement first
			const motionData: MotionData = {
				motion_type: input.motion_type,
				start_ori: input.start_orientation || 'in',
				end_ori: input.end_orientation || 'in',
				prop_rot_dir: 'cw',
				turns: input.turns,
			} as MotionData;

			const pictographData: PictographData = {
				letter: input.letter || 'A',
				grid_mode: input.grid_mode,
				motions: {
					[input.arrow_type]: motionData,
				},
			} as PictographData;

			let specialAdjustment = { x: 0, y: 0 };
			try {
				const result = await this.specialPlacementService.getSpecialAdjustment(
					motionData,
					pictographData
				);
				if (result) {
					specialAdjustment = result;
					console.log(
						`Special placement found: (${specialAdjustment.x}, ${specialAdjustment.y})`
					);
				}
			} catch {
				console.log('No special placement found, using default');
			}

			// Step 3: Get default adjustment if no special placement
			let defaultAdjustment = { x: 0, y: 0 };
			if (specialAdjustment.x === 0 && specialAdjustment.y === 0) {
				try {
					// Generate placement key (simplified)
					const placementKey = `${input.location}_${input.motion_type}`;
					defaultAdjustment = await this.defaultPlacementService.getDefaultAdjustment(
						placementKey,
						input.turns,
						input.motion_type as MotionType,
						input.grid_mode as GridMode
					);
					console.log(
						`Default placement: (${defaultAdjustment.x}, ${defaultAdjustment.y})`
					);
				} catch (error) {
					console.warn('Default placement failed:', error);
				}
			}

			// Step 4: Combine all adjustments
			const finalX = initialPosition.x + specialAdjustment.x + defaultAdjustment.x;
			const finalY = initialPosition.y + specialAdjustment.y + defaultAdjustment.y;

			console.log(
				`${input.arrow_type} ${input.motion_type} at ${input.location}: (${finalX}, ${finalY})`
			);

			return { x: finalX, y: finalY };
		} catch (error) {
			console.error('Arrow positioning failed:', error);
			// Fallback to center position
			return { x: 475, y: 475 };
		}
	}

	/**
	 * Get initial position based on motion type and location
	 */
	private getInitialPosition(input: ArrowPositioningInput): Position {
		const { motion_type, location, grid_mode } = input;

		// For PRO/ANTI/FLOAT - use shift coordinates (layer2 points)
		if (['pro', 'anti', 'float'].includes(motion_type)) {
			return this.getShiftCoordinates(location, grid_mode);
		}

		// For STATIC/DASH - use hand points
		if (['static', 'dash'].includes(motion_type)) {
			return this.getHandCoordinates(location, grid_mode);
		}

		// Default to center
		return { x: 475, y: 475 };
	}

	/**
	 * Get shift coordinates for PRO/ANTI/FLOAT motions
	 */
	private getShiftCoordinates(location: string, grid_mode: string): Position {
		const diamondLayer2Points: Record<string, Position> = {
			n: { x: 475, y: 200 },
			ne: { x: 625, y: 275 },
			e: { x: 700, y: 475 },
			se: { x: 625, y: 675 },
			s: { x: 475, y: 750 },
			sw: { x: 325, y: 675 },
			w: { x: 250, y: 475 },
			nw: { x: 325, y: 275 },
		};

		const boxLayer2Points: Record<string, Position> = {
			n: { x: 475, y: 225 },
			ne: { x: 600, y: 300 },
			e: { x: 675, y: 475 },
			se: { x: 600, y: 650 },
			s: { x: 475, y: 725 },
			sw: { x: 350, y: 650 },
			w: { x: 275, y: 475 },
			nw: { x: 350, y: 300 },
		};

		const points = grid_mode === 'box' ? boxLayer2Points : diamondLayer2Points;
		return points[location] || { x: 475, y: 475 };
	}

	/**
	 * Get hand coordinates for STATIC/DASH motions
	 */
	private getHandCoordinates(location: string, grid_mode: string): Position {
		const diamondHandPoints: Record<string, Position> = {
			n: { x: 475, y: 175 },
			ne: { x: 650, y: 250 },
			e: { x: 725, y: 475 },
			se: { x: 650, y: 700 },
			s: { x: 475, y: 775 },
			sw: { x: 300, y: 700 },
			w: { x: 225, y: 475 },
			nw: { x: 300, y: 250 },
		};

		const boxHandPoints: Record<string, Position> = {
			n: { x: 475, y: 200 },
			ne: { x: 625, y: 275 },
			e: { x: 700, y: 475 },
			se: { x: 625, y: 675 },
			s: { x: 475, y: 750 },
			sw: { x: 325, y: 675 },
			w: { x: 250, y: 475 },
			nw: { x: 325, y: 275 },
		};

		const points = grid_mode === 'box' ? boxHandPoints : diamondHandPoints;
		return points[location] || { x: 475, y: 475 };
	}
}

// Export a singleton instance for use in components
export const arrowPositioningService = new ArrowPositioningService();
