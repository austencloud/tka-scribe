/**
 * Dash Location Calculator
 *
 * Handles location calculation for dash motions.
 * Based on the legacy desktop DashLocationCalculator.
 */

import type { MotionData } from '$lib/domain';

export class DashLocationCalculator {
	calculateLocation(motion: MotionData): string {
		// Dash motions use similar logic to shift motions
		// but may have specific positioning rules
		const startLoc = motion.start_loc?.toLowerCase();
		const endLoc = motion.end_loc?.toLowerCase();

		if (!startLoc || !endLoc) {
			console.warn('Missing start_loc or end_loc for dash motion');
			return 'center';
		}

		// For dash motions, typically position at the midpoint
		// or use direction-based positioning similar to shift
		const directionPairs: Record<string, string> = {
			// North-East combinations
			'n-e': 'ne',
			'e-n': 'ne',

			// East-South combinations
			'e-s': 'se',
			's-e': 'se',

			// South-West combinations
			's-w': 'sw',
			'w-s': 'sw',

			// West-North combinations
			'w-n': 'nw',
			'n-w': 'nw',

			// Cardinal to cardinal - dash motions may use midpoint
			'n-s': 'center',
			's-n': 'center',
			'e-w': 'center',
			'w-e': 'center',
		};

		const pairKey = `${startLoc}-${endLoc}`;
		const location = directionPairs[pairKey];

		if (!location) {
			console.warn(`Unknown dash direction pair: ${startLoc} -> ${endLoc}`);
			return 'center';
		}

		return location;
	}
}
