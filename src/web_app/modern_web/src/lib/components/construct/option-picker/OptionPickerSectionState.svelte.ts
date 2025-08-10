/**
 * OptionPickerSectionState.svelte.ts - Section state management using Svelte 5 runes
 * 
 * Manages state for individual sections matching the desktop version:
 * - Loading states
 * - UI initialization tracking  
 * - Section expansion/collapse
 * - Selected pictograph tracking
 */

import type { PictographData } from '$lib/domain/PictographData';

export interface SectionState {
	// Loading and initialization (matches desktop StateManager)
	loadingOptions: boolean;
	uiInitialized: boolean;
	scrollAreaReady: boolean;
	
	// Section-specific state
	isExpanded: boolean;
	selectedPictograph: PictographData | null;
	
	// Layout state
	optionPickerWidth: number | null;
	isGroupable: boolean | null;
}

/**
 * Create section state manager using Svelte 5 runes
 */
export function createSectionState(letterType: string, initialExpanded: boolean = true) {
	// State using runes (reactive by default)
	let loadingOptions = $state(false);
	let uiInitialized = $state(false);
	let scrollAreaReady = $state(false);
	let isExpanded = $state(initialExpanded);
	let selectedPictograph = $state<PictographData | null>(null);
	let optionPickerWidth = $state<number | null>(null);
	let isGroupable = $state<boolean | null>(null);

	// Derived state
	const canLoadOptions = $derived(() => {
		return uiInitialized && scrollAreaReady && !loadingOptions;
	});

	const isReady = $derived(() => {
		return uiInitialized && scrollAreaReady;
	});

	// State management functions
	function setLoadingOptions(loading: boolean) {
		loadingOptions = loading;
	}

	function setUiInitialized(initialized: boolean) {
		uiInitialized = initialized;
	}

	function setScrollAreaReady(ready: boolean) {
		scrollAreaReady = ready;
	}

	function toggleExpanded() {
		isExpanded = !isExpanded;
	}

	function setExpanded(expanded: boolean) {
		isExpanded = expanded;
	}

	function setSelectedPictograph(pictograph: PictographData | null) {
		selectedPictograph = pictograph;
	}

	function updateOptionPickerWidth(width: number) {
		optionPickerWidth = width;
		// Update groupable state based on letter type
		isGroupable = ['Type4', 'Type5', 'Type6'].includes(letterType);
	}

	function resetState() {
		loadingOptions = false;
		selectedPictograph = null;
		// Keep UI initialization and expansion state
	}

	// Return reactive state and functions
	return {
		// Reactive state (getters)
		get loadingOptions() { return loadingOptions; },
		get uiInitialized() { return uiInitialized; },
		get scrollAreaReady() { return scrollAreaReady; },
		get isExpanded() { return isExpanded; },
		get selectedPictograph() { return selectedPictograph; },
		get optionPickerWidth() { return optionPickerWidth; },
		get isGroupable() { return isGroupable; },
		
		// Derived state
		get canLoadOptions() { return canLoadOptions; },
		get isReady() { return isReady; },
		
		// State management functions
		setLoadingOptions,
		setUiInitialized,
		setScrollAreaReady,
		toggleExpanded,
		setExpanded,
		setSelectedPictograph,
		updateOptionPickerWidth,
		resetState,
	};
}

/**
 * Create global option picker state using Svelte 5 runes
 */
export function createOptionPickerState() {
	// Global state
	let allPictographs = $state<PictographData[]>([]);
	let isLoading = $state(true);
	let loadingError = $state(false);
	let containerWidth = $state(800);
	let containerHeight = $state(600);
	let selectedPictograph = $state<PictographData | null>(null);

	// Section states for each letter type
	const sectionStates = new Map<string, ReturnType<typeof createSectionState>>();

	// Initialize section states
	function initializeSectionStates() {
		const letterTypes = ['Type1', 'Type2', 'Type3', 'Type4', 'Type5', 'Type6'];
		letterTypes.forEach(letterType => {
			if (!sectionStates.has(letterType)) {
				sectionStates.set(letterType, createSectionState(letterType));
			}
		});
	}

	// Get section state
	function getSectionState(letterType: string) {
		if (!sectionStates.has(letterType)) {
			sectionStates.set(letterType, createSectionState(letterType));
		}
		return sectionStates.get(letterType)!;
	}

	// Global state management
	function setAllPictographs(pictographs: PictographData[]) {
		allPictographs = pictographs;
	}

	function setLoading(loading: boolean) {
		isLoading = loading;
	}

	function setLoadingError(error: boolean) {
		loadingError = error;
	}

	function setContainerDimensions(width: number, height: number) {
		containerWidth = width;
		containerHeight = height;
		
		// Update all section states with new width
		sectionStates.forEach(sectionState => {
			sectionState.updateOptionPickerWidth(width);
		});
	}

	function setSelectedPictograph(pictograph: PictographData | null) {
		selectedPictograph = pictograph;
		
		// Update all section states
		sectionStates.forEach(sectionState => {
			sectionState.setSelectedPictograph(pictograph);
		});
	}

	function resetAllStates() {
		allPictographs = [];
		isLoading = true;
		loadingError = false;
		selectedPictograph = null;
		
		// Reset all section states
		sectionStates.forEach(sectionState => {
			sectionState.resetState();
		});
	}

	// Initialize section states
	initializeSectionStates();

	return {
		// Global reactive state
		get allPictographs() { return allPictographs; },
		get isLoading() { return isLoading; },
		get loadingError() { return loadingError; },
		get containerWidth() { return containerWidth; },
		get containerHeight() { return containerHeight; },
		get selectedPictograph() { return selectedPictograph; },
		
		// Section state management
		getSectionState,
		
		// Global state management
		setAllPictographs,
		setLoading,
		setLoadingError,
		setContainerDimensions,
		setSelectedPictograph,
		resetAllStates,
	};
}
