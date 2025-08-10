/**
 * OptionPickerStateManager - Based on reference desktop version
 *
 * Only contains the state that actually exists in the desktop reference
 */

import type { PictographData } from '$lib/domain/PictographData';

export class OptionPickerStateManager {
	// Data state (what's actually used)
	availableOptions = $state<PictographData[]>([]);
	filteredOptions = $state<PictographData[]>([]);
	selectedOption = $state<PictographData | null>(null);

	// Loading states (from reference desktop)
	isLoading = $state(true);
	loadingError = $state(false);
	isTransitioning = $state(false);
	optionsLoadedSuccessfully = $state(false);

	// Layout state (what's actually used)
	containerWidth = $state(800);
	containerHeight = $state(600);
	optionsPerRow = $state(4);
	optionSize = $state(150);

	// Simple validation methods (only what's actually used)
	canLoadOptions(): boolean {
		return !this.isLoading;
	}

	shouldPreventRedundantLoad(): boolean {
		return this.optionsLoadedSuccessfully && this.filteredOptions.length > 0;
	}

	resetState(): void {
		this.availableOptions = [];
		this.filteredOptions = [];
		this.selectedOption = null;
		this.isLoading = true;
		this.loadingError = false;
		this.isTransitioning = false;
		this.optionsLoadedSuccessfully = false;
	}
}
