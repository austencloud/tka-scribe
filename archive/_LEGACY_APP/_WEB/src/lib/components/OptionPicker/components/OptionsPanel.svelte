<script lang="ts">
	// Script remains the same as options-panel-dynamic-rows-v2
	import { getContext, onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { PictographData } from '$lib/types/PictographData';
	import { LAYOUT_CONTEXT_KEY, type LayoutContext } from '../layoutContext';
	import { uiState } from '../store';
	import { determineGroupKey, getSortedGroupKeys } from '../services/OptionsService';
	import type { SortMethod } from '../config';
	import { resize } from '../actions/resize';

	import SectionHeader from './SectionHeader.svelte';
	import OptionGroupGrid from './OptionGroupGrid.svelte';

	type LayoutRow = {
		type: 'single' | 'multi';
		groups: Array<{ key: string; options: PictographData[] }>;
	};

	export let selectedTab: string | null = null;
	export let options: PictographData[] = [];

	let currentSortMethod: SortMethod;
	let panelElement: HTMLElement;
	let contentIsShort = false;
	let layoutRows: LayoutRow[] = [];

	const MAX_ITEMS_FOR_SMALL_GROUP = 2;

	uiState.subscribe((state) => {
		currentSortMethod = state.sortMethod;
	});

	$: groupedOptions = (() => {
		const subGroups: Record<string, PictographData[]> = {};
		options.forEach((option) => {
			// Ensure 'type' is used for grouping within OptionsPanel, regardless of the main sort method
			const groupKey = determineGroupKey(option, 'type');
			if (!subGroups[groupKey]) subGroups[groupKey] = [];
			subGroups[groupKey].push(option);
		});
		return subGroups;
	})();

	// Ensure keys are sorted according to 'type' logic
	$: sortedGroupKeys = getSortedGroupKeys(Object.keys(groupedOptions), 'type');

	$: layoutRows = (() => {
		const rows: LayoutRow[] = [];
		let i = 0;
		while (i < sortedGroupKeys.length) {
			const currentKey = sortedGroupKeys[i];
			const currentOptions = groupedOptions[currentKey];
			if (!currentOptions || currentOptions.length === 0) {
				i++;
				continue;
			}
			const isCurrentSmall = currentOptions.length <= MAX_ITEMS_FOR_SMALL_GROUP;

			if (isCurrentSmall) {
				const smallGroupSequence = [{ key: currentKey, options: currentOptions }];
				let j = i + 1;
				while (j < sortedGroupKeys.length) {
					const nextKey = sortedGroupKeys[j];
					const nextOptions = groupedOptions[nextKey];
					if (
						nextOptions &&
						nextOptions.length > 0 &&
						nextOptions.length <= MAX_ITEMS_FOR_SMALL_GROUP
					) {
						smallGroupSequence.push({ key: nextKey, options: nextOptions });
						j++;
					} else {
						break;
					}
				}
				if (smallGroupSequence.length >= 2) {
					rows.push({ type: 'multi', groups: smallGroupSequence });
					i = j;
				} else {
					rows.push({ type: 'single', groups: smallGroupSequence });
					i++;
				}
			} else {
				rows.push({ type: 'single', groups: [{ key: currentKey, options: currentOptions }] });
				i++;
			}
		}
		return rows;
	})();

	async function checkContentHeight() {
		await tick();
		if (!panelElement) return;
		const fits = panelElement.scrollHeight <= panelElement.clientHeight;
		if (fits !== contentIsShort) {
			contentIsShort = fits;
		}
	}

	$: options, checkContentHeight();
	onMount(checkContentHeight);
</script>

<div
	class="options-panel"
	bind:this={panelElement}
	use:resize={checkContentHeight}
	class:vertically-center={contentIsShort}
	role="tabpanel"
	aria-labelledby="tab-{selectedTab}"
	id="options-panel-{selectedTab}"
>
	{#each layoutRows as row, rowIndex}
		{#if row.type === 'single'}
			{#each row.groups as group}
				<SectionHeader groupKey={group.key} isFirstHeader={rowIndex === 0} />
				<OptionGroupGrid options={group.options} />
			{/each}
		{:else if row.type === 'multi'}
			<div class="multi-group-row">
				{#each row.groups as group, groupIndex}
					<div class="multi-group-item">
						<SectionHeader
							groupKey={group.key}
							isFirstHeader={rowIndex === 0 && groupIndex === 0}
						/>
						<OptionGroupGrid options={group.options} />
					</div>
				{/each}
			</div>
		{/if}
	{/each}
</div>


<style>
	.options-panel {
		display: flex;
		flex-direction: column;
		/* align-items: center; */ /* Removed */
		justify-content: flex-start;
		position: absolute; /* Let the wrapper handle positioning */
		width: 100%;
		height: 100%;
		padding: 1rem 0.5rem 2rem 0.5rem;
		box-sizing: border-box;
		overflow-y: auto; /* Keep scrolling */
		overflow-x: hidden;

		top: 0;
		left: 0;
		transition: justify-content 0.2s ease-out;
	}

	.options-panel.vertically-center {
		justify-content: center;
	}

	.multi-group-row {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		/* FIXED: Use space-evenly for equal spacing */
		justify-content: space-evenly;
		align-items: flex-start;
		/* REMOVED: gap is handled by space-evenly */
		/* gap: 1rem 2rem; */
		width: 100%;
		margin-top: 16px;
		margin-bottom: 10px;
	}

	.multi-group-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		/* flex: 1 1 0%; */ /* Keep commented out unless needed */
		min-width: 120px;
	}

	/* --- Scrollbar Styles --- */
	.options-panel::-webkit-scrollbar {
		width: 6px;
	}
	.options-panel::-webkit-scrollbar-track {
		background: rgba(30, 41, 59, 0.3);
		border-radius: 3px;
	}
	.options-panel::-webkit-scrollbar-thumb {
		background-color: rgba(100, 116, 139, 0.7);
		border-radius: 3px;
	}
	.options-panel::-webkit-scrollbar-thumb:hover {
		background-color: rgba(148, 163, 184, 0.8);
	}
</style>
