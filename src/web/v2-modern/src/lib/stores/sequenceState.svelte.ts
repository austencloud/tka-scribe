/**
 * Sequence State - Pure Svelte 5 Runes
 * 
 * Clean reactive state management using only Svelte 5 runes.
 * No stores, no subscriptions - just pure reactive magic.
 */

import type { SequenceData, BeatData } from '@tka/schemas';
import type { SequenceCreateRequest } from '$services/interfaces';

// ============================================================================
// CORE SEQUENCE STATE
// ============================================================================

export let currentSequence = $state<SequenceData | null>(null);
export let sequences = $state<SequenceData[]>([]);
export let isLoading = $state(false);
export let error = $state<string | null>(null);

// ============================================================================
// SELECTION STATE
// ============================================================================

export let selectedBeatIndex = $state<number | null>(null);
export let selectedSequenceId = $state<string | null>(null);

// ============================================================================
// UI STATE
// ============================================================================

export let showBeatNumbers = $state(true);
export let gridMode = $state<'diamond' | 'box'>('diamond');

// ============================================================================
// DERIVED STATE (COMPUTED)
// ============================================================================

export const currentBeats = $derived<BeatData[]>(
	currentSequence?.beats ?? []
);

export const selectedBeat = $derived<BeatData | null>(
	selectedBeatIndex !== null && currentSequence 
		? currentSequence.beats[selectedBeatIndex] ?? null 
		: null
);

export const hasCurrentSequence = $derived<boolean>(
	currentSequence !== null
);

export const sequenceCount = $derived<number>(
	sequences.length
);

export const hasUnsavedChanges = $derived<boolean>(
	// TODO: Implement change tracking
	false
);

// ============================================================================
// ACTIONS (PURE FUNCTIONS)
// ============================================================================

/**
 * Set the current sequence
 */
export function setCurrentSequence(sequence: SequenceData | null): void {
	currentSequence = sequence;
	selectedSequenceId = sequence?.id ?? null;
	selectedBeatIndex = null; // Reset beat selection
}

/**
 * Add sequence to the list
 */
export function addSequence(sequence: SequenceData): void {
	sequences.push(sequence);
	setCurrentSequence(sequence);
}

/**
 * Update sequence in the list
 */
export function updateSequence(updatedSequence: SequenceData): void {
	const index = sequences.findIndex(s => s.id === updatedSequence.id);
	if (index >= 0) {
		sequences[index] = updatedSequence;
	}
	
	// Update current sequence if it's the same one
	if (currentSequence?.id === updatedSequence.id) {
		currentSequence = updatedSequence;
	}
}

/**
 * Remove sequence from the list
 */
export function removeSequence(sequenceId: string): void {
	sequences = sequences.filter(s => s.id !== sequenceId);
	
	// Clear current sequence if it was deleted
	if (currentSequence?.id === sequenceId) {
		setCurrentSequence(null);
	}
}

/**
 * Set sequences list
 */
export function setSequences(newSequences: SequenceData[]): void {
	sequences = newSequences;
}

/**
 * Update a beat in the current sequence
 */
export function updateCurrentBeat(beatIndex: number, beatData: BeatData): void {
	if (!currentSequence) return;
	
	const updatedBeats = [...currentSequence.beats];
	updatedBeats[beatIndex] = beatData;
	
	const updatedSequence = {
		...currentSequence,
		beats: updatedBeats,
		updatedAt: new Date().toISOString()
	};
	
	updateSequence(updatedSequence);
}

/**
 * Select a beat
 */
export function selectBeat(beatIndex: number | null): void {
	selectedBeatIndex = beatIndex;
}

/**
 * Select a sequence
 */
export function selectSequence(sequenceId: string | null): void {
	selectedSequenceId = sequenceId;
	selectedBeatIndex = null;
}

/**
 * Toggle beat numbers visibility
 */
export function toggleBeatNumbers(): void {
	showBeatNumbers = !showBeatNumbers;
}

/**
 * Set grid mode
 */
export function setGridMode(mode: 'diamond' | 'box'): void {
	gridMode = mode;
}

/**
 * Set loading state
 */
export function setLoading(loading: boolean): void {
	isLoading = loading;
}

/**
 * Set error state
 */
export function setError(errorMessage: string | null): void {
	error = errorMessage;
}

/**
 * Clear error
 */
export function clearError(): void {
	error = null;
}

/**
 * Clear all selections
 */
export function clearSelections(): void {
	currentSequence = null;
	selectedSequenceId = null;
	selectedBeatIndex = null;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Find sequence by ID
 */
export function findSequenceById(id: string): SequenceData | null {
	return sequences.find(s => s.id === id) ?? null;
}

/**
 * Check if sequence is selected
 */
export function isSequenceSelected(id: string): boolean {
	return selectedSequenceId === id;
}

/**
 * Check if beat is selected
 */
export function isBeatSelected(index: number): boolean {
	return selectedBeatIndex === index;
}

/**
 * Get state snapshot for debugging
 */
export function getStateSnapshot() {
	return {
		currentSequence,
		sequences: sequences.length,
		isLoading,
		error,
		selectedBeatIndex,
		selectedSequenceId,
		showBeatNumbers,
		gridMode
	};
}
