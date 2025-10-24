// src/lib/stores/sequence/selectionStore.ts
import { writable, derived, type Readable } from 'svelte/store';
import type { PictographData } from '$lib/types/PictographData';
import { beatsStore } from './beatsStore';
import type { BeatData } from '$lib/components/SequenceWorkbench/SequenceBeatFrame/BeatData';

// Create a custom store for selectedStartPos
function createSelectedStartPosStore() {
    const { subscribe, set, update } = writable<PictographData | null>(null);
    
    return {
        subscribe,
        set,
        update
    };
}

// Primary selection stores
export const selectedBeatIndexStore = writable<number | null>(null);
export const selectedStartPosStore = createSelectedStartPosStore();

// Derived store for the selected beat data
export const selectedBeat: Readable<BeatData | null> = derived(
    [beatsStore, selectedBeatIndexStore],
    ([$beats, $selectedIndex]) => {
        if ($selectedIndex === null || $selectedIndex < 0 || $selectedIndex >= $beats.length) {
            return null;
        }
        return $beats[$selectedIndex];
    }
);

// Derived store for whether we're in "selecting start position" mode
export const isSelectingStartPos = derived(
    [selectedBeatIndexStore, selectedStartPosStore],
    ([$selectedBeatIndex, $selectedStartPos]) => {
        return $selectedBeatIndex === null && $selectedStartPos !== null;
    }
);

// Derived store for whether we're in "selecting beat" mode
export const isSelectingBeat = derived(
    selectedBeatIndexStore,
    ($selectedBeatIndex) => $selectedBeatIndex !== null
);

// Derived store for whether any selection is active
export const hasSelection = derived(
    [selectedBeatIndexStore, selectedStartPosStore],
    ([$selectedBeatIndex, $selectedStartPos]) => $selectedBeatIndex !== null || $selectedStartPos !== null
);

/**
 * Selection actions encapsulate all the ways to manipulate selection state
 * These are pure functions that update the selection stores in a controlled way
 */
export const selectionActions = {
    /**
     * Select a beat by its index
     * This will clear any start position selection
     */
    selectBeat: (index: number | null) => {
        selectedBeatIndexStore.set(index);
        
        // If selecting a beat, clear start position selection
        if (index !== null) {
            selectedStartPosStore.set(null);
        }
    },
    
    /**
     * Select a start position
     * This will clear any beat selection
     */
    selectStartPos: (data: PictographData | null) => {
        selectedStartPosStore.set(data);
        
        // If selecting a start position, clear beat selection
        if (data !== null) {
            selectedBeatIndexStore.set(null);
        }
    },
    
    /**
     * Clear all selections
     */
    clearAllSelections: () => {
        selectedBeatIndexStore.set(null);
        selectedStartPosStore.set(null);
    },
    
    /**
     * Toggle beat selection
     * If the beat is already selected, unselect it
     * If a different beat is selected, select the new one
     */
    toggleBeatSelection: (index: number) => {
        selectedBeatIndexStore.update(currentIndex => 
            currentIndex === index ? null : index
        );
        
        // Clear start position selection when toggling beat selection
        selectedStartPosStore.set(null);
    }
};

// Export the selected start position store for backward compatibility
// This allows gradual migration without breaking existing code
export const selectedStartPos = selectedStartPosStore;
