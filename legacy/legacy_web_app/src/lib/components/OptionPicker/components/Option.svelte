<script lang="ts">
	import { getContext } from 'svelte'; // Import getContext
	import Pictograph from '../../Pictograph/Pictograph.svelte';
	import { writable } from 'svelte/store';
	import type { PictographData } from '$lib/types/PictographData';
	import { selectedPictograph } from '$lib/stores/sequence/selectedPictographStore';
	import { optionPickerStore } from '../store';
	import { LAYOUT_CONTEXT_KEY, type LayoutContext } from '../layoutContext'; // Import context key and type
	// REMOVED: import { onMount }

	// --- Props ---
	export let pictographData: PictographData;
	export let isPartOfTwoItems: boolean = false;

	// --- Consume context ---
	const layoutContext = getContext<LayoutContext>(LAYOUT_CONTEXT_KEY);
	$: isMobileDevice = $layoutContext.isMobile; // Get from context
	// Use the scale factor determined by the overall layout configuration
	$: scaleFactor = $layoutContext.layoutConfig.scaleFactor;

	// --- State (Removed internal state) ---
	// REMOVED: let isMobileDevice = false;
	// REMOVED: let containerWidth = 0;
	// REMOVED: let containerElement: HTMLElement;

	// --- Reactive Computations ---
	$: isSelected = $selectedPictograph === pictographData;
	$: ariaLabel = `Select option ${pictographData.letter || 'Unnamed'}`;

	// REMOVED: Internal getScaleFactor function
	// REMOVED: onMount logic for mobile detection and ResizeObserver

	function handleSelect() {
		optionPickerStore.selectOption(pictographData);
	}

	// Keep pictograph data up-to-date in its own store for the Pictograph component
	const pictographDataStore = writable(pictographData);
	$: pictographDataStore.set(pictographData);
</script>

<div
	class="option"
	class:mobile={isMobileDevice}
	class:selected={isSelected}
	class:two-item-option={isPartOfTwoItems}
	role="button"
	tabindex="0"
	on:click={handleSelect}
	on:keydown={(e) => e.key === 'Enter' && handleSelect()}
	aria-label={ariaLabel}
	aria-pressed={isSelected}
>
	<div class="pictograph-container" style="transform: scale({scaleFactor})">
		<Pictograph {pictographDataStore} />
	</div>
</div>

<style>
	/* Styles remain the same */
	.option {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		cursor: pointer;
		transition:
			transform 0.2s ease-in-out,
			background-color 0.2s ease;
		border-radius: 6px;
		outline: none;
	}
	.pictograph-container {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		transition: transform 0.2s ease-in-out;
	}
	/* In Option.svelte */
	.option:hover {
		transform: scale(1.1); /* Bump this up from 1.05 */
		background-color: rgba(243, 244, 246, 0.5);
		z-index: 20; /* Add this to ensure it rises above siblings */
	}
	.option:active {
		transform: scale(0.98);
	}
	.option.selected {
		background-color: rgba(56, 161, 105, 0.1);
	}
	.option.two-item-option {
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}
	.option.two-item-option:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}
	.option.mobile {
		transition: transform 0.15s ease-in-out;
	}
	.option.mobile:hover {
		transform: scale(1.03);
	}
	.option:focus-visible {
		box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.6);
		z-index: 11;
	}
</style>
