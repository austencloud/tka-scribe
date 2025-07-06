// src/lib/components/Pictograph/services/PictographChecker.ts
import { CLOCK, COUNTER, IN, OUT } from '$lib/types/Constants';
import type { PictographData } from '$lib/types/PictographData';
import { LetterUtils } from '$lib/utils/LetterUtils';
import { LetterConditions } from '../constants/LetterConditions';
import type { Orientation } from '$lib/types/Types';

export class PictographChecker {
	private _pictographData: PictographData;

	constructor(pictographData: PictographData) {
		this._pictographData = pictographData;
	}

	// Use a getter to access the most up-to-date pictograph data
	get pictographData(): PictographData {
		return this._pictographData;
	}

	// Method to update the pictograph data when it changes
	updateData(newData: PictographData): void {
		this._pictographData = newData;
	}

	private get orientationChecks() {
		return {
			isRadial: (ori?: string) => [IN, OUT].includes(ori ?? ''),
			isRotational: (ori?: string) => [CLOCK, COUNTER].includes(ori ?? '')
		};
	}

	private getMotionEndOrientation(motionKey: 'redMotionData' | 'blueMotionData') {
		return this.pictographData[motionKey]?.endOri;
	}

	checkLetterCondition(condition: LetterConditions): boolean {
		return this.pictographData.letter
			? LetterUtils.getLettersByCondition(condition).includes(this.pictographData.letter)
			: false;
	}

	endsWithLayer3(): boolean {
		const redEndOri = this.getMotionEndOrientation('redMotionData');
		const blueEndOri = this.getMotionEndOrientation('blueMotionData');

		const checks = this.orientationChecks;

		return (
			(checks.isRadial(redEndOri) && checks.isRotational(blueEndOri)) ||
			(checks.isRotational(redEndOri) && checks.isRadial(blueEndOri))
		);
	}

	endsWithRadialOri(): boolean {
		const redEndOri = this.getMotionEndOrientation('redMotionData');
		const blueEndOri = this.getMotionEndOrientation('blueMotionData');

		return (
			this.orientationChecks.isRadial(redEndOri) && this.orientationChecks.isRadial(blueEndOri)
		);
	}

	endsWithNonRadialOri(): boolean {
		const redEndOri = this.getMotionEndOrientation('redMotionData');
		const blueEndOri = this.getMotionEndOrientation('blueMotionData');

		return (
			this.orientationChecks.isRotational(redEndOri) &&
			this.orientationChecks.isRotational(blueEndOri)
		);
	}

	endsWithBeta(): boolean {
		// Check if the current pictograph ends in the beta position system
		const endPos = this.pictographData?.endPos;
		return endPos ? endPos.startsWith('beta') : false;
	}
}
