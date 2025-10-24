<script lang="ts">
	// REMOVED: onMount, tick, resize action imports are no longer needed
	import { getContext, createEventDispatcher } from 'svelte';
	import { LAYOUT_CONTEXT_KEY, type LayoutContext } from '../layoutContext';
	import ViewControl from './ViewControl.svelte';
	import type { ViewModeDetail } from './ViewControl.svelte';

	// --- Props ---
	export let selectedTab: string | null;
	export let categoryKeys: string[] = [];
	export let showTabs: boolean = false;

	// --- Context ---
	const layoutContext = getContext<LayoutContext>(LAYOUT_CONTEXT_KEY);
	// Directly use the isMobile flag from the context
	$: isMobileDevice = $layoutContext.isMobile;

	// --- Local State ---
	// REMOVED: tabsContainerElement is no longer needed
	// CHANGED: useShortLabels is now directly derived from isMobileDevice
	$: useShortLabels = isMobileDevice;

	// --- Events ---
	const dispatch = createEventDispatcher<{
		viewChange: ViewModeDetail;
		tabSelect: string;
	}>();

	// --- Event Handlers & Helpers ---
	function handleViewChange(event: CustomEvent<ViewModeDetail>) {
		dispatch('viewChange', event.detail);
	}

	function handleTabClick(categoryKey: string) {
		dispatch('tabSelect', categoryKey);
	}

	// --- Mappings for Labels (Keep these) ---
	const longLabels: Record<string, string> = {
		Type1: 'Type 1',
		Type2: 'Type 2',
		Type3: 'Type 3',
		Type4: 'Type 4',
		Type5: 'Type 5',
		Type6: 'Type 6',
		'Unknown Type': 'Unknown',
		alpha: 'Alpha',
		beta: 'Beta',
		gamma: 'Gamma',
		Continuous: 'Continuous',
		'One Reversal': 'One Reversal',
		'Two Reversals': 'Two Reversals'
	};
	const shortLabels: Record<string, string> = {
		Type1: '1',
		Type2: '2',
		Type3: '3',
		Type4: '4',
		Type5: '5',
		Type6: '6',
		'Unknown Type': '?',
		alpha: 'α',
		beta: 'β',
		gamma: 'γ',
		Continuous: 'Cont.',
		'One Reversal': '1 Rev',
		'Two Reversals': '2 Rev'
	};

	// --- Formatting Functions (Keep these) ---
	function formatTabName(key: string): string {
		if (!key) return '';
		return (
			longLabels[key] ||
			key
				.replace(/([A-Z])/g, ' $1')
				.trim()
				.replace(/^\w/, (c) => c.toUpperCase())
		);
	}
	function formatShortTabName(key: string): string {
		if (!key) return '';
		return shortLabels[key] || formatTabName(key);
	}

	// REMOVED: handleTabsResize function is no longer needed
	// REMOVED: Reactive dependency on categoryKeys for resize is no longer needed
	// REMOVED: onMount is no longer needed
</script>

<div class="option-picker-header" class:mobile={isMobileDevice} data-testid="option-picker-header">
	<div class="header-content">
		{#if showTabs && categoryKeys.length > 0}
			<div class="tabs" role="tablist" aria-label="Option Categories">
				{#each categoryKeys as categoryKey (categoryKey)}
					<button
						class="tab"
						class:active={selectedTab === categoryKey}
						on:click={() => handleTabClick(categoryKey)}
						role="tab"
						aria-selected={selectedTab === categoryKey}
						aria-controls={`options-panel-${categoryKey}`}
						id="tab-{categoryKey}"
						title={formatTabName(categoryKey)}
					>
						{useShortLabels ? formatShortTabName(categoryKey) : formatTabName(categoryKey)}
					</button>
				{/each}
			</div>
		{:else if showTabs}
			<div class="tabs-placeholder">
				<span class="no-categories-message">No sub-categories</span>
			</div>
		{:else}
			<div class="tabs-placeholder">
				<div class="helper-message">Showing all - filter to see sections ➡️</div>
			</div>
		{/if}

		<div class="view-controls">
			<ViewControl {selectedTab} on:viewChange={handleViewChange} />
		</div>
	</div>
</div>

<style>
	/* Styles remain largely the same, but comments related to resize logic can be removed */
	.option-picker-header {
		width: 100%;
		position: relative;
		margin-bottom: 0.5rem;
		padding-bottom: 0.5rem;
		padding-top: 8px;
		min-height: auto;
		box-sizing: border-box;
	}

	.option-picker-header.mobile {
		padding-top: 4px;
		margin-bottom: 0.3rem;
	}

	.header-content {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		flex-wrap: nowrap;
		gap: 12px;
		/* No overflow hidden needed here */
	}

	.view-controls {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		margin-left: auto;
	}

	.tabs {
		display: flex;
		justify-content: flex-start;
		/* Allow wrapping by default, mobile styles might override */
		flex-wrap: wrap;
		gap: 4px 8px;
		padding: 0;
		margin: 0;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
		min-width: 50px;
	}

	.tabs-placeholder {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-grow: 1;
		flex-shrink: 1;
		flex-basis: 0;
		min-width: 50px;
		min-height: 30px;
	}

	.tab {
		background: transparent;
		border: none;
		padding: clamp(0.5rem, 1vw, 0.7rem) clamp(0.8rem, 1.2vw, 1.2rem);
		cursor: pointer;
		font-weight: 500;
		font-size: clamp(0.9rem, 2vw, 1.05rem);
		color: white;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
		white-space: nowrap;
		flex-shrink: 0; /* Tabs don't shrink */
		border-radius: 8px;
		margin: 0 2px 2px 2px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 25px;
		max-width: 180px;
	}

	.tab.active {
		background: #0f172a;
		color: #38bdf8;
		font-weight: 600;
		box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.3);
	}

	.tab:hover:not(.active) {
		background: #172033;
		color: #cbd5e1;
	}

	.tab:focus-visible {
		outline: 2px solid #60a5fa;
		outline-offset: 1px;
		background-color: rgba(59, 130, 246, 0.1);
	}

	.helper-message {
		color: white;
		font-style: italic;
		font-size: 1rem;
		text-align: center;
		padding: clamp(0.4rem, 1vw, 0.6rem);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.no-categories-message {
		color: #94a3b8;
		font-style: italic;
		padding: clamp(0.4rem, 1vw, 0.6rem) clamp(0.8rem, 1.5vw, 1.2rem);
		white-space: nowrap;
		text-align: center;
	}

	/* --- Mobile Responsiveness --- */
	@media (max-width: 640px) {
		.header-content {
			flex-direction: row;
			align-items: stretch;
			/* gap: 8px; */
			width: 100%;
		}

		.tabs-placeholder .no-categories-message {
			flex-grow: 0;
		}

		.tabs,
		.tabs-placeholder {
			/* justify-content: center; */
			flex-wrap: wrap; /* Ensure wrapping */
			margin-bottom: 8px;
			/* flex-grow: 0; */
			order: 1;
		}

		/* Tab shrinking is already 0, so no change needed here for mobile */

		.view-controls {
			margin-left: 0;
			order: 2;
		}
	}
</style>
