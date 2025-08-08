import type { PictographData } from '$lib/types/PictographData';
import type { PropData } from '$lib/components/objects/Prop/PropData';
import type { MotionData } from '$lib/components/objects/Motion/MotionData';
import { LetterConditions } from '../constants/LetterConditions';
import { LetterType } from '$lib/types/LetterType';

/**
 * PictographChecker provides validation and condition checking for pictographs.
 * This is the TypeScript equivalent of the Python PictographChecker class.
 */
export class PictographChecker {
	private data: PictographData;

	constructor(pictographData: PictographData) {
		this.data = pictographData;
	}

	/**
	 * Check if the pictograph ends with a beta position
	 */
	endsWithBeta(): boolean {
		if (!this.data.letter) return false;

		// Letters that end at beta positions
		const betaEndingLetters = [
			'G', 'H', 'I', 'J', 'K', 'L', 'Y', 'Z', 'Y-', 'Z-', 'Ψ', 'Ψ-', 'β'
		];

		return betaEndingLetters.includes(this.data.letter);
	}

	/**
	 * Check if the pictograph ends with an alpha position
	 */
	endsWithAlpha(): boolean {
		if (!this.data.letter) return false;

		// Letters that end at alpha positions
		const alphaEndingLetters = [
			'A', 'B', 'C', 'D', 'E', 'F', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
			'W-', 'X-', 'Σ', 'Δ', 'θ', 'Ω', 'Σ-', 'Δ-', 'θ-', 'Ω-', 'Φ', 'Λ', 'Φ-', 'Λ-', 'α'
		];

		return alphaEndingLetters.includes(this.data.letter);
	}

	/**
	 * Check if the pictograph ends with a gamma position
	 */
	endsWithGamma(): boolean {
		if (!this.data.letter) return false;

		// Letters that end at gamma positions
		const gammaEndingLetters = ['Γ'];

		return gammaEndingLetters.includes(this.data.letter);
	}

	/**
	 * Check if the pictograph ends with layer 1 (both props have same radial mode)
	 */
	endsWithLayer1(): boolean {
		const redProp = this.data.redPropData;
		const blueProp = this.data.bluePropData;

		if (!redProp || !blueProp) return false;

		return redProp.radialMode === blueProp.radialMode;
	}

	/**
	 * Check if the pictograph ends with layer 2 (both props are nonradial)
	 */
	endsWithLayer2(): boolean {
		const redProp = this.data.redPropData;
		const blueProp = this.data.bluePropData;

		if (!redProp || !blueProp) return false;

		return redProp.radialMode === 'nonradial' && blueProp.radialMode === 'nonradial';
	}

	/**
	 * Check if the pictograph ends with layer 3 (props have different radial modes)
	 */
	endsWithLayer3(): boolean {
		const redProp = this.data.redPropData;
		const blueProp = this.data.bluePropData;

		if (!redProp || !blueProp) return false;

		return redProp.radialMode !== blueProp.radialMode;
	}

	/**
	 * Check if the pictograph ends with non-hybrid orientation
	 */
	endsWithNonHybridOri(): boolean {
		return this.endsWithLayer1() || this.endsWithLayer2();
	}

	/**
	 * Check if the pictograph ends with in/out orientation
	 */
	endsWithInOutOri(): boolean {
		const redProp = this.data.redPropData;
		const blueProp = this.data.bluePropData;

		if (!redProp || !blueProp) return false;

		return (
			(redProp.ori === 'in' && blueProp.ori === 'out') ||
			(redProp.ori === 'out' && blueProp.ori === 'in')
		);
	}

	/**
	 * Check if the pictograph ends with clock/counter orientation
	 */
	endsWithClockCounterOri(): boolean {
		const redProp = this.data.redPropData;
		const blueProp = this.data.bluePropData;

		if (!redProp || !blueProp) return false;

		return (
			(redProp.ori === 'clock' && blueProp.ori === 'counter') ||
			(redProp.ori === 'counter' && blueProp.ori === 'clock')
		);
	}

	/**
	 * Check if the pictograph ends with radial orientation
	 */
	endsWithRadialOri(): boolean {
		const redProp = this.data.redPropData;
		const blueProp = this.data.bluePropData;

		if (!redProp || !blueProp) return false;

		return redProp.radialMode === 'radial' && blueProp.radialMode === 'radial';
	}

	/**
	 * Check if the pictograph ends with nonradial orientation
	 */
	endsWithNonradialOri(): boolean {
		const redProp = this.data.redPropData;
		const blueProp = this.data.bluePropData;

		if (!redProp || !blueProp) return false;

		return redProp.radialMode === 'nonradial' && blueProp.radialMode === 'nonradial';
	}

	/**
	 * Backwards-compatible alias for endsWithNonradialOri.
	 * Some callers use a different camelCase (NonRadial vs Nonradial).
	 */
	endsWithNonRadialOri(): boolean {
		return this.endsWithNonradialOri();
	}

	/**
	 * Check if the pictograph has hybrid motions (different motion types)
	 */
	hasHybridMotions(): boolean {
		const redMotion = this.data.redMotionData;
		const blueMotion = this.data.blueMotionData;

		if (!redMotion || !blueMotion) return false;

		return redMotion.motionType !== blueMotion.motionType;
	}

	/**
	 * Check if the pictograph has one float motion
	 */
	hasOneFloat(): boolean {
		const redMotion = this.data.redMotionData;
		const blueMotion = this.data.blueMotionData;

		return (
			(redMotion?.motionType === 'float' && blueMotion?.motionType !== 'float') ||
			(blueMotion?.motionType === 'float' && redMotion?.motionType !== 'float')
		);
	}

	/**
	 * Check a specific letter condition
	 */
	checkLetterCondition(condition: LetterConditions): boolean {
		switch (condition) {
			case LetterConditions.ALPHA_ENDING:
				return this.endsWithAlpha();
			case LetterConditions.BETA_ENDING:
				return this.endsWithBeta();
			case LetterConditions.GAMMA_ENDING:
				return this.endsWithGamma();
			case LetterConditions.HYBRID:
				return this.hasHybridMotions();
			case LetterConditions.NON_HYBRID:
				return !this.hasHybridMotions();
			default:
				return false;
		}
	}

	/**
	 * Check if pictograph data is complete
	 */
	isPictographDataComplete(): boolean {
		return !!(
			this.data.letter &&
			this.data.startPos &&
			this.data.endPos &&
			this.data.timing &&
			this.data.direction &&
			this.data.redMotionData &&
			this.data.blueMotionData &&
			this.data.gridData
		);
	}

	/**
	 * Get the letter type for the current pictograph
	 */
	getLetterType(): LetterType | null {
		if (!this.data.letter) return null;
		return LetterType.getLetterType(this.data.letter);
	}
}
