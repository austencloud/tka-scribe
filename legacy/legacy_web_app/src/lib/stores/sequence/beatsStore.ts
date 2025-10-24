// src/lib/stores/beatsStore.ts
import { writable, derived, get } from 'svelte/store';
import type { BeatData } from '../../components/SequenceWorkbench/SequenceBeatFrame/BeatData';
import { createBeat } from '../../components/SequenceWorkbench/SequenceBeatFrame/BeatData';
import { defaultPictographData } from '../../components/Pictograph/utils/defaultPictographData';

// The store for the sequence beats
export const beatsStore = writable<BeatData[]>([]);

// Derived store for total beats count
export const beatCount = derived(beatsStore, ($beats) => $beats.length);

// Derived store for the current selected beat
export const selectedBeatIndexStore = writable<number | null>(null);

// Derived store for the selected beat data
export const selectedBeat = derived(
	[beatsStore, selectedBeatIndexStore],
	([$beats, $selectedIndex]) => {
		if ($selectedIndex === null || $selectedIndex < 0 || $selectedIndex >= $beats.length) {
			return null;
		}
		return $beats[$selectedIndex];
	}
);

/**
 * Add a new beat to the sequence
 */
export function addBeat(pictographData = defaultPictographData, options = {}): void {
	beatsStore.update((beats) => {
		const newBeat = createBeat(
			beats.length + 1, // Beat number starts from 1 (0 is start position)
			pictographData,
			options
		);
		return [...beats, newBeat];
	});
}

/**
 * Update a beat at the specified index
 */
export function updateBeat(index: number, updates: Partial<BeatData>): void {
	beatsStore.update((beats) => {
		if (index < 0 || index >= beats.length) return beats;

		const updatedBeats = [...beats];
		updatedBeats[index] = {
			...updatedBeats[index],
			...updates
		};
		return updatedBeats;
	});
}

/**
 * Insert a beat at the specified index
 */
export function insertBeat(
	index: number,
	pictographData = defaultPictographData,
	options = {}
): void {
	beatsStore.update((beats) => {
		// Ensure index is valid
		const insertAt = Math.max(0, Math.min(beats.length, index));

		// Create the new beat
		const newBeat = createBeat(
			insertAt + 1, // Beat number starts from 1
			pictographData,
			options
		);

		// Insert the beat and update subsequent beat numbers
		const updatedBeats = [
			...beats.slice(0, insertAt),
			newBeat,
			...beats.slice(insertAt).map((beat) => ({
				...beat,
				beatNumber: beat.beatNumber + 1
			}))
		];

		return updatedBeats;
	});
}

/**
 * Remove a beat at the specified index
 */
export function removeBeat(index: number): void {
	beatsStore.update((beats) => {
		if (index < 0 || index >= beats.length) return beats;

		// Remove the beat and update subsequent beat numbers
		const updatedBeats = [
			...beats.slice(0, index),
			...beats.slice(index + 1).map((beat) => ({
				...beat,
				beatNumber: beat.beatNumber - 1
			}))
		];

		return updatedBeats;
	});
}

/**
 * Select a beat by its index
 */
export function selectBeat(index: number | null): void {
	selectedBeatIndexStore.set(index);
}

/**
 * Move a beat from one position to another
 */
export function moveBeat(fromIndex: number, toIndex: number): void {
	beatsStore.update((beats) => {
		if (
			fromIndex < 0 ||
			fromIndex >= beats.length ||
			toIndex < 0 ||
			toIndex >= beats.length ||
			fromIndex === toIndex
		) {
			return beats;
		}

		// Remove the beat from its current position
		const beatToMove = beats[fromIndex];
		const withoutBeat = [...beats.slice(0, fromIndex), ...beats.slice(fromIndex + 1)];

		// Insert the beat at the new position
		const updatedBeats = [
			...withoutBeat.slice(0, toIndex),
			beatToMove,
			...withoutBeat.slice(toIndex)
		];

		// Update all beat numbers to reflect their new positions
		return updatedBeats.map((beat, idx) => ({
			...beat,
			beatNumber: idx + 1 // Beat number starts from 1
		}));
	});
}

/**
 * Clear all beats from the sequence
 */
export function clearBeats(): void {
	beatsStore.set([]);
	selectedBeatIndexStore.set(null);
}

/**
 * Get the current beats array without subscribing
 */
export function getBeats(): BeatData[] {
	return get(beatsStore);
}
