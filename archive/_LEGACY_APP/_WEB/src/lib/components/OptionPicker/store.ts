// src/lib/components/OptionPicker/store.ts
import { writable, derived } from 'svelte/store';
import type { PictographData } from '$lib/types/PictographData';
import { selectedPictograph } from '$lib/stores/sequence/selectedPictographStore';
import type { SortMethod, ReversalFilter } from './config';
import {
	getNextOptions,
	determineReversalCategory,
	determineGroupKey,
	getSortedGroupKeys,
	getSorter
} from './services/OptionsService';
import { get } from 'svelte/store';
import { browser } from '$app/environment';
// Import the addBeat function from beatsStore
import { addBeat } from '$lib/stores/sequence/beatsStore';

// ===== Core State =====
export const sequenceStore = writable<PictographData[]>([]);
export const optionsStore = writable<PictographData[]>([]);

// ===== UI State =====
export type LastSelectedTabState = Partial<Record<SortMethod, string | null>>;

// First define the helper function
function getStoredState() {
	if (!browser) return {};

	try {
		const stored = localStorage.getItem('optionPickerUIState');

		if (!stored) return {};

		const parsed = JSON.parse(stored);

		// Convert from simple format to the structure your code expects
		return {
			[parsed.sortMethod]: parsed.currentTab
		};
	} catch (e) {
		console.error('Error reading from localStorage:', e);
		return {};
	}
}
// THEN get the stored state
const storedState: { sortMethod?: SortMethod; lastSelectedTab?: LastSelectedTabState } = getStoredState();

// THEN initialize uiState with the stored values
export const uiState = writable({
	sortMethod: storedState.sortMethod || ('type' as SortMethod),
	isLoading: false,
	error: null as string | null,
	lastSelectedTab: storedState.lastSelectedTab || ({} as LastSelectedTabState)
});

// FINALLY set up the localStorage subscription
if (browser) {
	uiState.subscribe((state) => {
		try {
			// Streamlined data - just what you need
			const saveData = {
				currentTab:
					(state.lastSelectedTab as Partial<Record<SortMethod, string | null>>)[
						state.sortMethod as SortMethod
					] || 'all'
			};
			localStorage.setItem('optionPickerUIState', JSON.stringify(saveData));
		} catch (e) {
			console.error('Error writing to localStorage:', e);
		}
	});
}

// ===== Actions =====
export const actions = {
	loadOptions: (sequence: PictographData[]) => {
		sequenceStore.set(sequence);
		uiState.update((state) => ({ ...state, isLoading: true, error: null }));
		try {
			const nextOptions = getNextOptions(sequence);
			optionsStore.set(nextOptions);
			uiState.update((state) => ({ ...state, isLoading: false }));
			// Note: We don't reset lastSelectedTabPerSortMethod here,
			// allowing selections to persist across sequence changes if the tabs still exist.
		} catch (error) {
			console.error('Error loading options:', error);
			uiState.update((state) => ({
				...state,
				isLoading: false,
				error: error instanceof Error ? error.message : 'Unknown error loading options'
			}));
			optionsStore.set([]);
		}
	},

	setSortMethod: (method: SortMethod) => {
		// Only update the sortMethod here. The component will reactively
		// update the selectedTab based on the new method and stored preferences.
		uiState.update((state) => ({ ...state, sortMethod: method }));
	},

	setReversalFilter: (filter: ReversalFilter) => {
		uiState.update((state) => ({ ...state, reversalFilter: filter }));
	},

	// ADDED: Action to store the last selected tab for a given sort method
	setLastSelectedTabForSort: (sortMethod: SortMethod, tabKey: string | null) => {
		uiState.update((state) => {
			// Avoid unnecessary updates if the value hasn't changed
			if (state.lastSelectedTab[sortMethod] === tabKey) {
				return state;
			}
			return {
				...state,
				lastSelectedTab: {
					...state.lastSelectedTab,
					[sortMethod]: tabKey
				}
			};
		});
	},

	selectOption: (option: PictographData) => {
		// First, update the selected pictograph store
		selectedPictograph.set(option);
		
		// Now add the selected option to the beat sequence
		// This will trigger the beatsStore update, which will then
		// cause OptionPicker to reload options based on the new end position
		addBeat(option);
	},

	// In the actions object in store.ts
	reset: () => {
		optionsStore.set([]);
		sequenceStore.set([]);

		// Get current state to preserve tab preferences
		const currentState = get(uiState);

		uiState.set({
			sortMethod: 'type',
			isLoading: false,
			error: null,
			lastSelectedTab: currentState.lastSelectedTab || {}
		});

		selectedPictograph.set(null);
	}
};

// ===== Derived Stores =====

// Filtered options - applies filtering and sorting based on uiState
export const filteredOptionsStore = derived(
	[optionsStore, sequenceStore, uiState],
	([$options, $sequence, $ui]) => {
		let options = [...$options];

		options.sort(getSorter($ui.sortMethod, $sequence));
		return options;
	}
);

// Grouped options - groups the filtered/sorted options based on the current sortMethod
export const groupedOptionsStore = derived(
	[filteredOptionsStore, sequenceStore, uiState],
	([$filteredOptions, $sequence, $ui]) => {
		const groups: Record<string, PictographData[]> = {};
		$filteredOptions.forEach((option) => {
			const groupKey = determineGroupKey(option, $ui.sortMethod, $sequence);
			if (!groups[groupKey]) groups[groupKey] = [];
			groups[groupKey].push(option);
		});
		const sortedKeys = getSortedGroupKeys(Object.keys(groups), $ui.sortMethod);
		const sortedGroups: Record<string, PictographData[]> = {};
		sortedKeys.forEach((key) => {
			if (groups[key]) {
				sortedGroups[key] = groups[key];
			}
		});
		return sortedGroups;
	}
);

// Convenience export (optional)
export const optionPickerStore = {
	subscribe: derived([optionsStore, sequenceStore, uiState], ([$options, $sequence, $ui]) => ({
		allOptions: $options,
		currentSequence: $sequence,
		sortMethod: $ui.sortMethod,
		isLoading: $ui.isLoading,
		error: $ui.error
		// components interact via actions or specific selectors if needed.
	})).subscribe,
	...actions
};