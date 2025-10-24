import { BetaPropDirectionCalculator } from './BetaPropDirectionCalculator';
import type { PictographData } from '$lib/types/PictographData';
import type { Direction } from '$lib/types/Types';
import type { PropData } from '$lib/components/objects/Prop/PropData';
import { Letter } from '$lib/types/Letter';
import { LetterType } from '$lib/types/LetterType';
import { PRO, ANTI, FLOAT } from '$lib/types/Constants';

export class BetaPropPositioner {
	private dirCalculator: BetaPropDirectionCalculator;

	constructor(private pictographData: PictographData) {
		this.dirCalculator = new BetaPropDirectionCalculator(this.pictographData);
	}

	public reposition(props: PropData[]): void {
		if (!props || props.length === 0) {
			console.warn('No props to reposition');
			return;
		}

		// Store original positions for debugging
		const originalPositions = props.map((prop) => ({
			id: prop.id,
			color: prop.color,
			coords: { ...prop.coords }
		}));

		// Get letter type
		const letterType = this.pictographData.letter 
			? LetterType.getLetterType(this.pictographData.letter) 
			: null;
		const letterStr = this.pictographData.letter?.toString();
		
		// Handle different letter types
		if (letterType === LetterType.Type3) {
			// Type3: Cross-Shift letters
			this.repositionType3(props);
			return;
		} else if (letterStr === 'G' || letterStr === 'H') {
			// Special case for G and H
			this.repositionGH(props);
			return;
		}

		// Regular logic for other letters
		props.forEach((prop) => {
			const direction = this.dirCalculator.getDirection(prop);

			if (direction) {
				const oldCoords = { ...prop.coords };
				const newCoords = this.calculateNewCoords(oldCoords, direction);
				prop.coords = JSON.parse(JSON.stringify(newCoords));
			} else {
				console.warn(`No direction determined for ${prop.color} prop`);
			}
		});

		// Verify positions were changed
		const newPositions = props.map((prop) => ({
			id: prop.id,
			color: prop.color,
			coords: { ...prop.coords }
		}));
	}

	private repositionGH(props: PropData[]): void {
		console.log('Repositioning for G/H letter');
		
		const redProp = props.find(p => p.color === 'red');
		const blueProp = props.find(p => p.color === 'blue');
		const redMotion = this.pictographData.redMotionData;
		
		if (!redProp || !blueProp || !redMotion) {
			console.warn('Missing props or motion data for G/H repositioning');
			return;
		}
		
		// Get direction from red motion
		let direction = this.dirCalculator.getDirection(redProp);
		if (!direction) {
			console.warn('Could not determine direction for G/H repositioning');
			return;
		}
		
		// Apply opposite directions
		redProp.coords = this.calculateNewCoords(redProp.coords, direction);
		blueProp.coords = this.calculateNewCoords(blueProp.coords, this.dirCalculator.getOppositeDirection(direction));
	}

	private repositionType3(props: PropData[]): void {
		console.log('Repositioning for Type3 letter (Cross-Shift)');
		
		const redMotion = this.pictographData.redMotionData;
		const blueMotion = this.pictographData.blueMotionData;
		
		if (!redMotion || !blueMotion) {
			console.warn('Missing motion data for Type3 repositioning');
			return;
		}
		
		// Identify which motion is shift and which is dash
		const isShiftMotion = (motion: any) => [PRO, ANTI, FLOAT].includes(motion.motionType);
		const isDashMotion = (motion: any) => motion.motionType === 'dash';
		
		let shiftMotion, dashMotion;
		
		if (isShiftMotion(redMotion)) {
			shiftMotion = redMotion;
			dashMotion = blueMotion;
		} else if (isShiftMotion(blueMotion)) {
			shiftMotion = blueMotion;
			dashMotion = redMotion;
		} else {
			console.warn('Could not identify shift and dash motions for Type3 letter');
			return;
		}
		
		// Find the props associated with each motion
		const shiftProp = props.find(p => p.color === shiftMotion.color);
		const dashProp = props.find(p => p.color === dashMotion.color);
		
		if (!shiftProp || !dashProp) {
			console.warn('Could not find props for shift and dash motions');
			return;
		}
		
		// Get direction from shift motion
		const direction = this.dirCalculator.getDirection(shiftProp);
		if (!direction) {
			console.warn('Could not determine direction for Type3 repositioning');
			return;
		}
		
		// Apply directions - shift prop in direction, dash prop in opposite direction
		shiftProp.coords = this.calculateNewCoords(shiftProp.coords, direction);
		dashProp.coords = this.calculateNewCoords(dashProp.coords, this.dirCalculator.getOppositeDirection(direction));
	}

	private calculateNewCoords(
		position: { x: number; y: number },
		direction: Direction
	): { x: number; y: number } {
		const offset = 25; // Example offset
		const movementMap = {
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

		// Return a new object rather than modifying the original
		return {
			x: position.x + movement.x,
			y: position.y + movement.y
		};
	}
}