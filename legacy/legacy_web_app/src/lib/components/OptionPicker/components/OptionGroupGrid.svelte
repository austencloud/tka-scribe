<script lang="ts">
	import { getContext } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { quintOut, cubicOut } from 'svelte/easing';
	import Option from './Option.svelte';
	import type { PictographData } from '$lib/types/PictographData';
	import { LAYOUT_CONTEXT_KEY, type LayoutContext } from '../layoutContext';
	import { uiState } from '../store';
	import { flip } from 'svelte/animate';

	// --- Props ---
	export let options: PictographData[] = [];

	// --- Context ---
	const layoutContext = getContext<LayoutContext>(LAYOUT_CONTEXT_KEY);
	// Get layout config from context, renaming gridColumns to avoid conflict
	$: ({ gridColumns: contextGridColumns, optionSize, gridGap, gridClass, aspectClass } = $layoutContext.layoutConfig);
	$: isMobileDevice = $layoutContext.isMobile;
	$: isTabletDevice = $layoutContext.isTablet;
	$: isPortraitMode = $layoutContext.isPortrait;

	// --- Get Sort Method from Store ---
	let currentSortMethod: string | null;
	uiState.subscribe((state) => {
		currentSortMethod = state.sortMethod;
	});

	// --- Layout Overrides for Single/Two Items ---
	// Determine if special single/two item styling should apply based on sorting context
	$: isTypeSortContext = currentSortMethod === 'type';
	$: applySingleItemClass = options.length === 1 && isTypeSortContext;
	$: applyTwoItemClass = options.length === 2 && isTypeSortContext;

	// Override grid columns if only one or two items are present in this specific grid
	$: actualGridColumns =
		options.length === 1
			? '1fr' // Force single column for single item
			: options.length === 2
				? 'repeat(2, 1fr)' // Force two columns for two items
				: contextGridColumns; // Use the layout context's column definition otherwise

</script>

<div
	class="options-grid {gridClass} {aspectClass}"
	class:single-item-grid={applySingleItemClass}
	class:two-item-grid={applyTwoItemClass}
	class:mobile-grid={isMobileDevice}
	class:tablet-grid={isTabletDevice}
	class:tablet-portrait-grid={isTabletDevice && isPortraitMode}
	style:grid-template-columns={actualGridColumns} 
	style:--grid-gap={gridGap}
	style:--option-size={optionSize}
	in:fade={{ duration: 200, easing: cubicOut }}
	out:fade={{ duration: 150, easing: cubicOut }}
>
	{#each options as option, i ((option.letter ?? '') + (option.startPos ?? '') + (option.endPos ?? '') + i)}
		<div
			class="grid-item-wrapper"
			class:single-item={applySingleItemClass}
			class:two-item={applyTwoItemClass}
			in:scale={{ 
				start: 0.92, 
				opacity: 0, 
				duration: 250, 
				delay: Math.min(i * 20, 100), // Stagger effect with a reasonable maximum
				easing: quintOut 
			}}
			out:fade={{ duration: 100 }}
			animate:flip={{ duration: 300 }}
		>
			<Option pictographData={option} isPartOfTwoItems={applyTwoItemClass} />
		</div>
	{/each}
</div>

<style>
	/* --- Options Grid (Applied per group) --- */
	.options-grid {
		display: grid;
		width: auto;
		max-width: max-content; /* Fit the content */
		justify-items: center; /* Center items horizontally within their grid cell */
		justify-content: center; /* Center the grid content horizontally if grid is wider */
		align-content: center; /* Center grid content vertically */
		grid-gap: var(--grid-gap, 8px); /* Use gap from layout context */
		/* Add auto margins for horizontal centering within parent */
		margin-left: auto;
		margin-right: auto;
		/* Add some bottom margin for spacing between groups */
		margin-bottom: 1rem;
	}

	/* Add top margin only if it's NOT part of a multi-group item */
	:global(.options-panel > .options-grid) {
		margin-top: 0.5rem; /* Adjust as needed */
	}
	/* Remove extra top margin if it directly follows a header in single layout */
	:global(.options-panel > .section-header-container + .options-grid) {
		margin-top: 0;
	}


	/* --- Grid Item Wrapper --- */
	.grid-item-wrapper {
		width: var(--option-size, 100px); /* Use size from layout context */
		height: var(--option-size, 100px);
		aspect-ratio: 1 / 1; /* Maintain square aspect ratio */
		display: flex;
		justify-content: center;
		align-items: center;
		position: relative; /* For z-index */
		z-index: 1;
		transition: z-index 0s 0.2s; /* Delay z-index change */
	}
	.grid-item-wrapper:hover {
		z-index: 10; /* Bring hovered item to front */
		transition-delay: 0s;
	}


	/* --- Responsive Grid Adjustments (Applied based on context) --- */
	.mobile-grid {
		padding: 0.2rem;
		grid-gap: var(--grid-gap, 6px); /* Potentially smaller gap on mobile */
	}

	.tablet-portrait-grid {
		grid-gap: 0.5rem;
		padding: 0.25rem;
	}
</style>