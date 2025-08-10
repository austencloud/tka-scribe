/**
 * Arrow Location Calculator
 *
 * Calculates where arrows should be positioned on the pictograph based on motion data.
 * Uses different calculation strategies for different motion types.
 * Follows the legacy desktop pattern with separate calculator classes.
 */

import type { MotionData, PictographData } from '$lib/domain';
import type { IArrowLocationCalculator, Location } from '../../interfaces';
import { DashLocationCalculator } from './DashLocationCalculator';
import { ShiftLocationCalculator } from './ShiftLocationCalculator';
import { StaticLocationCalculator } from './StaticLocationCalculator';

export class ArrowLocationCalculator implements IArrowLocationCalculator {
	private shiftCalculator = new ShiftLocationCalculator();
	private staticCalculator = new StaticLocationCalculator();
	private dashCalculator = new DashLocationCalculator();

	calculateLocation(motion: MotionData, _pictographData?: PictographData): Location {
		const motionType = motion.motion_type?.toLowerCase();

		switch (motionType) {
			case 'pro':
			case 'anti':
			case 'float':
				return this.shiftCalculator.calculateLocation(motion);

			case 'static':
				return this.staticCalculator.calculateLocation(motion);

			case 'dash':
				return this.dashCalculator.calculateLocation(motion);

			default:
				console.warn(`Unknown motion type: ${motionType}, defaulting to static`);
				return this.staticCalculator.calculateLocation(motion);
		}
	}
}
