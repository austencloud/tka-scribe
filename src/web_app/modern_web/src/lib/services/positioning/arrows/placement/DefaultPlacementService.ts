/**
 * Default Placement Service for Modern Arrow Positioning
 * 
 * This service provides default placement calculations when special placement is not available.
 * It implements the fallback positioning logic for arrows that don't have specific placement rules.
 * 
 * Part of the microservices architecture replacing the monolithic ArrowPositioningService.
 */

import type { MotionData, PictographData } from '$lib/domain';
import type { IDefaultPlacementService } from '../../interfaces';

// Define Point interface locally
interface Point {
	x: number;
	y: number;
}

export class DefaultPlacementService implements IDefaultPlacementService {
	/**
	 * Calculate default placement adjustment for arrow positioning.
	 * 
	 * This provides basic positioning logic when special placement rules
	 * are not available or don't apply to the current configuration.
	 * 
	 * @param motionData Motion data containing motion information
	 * @param pictographData Pictograph data containing letter and context
	 * @param arrowColor Color of the arrow ('red' or 'blue')
	 * @returns Point with default adjustment coordinates
	 */
	getDefaultAdjustment(
		motionData: MotionData,
		pictographData: PictographData,
		arrowColor: string
	): Point {
		// Basic default placement logic
		// This would be enhanced based on actual placement requirements
		
		try {
			// Get basic attributes
			const motionType = motionData.motion_type || '';
			const letter = pictographData.letter || '';
			const startOri = motionData.start_ori || '';

			// Apply basic positioning rules based on motion type and orientation
			let x = 0;
			let y = 0;

			// Basic orientation-based positioning
			switch (startOri) {
				case 'in':
					x = arrowColor === 'blue' ? -10 : 10;
					y = 0;
					break;
				case 'out':
					x = arrowColor === 'blue' ? 10 : -10;
					y = 0;
					break;
				case 'clock':
					x = 0;
					y = arrowColor === 'blue' ? -10 : 10;
					break;
				case 'counter':
					x = 0;
					y = arrowColor === 'blue' ? 10 : -10;
					break;
				default:
					x = 0;
					y = 0;
			}

			// Motion type adjustments
			switch (motionType) {
				case 'pro':
					// Positive motion adjustments
					break;
				case 'anti':
					// Negative motion adjustments
					x = -x;
					y = -y;
					break;
				case 'static':
					// Static motion - minimal adjustment
					x *= 0.5;
					y *= 0.5;
					break;
				case 'dash':
					// Dash motion adjustments
					break;
				default:
					// Default motion handling
					break;
			}

			// Letter-specific fine-tuning could be added here
			// This would be based on actual placement requirements

			console.debug(`Default placement for ${arrowColor} ${motionType} from ${startOri}: (${x}, ${y})`);
			
			return { x, y };

		} catch (error) {
			console.error('Error calculating default placement:', error);
			// Return neutral position on error
			return { x: 0, y: 0 };
		}
	}

	/**
	 * Check if default placement should be applied.
	 * 
	 * @param motionData Motion data to check
	 * @param pictographData Pictograph data to check
	 * @returns True if default placement should be used
	 */
	shouldApplyDefault(motionData: MotionData, pictographData: PictographData): boolean {
		// Default placement applies when we have valid motion data
		return !!(motionData && pictographData.letter);
	}
}
