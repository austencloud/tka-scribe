<script context="module" lang="ts">
	export type ViewModeDetail =
		| { mode: 'all' }
		| { mode: 'group'; method: SortMethod };
</script>

<script lang="ts">
	import { getContext, createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { clickOutside } from '$lib/actions/clickOutside';
	import type { SortMethod } from '../config';
	import { uiState } from '../store';
	import { LAYOUT_CONTEXT_KEY, type LayoutContext } from '../layoutContext';

	export let selectedTab: string | null;

	const layoutContext = getContext<LayoutContext>(LAYOUT_CONTEXT_KEY);
	$: isMobileDevice = $layoutContext.isMobile;

	let isOpen = false;
	let buttonRef: HTMLElement;

	const viewOptions = [
		{ value: 'all', label: 'All', icon: '✨', isSortMethod: false },
		{ value: 'type', label: 'Type', icon: '📁', isSortMethod: true },
		{ value: 'endPosition', label: 'End Position', icon: '🏁', isSortMethod: true },
		{ value: 'reversals', label: 'Reversals', icon: '🔄', isSortMethod: true }
	] as const;

	$: currentViewValue = selectedTab === 'all' ? 'all' : $uiState.sortMethod;
	$: selectedViewOption =
		viewOptions.find((opt) => opt.value === currentViewValue) || viewOptions[0];

	const dispatch = createEventDispatcher<{ viewChange: ViewModeDetail }>();

	const toggleDropdown = () => (isOpen = !isOpen);
	const closeDropdown = () => isOpen && (isOpen = false);

	function handleViewSelect(option: (typeof viewOptions)[number]) {
		if (option.value === 'all') {
			dispatch('viewChange', { mode: 'all' });
		} else if (option.isSortMethod) {
			const method = option.value as SortMethod;
			dispatch('viewChange', { mode: 'group', method: method });
		}
		closeDropdown();
	}
</script>

<div class="view-control" use:clickOutside={closeDropdown} data-testid="view-control">
	<button
		class="view-button"
		bind:this={buttonRef}
		on:click={toggleDropdown}
		aria-label="Change view mode"
		aria-expanded={isOpen}
		aria-haspopup="listbox"
	>
		<span class="view-icon" aria-hidden="true">{selectedViewOption.icon}</span>
		<span class="dropdown-arrow" aria-hidden="true">{isOpen ? '▲' : '▼'}</span>
	</button>

	{#if isOpen}
		<div
			class="dropdown"
			transition:fade={{ duration: 150, easing: quintOut }}
			role="listbox"
			aria-label="View options"
		>
			{#each viewOptions as option (option.value)}
				<button
					class="dropdown-item"
					class:selected={selectedViewOption.value === option.value}
					on:click={() => handleViewSelect(option)}
					role="option"
					aria-selected={selectedViewOption.value === option.value}
				>
					<span class="option-icon" aria-hidden="true">{option.icon}</span>
					<span class="option-text">{option.label}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.view-control {
		display: inline-block;
		position: relative;
		font-size: 1.1rem; /* Slightly larger base font size */
	}

	.view-button {
		display: flex;
		align-items: center;
		gap: 6px; /* Increased gap */
		background-color: #ffffff;
		border: 1px solid #d1d5db;
		border-radius: 8px; /* More rounded corners */
		padding: 8px 10px; /* Increased padding */
		font-size: 1rem; /* Increased font size */
		font-weight: 500;
		color: #374151;
		cursor: pointer;
		box-shadow: 0 2px 3px rgba(0, 0, 0, 0.06); /* Slightly stronger shadow */
		transition:
			background-color 0.2s ease,
			box-shadow 0.2s ease,
			border-color 0.2s ease;
		white-space: nowrap;
	}

	.view-button:hover {
		background-color: #f9fafb;
		border-color: #adb5bd;
		box-shadow: 0 3px 5px rgba(0, 0, 0, 0.08); /* Slightly stronger shadow on hover */
	}

	.view-button:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 1px;
		border-color: #3b82f6;
	}

	.view-icon {
		font-size: 1.2em;
		line-height: 1;
	}

	.dropdown-arrow {
		font-size: 0.8em;
		opacity: 0.8;
		margin-left: 4px; /* Increased margin */
	}

	.dropdown {
		position: absolute;
		top: calc(100% + 8px); /* Increased spacing */
		right: 0;
		background-color: white;
		border-radius: 8px; /* More rounded corners */
		border: 1px solid #e2e8f0;
		box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12); /* Slightly stronger shadow */
		min-width: 200px; /* Increased min-width */
		width: max-content;
		z-index: 100;
		overflow: hidden;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 10px; /* Increased gap */
		width: 100%;
		text-align: left;
		padding: 12px 16px; /* Increased padding */
		border: none;
		background: none;
		cursor: pointer;
		font-size: 1.05rem; /* Increased font size */
		color: #374151;
		transition: background-color 0.15s ease;
	}

	.dropdown-item:hover {
		background-color: #f1f5f9;
	}

	.dropdown-item.selected {
		background-color: #e0f2fe;
		font-weight: 600;
		color: #0c4a6e;
	}

	.dropdown-item:focus-visible {
		background-color: #f1f5f9;
		outline: none;
	}

	.option-icon {
		font-size: 1.3rem;
		width: 1.4em;
		text-align: center;
		line-height: 1;
		color: #6b7280;
	}

	.dropdown-item.selected .option-icon {
		color: #0c4a6e;
	}

	.option-text {
		flex-grow: 1;
	}
</style>