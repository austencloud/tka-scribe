// src/lib/services/StartPositionService.ts
import { sequenceDataService } from './SequenceDataService';
import type { PictographData } from '$lib/types/PictographData';
import type { SequenceBeat, SequenceStartPos } from './SequenceDataService';
import { beatsStore } from '$lib/stores/sequence/beatsStore';
import { createBeat } from '$lib/components/SequenceWorkbench/SequenceBeatFrame/BeatData';
import { browser } from '$app/environment';

export class StartPositionService {
	convertPictographToStartPosition(pictograph: PictographData): SequenceStartPos {
		return {
			beat: 0,
			letter: "α", // Adding a letter for the start position
			sequence_start_position: pictograph.startPos?.replace(/\d+/, "") || "alpha", // Store the base name
			start_pos: pictograph.startPos ?? undefined,
			end_pos: pictograph.endPos ?? undefined,
			blue_attributes: {
				motion_type: pictograph.blueMotionData?.motionType || 'static',
				start_ori: pictograph.blueMotionData?.startOri || 'in',
				prop_rot_dir: pictograph.blueMotionData?.propRotDir || 'no_rot',
				start_loc: pictograph.blueMotionData?.startLoc || 's',
				end_loc: pictograph.blueMotionData?.endLoc || 's',
				turns: pictograph.blueMotionData?.turns || 0,
				end_ori: pictograph.blueMotionData?.endOri || 'in'
			},
			red_attributes: {
				motion_type: pictograph.redMotionData?.motionType || 'static',
				start_ori: pictograph.redMotionData?.startOri || 'in',
				prop_rot_dir: pictograph.redMotionData?.propRotDir || 'no_rot',
				start_loc: pictograph.redMotionData?.startLoc || 'e',
				end_loc: pictograph.redMotionData?.endLoc || 'e',
				turns: pictograph.redMotionData?.turns || 0,
				end_ori: pictograph.redMotionData?.endOri || 'in'
			},
			timing: 'none',
			direction: 'none'
		};
	}

	async addStartPosition(pictograph: PictographData) {
		// 1. Create and save the start position to the sequence data
		const startPositionBeat = this.convertPictographToStartPosition(pictograph);
		await sequenceDataService.addStartPosition(startPositionBeat);

		// 2. IMPORTANT: Don't touch beatsStore at all!
		// The UI is already handling the start position display separately
		
		// 3. Dispatch a custom event to notify components that sequence data changed
		if (browser) {
			const sequenceUpdatedEvent = new CustomEvent('sequence-updated', {
				detail: { type: 'start-position-added', data: pictograph },
				bubbles: true
			});
			document.dispatchEvent(sequenceUpdatedEvent);
		}
	}
}

export const startPositionService = new StartPositionService();
export default startPositionService;