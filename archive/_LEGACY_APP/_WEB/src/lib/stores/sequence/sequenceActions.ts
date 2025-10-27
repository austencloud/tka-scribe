// src/lib/stores/sequence/sequenceActions.ts
import { beatsStore, selectedBeatIndexStore } from './beatsStore';
import type { PictographData } from '../../types/PictographData';
import type { BeatData } from '$lib/components/SequenceWorkbench/SequenceBeatFrame/BeatData';
import { writable, get, type Writable } from 'svelte/store';

// Create a store for the start position
export const startPositionStore: Writable<PictographData | null> = writable<PictographData | null>(null);

// Action types as constants
export const ActionTypes = {
	SELECT_BEAT: 'SELECT_BEAT',
	ADD_BEAT: 'ADD_BEAT',
	UPDATE_BEAT: 'UPDATE_BEAT',
	REMOVE_BEAT: 'REMOVE_BEAT',
	CLEAR_SEQUENCE: 'CLEAR_SEQUENCE',
	MIRROR_SEQUENCE: 'MIRROR_SEQUENCE',
	ROTATE_SEQUENCE: 'ROTATE_SEQUENCE',
	SWAP_COLORS: 'SWAP_COLORS',
	UPDATE_START_POSITION: 'UPDATE_START_POSITION',
	SET_STATUS: 'SET_STATUS'
} as const;

// Action type definitions using discriminated unions
export type SequenceAction =
	| { type: 'SELECT_BEAT'; payload: number }
	| { type: 'ADD_BEAT'; payload: BeatData }
	| { type: 'UPDATE_BEAT'; payload: { index: number; beat: Partial<BeatData> } }
	| { type: 'REMOVE_BEAT'; payload: number }
	| { type: 'CLEAR_SEQUENCE' }
	| { type: 'MIRROR_SEQUENCE'; payload?: { direction: 'horizontal' | 'vertical' } }
	| { type: 'ROTATE_SEQUENCE'; payload?: { degrees: number } }
	| { type: 'SWAP_COLORS' }
	| { type: 'UPDATE_START_POSITION'; payload: PictographData }
	| { type: 'SET_STATUS'; payload: string };

// Action creators - pure functions that dispatch store updates
export const sequenceActions = {
	selectBeat(index: number): SequenceAction {
		selectedBeatIndexStore.set(index);
		return { type: 'SELECT_BEAT', payload: index };
	},

	addBeat(beat: BeatData): SequenceAction {
		beatsStore.update((beats) => [...beats, beat]);
		return { type: 'ADD_BEAT', payload: beat };
	},

	updateBeat(index: number, beatUpdate: Partial<BeatData>): SequenceAction {
		beatsStore.update((beats) => {
			if (index < 0 || index >= beats.length) return beats;

			const updatedBeats = [...beats];
			updatedBeats[index] = { ...updatedBeats[index], ...beatUpdate };
			return updatedBeats;
		});

		return {
			type: 'UPDATE_BEAT',
			payload: { index, beat: beatUpdate }
		};
	},

	removeBeat(index: number): SequenceAction {
		beatsStore.update((beats) => beats.filter((_, i) => i !== index));
		return { type: 'REMOVE_BEAT', payload: index };
	},

	clearSequence(): SequenceAction {
		beatsStore.set([]);
		selectedBeatIndexStore.set(-1);
		startPositionStore.set(null);
		return { type: 'CLEAR_SEQUENCE' };
	},

	mirrorSequence(direction: 'horizontal' | 'vertical' = 'horizontal'): SequenceAction {
		beatsStore.update((beats) => {
			return beats.map((beat) => {
				// Create a deep copy of pictograph data
				const pictographData = { ...beat.pictographData };

				// Apply mirroring transformation to pictograph data
				// This is just a placeholder - actual implementation would depend on the data structure
				if (direction === 'horizontal') {
					// Mirror horizontal data
				} else {
					// Mirror vertical data
				}

				return {
					...beat,
					pictographData
				};
			});
		});

		return { type: 'MIRROR_SEQUENCE', payload: { direction } };
	},

	rotateSequence(degrees: number = 90): SequenceAction {
		beatsStore.update((beats) => {
			return beats.map((beat) => {
				// Create a deep copy of pictograph data
				const pictographData = { ...beat.pictographData };

				// Apply rotation transformation to pictograph data
				// This is just a placeholder - actual implementation would depend on the data structure

				return {
					...beat,
					pictographData
				};
			});
		});

		return { type: 'ROTATE_SEQUENCE', payload: { degrees } };
	},

	swapColors(): SequenceAction {
		beatsStore.update((beats) => {
			return beats.map((beat) => {
				// Create a deep copy of pictograph data
				const pictographData = { ...beat.pictographData };

				// Swap blue and red data
				const tempBlueMotionData = pictographData.blueMotionData;
				pictographData.blueMotionData = pictographData.redMotionData;
				pictographData.redMotionData = tempBlueMotionData;

				const tempBluePropData = pictographData.bluePropData;
				pictographData.bluePropData = pictographData.redPropData;
				pictographData.redPropData = tempBluePropData;

				const tempBlueArrowData = pictographData.blueArrowData;
				pictographData.blueArrowData = pictographData.redArrowData;
				pictographData.redArrowData = tempBlueArrowData;

				return {
					...beat,
					pictographData
				};
			});
		});

		return { type: 'SWAP_COLORS' };
	},

	// New action for updating the start position
	updateStartPosition(pictographData: PictographData): SequenceAction {
		startPositionStore.set(pictographData);
		return { type: 'UPDATE_START_POSITION', payload: pictographData };
	},

	// Set status action
	setStatus(status: string): SequenceAction {
		return { type: 'SET_STATUS', payload: status };
	}
};

// Optional: Create a typed dispatch function if you want to handle side effects
export function dispatchSequenceAction(action: SequenceAction): void {
	// This is where you could add side effects, logging, etc.
	console.log('Action dispatched:', action);

	// You could also trigger events if needed
	const event = new CustomEvent('sequence-action', {
		detail: action,
		bubbles: true
	});
	document.dispatchEvent(event);
}