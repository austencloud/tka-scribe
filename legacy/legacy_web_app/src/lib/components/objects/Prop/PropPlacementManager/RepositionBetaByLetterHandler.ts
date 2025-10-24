import { BetaPropDirectionCalculator } from './BetaPropDirectionCalculator';
import type { PictographData } from '$lib/types/PictographData';
import type { PropData } from '$lib/components/objects/Prop/PropData';
import type { Direction } from '$lib/types/Types';
import type { MotionData } from '$lib/components/objects/Motion/MotionData';

export default class RepositionBetaByLetterHandler {
	private pictographData: PictographData;
	private directionCalculator: BetaPropDirectionCalculator;
	private offsetCalculator: any; // Would need proper type

	constructor(directionCalculator: BetaPropDirectionCalculator, pictographData: PictographData) {
		this.pictographData = pictographData;
		this.directionCalculator = directionCalculator;
		// Initialize with a simple offset calculator if needed
		this.offsetCalculator = {
			calculateNewPositionWithOffset: (coords: { x: number; y: number }, direction: string) => {
				const offset = 25; // Example offset
				const movementMap: Record<string, { x: number; y: number }> = {
					up: { x: 0, y: -offset },
					down: { x: 0, y: offset },
					left: { x: -offset, y: 0 },
					right: { x: offset, y: 0 },
					upright: { x: offset, y: -offset },
					upleft: { x: -offset, y: -offset },
					downright: { x: offset, y: offset },
					downleft: { x: -offset, y: offset }
				};
				const movement = movementMap[direction] || { x: 0, y: 0 };
				return {
					x: coords.x + movement.x,
					y: coords.y + movement.y
				};
			}
		};
	}

	reposition_G_H(): void {
		const redMotion = this.pictographData.redMotionData;
		const redPropData = this.pictographData.redPropData;
		const bluePropData = this.pictographData.bluePropData;

		if (!redMotion || !redPropData || !bluePropData) return;

		// Get the direction from red motion (not red prop)
		const furtherDirection = this.directionCalculator.getDirectionFromMotion(redMotion);

		if (!furtherDirection) return;

		// Get the opposite direction
		const otherDirection = this.directionCalculator.getOppositeDirection(furtherDirection);

		// Move the props in opposite directions (red in the calculated direction, blue in the opposite)
		this.moveProp(redPropData, furtherDirection);
		this.moveProp(bluePropData, otherDirection);
	}

	// Other methods remain the same...

	private moveProp(prop: PropData, direction: Direction): void {
		// Use offset calculator to determine new position
		const newPosition = this.offsetCalculator.calculateNewPositionWithOffset(
			prop.coords,
			direction
		);
		prop.coords = newPosition;
	}

	reposition_I(): void {
		const redMotion = this.pictographData.redMotionData;
		const blueMotion = this.pictographData.blueMotionData;
		const redPropData = this.pictographData.redPropData;
		const bluePropData = this.pictographData.bluePropData;

		if (!redMotion || !blueMotion || !redPropData || !bluePropData) return;

		// Find pro and anti motions
		const proMotion =
			redMotion.motionType === 'pro'
				? redMotion
				: blueMotion.motionType === 'pro'
					? blueMotion
					: null;
		const antiMotion =
			redMotion.motionType === 'anti'
				? redMotion
				: blueMotion.motionType === 'anti'
					? blueMotion
					: null;

		if (!proMotion || !antiMotion) return;

		// Find associated props
		const proProp = proMotion === redMotion ? redPropData : bluePropData;
		const antiProp = antiMotion === redMotion ? redPropData : bluePropData;

		const proDirection = this.directionCalculator.getDirection(proProp);
		const antiDirection = proDirection
			? this.directionCalculator.getOppositeDirection(proDirection)
			: undefined;

		if (proDirection) {
			this.moveProp(proProp, proDirection);
		}
		if (antiDirection) {
			this.moveProp(antiProp, antiDirection);
		}
	}

	reposition_J_K_L(): void {
		const redPropData = this.pictographData.redPropData;
		const bluePropData = this.pictographData.bluePropData;

		if (!redPropData || !bluePropData) return;

		const redDirection = this.directionCalculator.getDirection(redPropData);
		const blueDirection = this.directionCalculator.getDirection(bluePropData);

		if (redDirection && blueDirection) {
			this.moveProp(redPropData, redDirection);
			this.moveProp(bluePropData, blueDirection);
		}
	}

	reposition_Y_Z(): void {
		const redMotion = this.pictographData.redMotionData;
		const blueMotion = this.pictographData.blueMotionData;
		const redPropData = this.pictographData.redPropData;
		const bluePropData = this.pictographData.bluePropData;

		if (!redMotion || !blueMotion || !redPropData || !bluePropData) return;

		// Find shift and static motions
		const shiftMotion = this.isShiftMotion(redMotion)
			? redMotion
			: this.isShiftMotion(blueMotion)
				? blueMotion
				: null;
		const staticMotion =
			redMotion.motionType === 'static'
				? redMotion
				: blueMotion.motionType === 'static'
					? blueMotion
					: null;

		if (!shiftMotion || !staticMotion) return;

		// Find associated props
		const shiftProp = shiftMotion === redMotion ? redPropData : bluePropData;
		const staticProp = staticMotion === redMotion ? redPropData : bluePropData;

		const direction = this.directionCalculator.getDirection(shiftProp);
		if (!direction) return;

		this.moveProp(shiftProp, direction);
		this.moveProp(staticProp, this.directionCalculator.getOppositeDirection(direction));
	}

	reposition_β(): void {
		const redPropData = this.pictographData.redPropData;
		const bluePropData = this.pictographData.bluePropData;

		if (!redPropData || !bluePropData) return;

		const direction = this.directionCalculator.getDirection(redPropData);
		if (direction) {
			this.moveProp(redPropData, direction);
			this.moveProp(bluePropData, this.directionCalculator.getOppositeDirection(direction));
		}
	}

	private isShiftMotion(motion: MotionData): boolean {
		return ['pro', 'anti', 'float'].includes(motion.motionType);
	}
}
