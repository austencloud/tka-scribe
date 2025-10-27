import type { BeatData } from '$lib/components/SequenceWorkbench/SequenceBeatFrame/BeatData.js';
import { beatsStore } from '$lib/stores/sequence/beatsStore';

/**
 * Adds a new beat to the sequence.
 * - Auto-assigns beat numbers.
 * - Prevents exceeding 64 beats.
 */
export function addBeat(newBeat: BeatData) {
	beatsStore.update((beats) => {
		if (beats.length >= 64) {
			console.warn('Max beats reached (64)');
			return beats;
		}

		// Assign beat number
		newBeat.beatNumber = beats.length + 1;
		return [...beats, newBeat];
	});
}
