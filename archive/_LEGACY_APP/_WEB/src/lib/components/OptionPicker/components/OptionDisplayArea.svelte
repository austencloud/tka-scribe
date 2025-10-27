<script lang="ts">
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { PictographData } from '$lib/types/PictographData';

	import LoadingMessage from './messages/LoadingMessage.svelte';
	import EmptyMessage from './messages/EmptyMessage.svelte';
	import OptionsPanel from './OptionsPanel.svelte';

	// --- Props ---
	export let isLoading: boolean;
	export let selectedTab: string | null; // Can be 'all' or category key
	export let optionsToDisplay: PictographData[]; // The options relevant to the current view
	export let hasCategories: boolean; // Whether any categories actually exist

	// --- Display State ---
	$: hasOptions = optionsToDisplay.length > 0;

	// --- Message Logic ---
	$: messageType = determineMessageType(isLoading, hasOptions, selectedTab, hasCategories);
	$: messageText = generateMessageText(messageType, selectedTab);

	// --- Helper Functions ---
	function determineMessageType(
		loading: boolean,
		optionsExist: boolean,
		tab: string | null,
		categoriesExist: boolean
	): 'loading' | 'empty' | 'initial' | null {
		if (loading) return 'loading';
		if (!optionsExist) {
			if (tab) return 'empty';
			if (!tab && categoriesExist) return 'initial'; // Show "Select category"
			return 'empty'; // Default to empty
		}
		return null; // Options exist, no message needed
	}

	function generateMessageText(
		type: 'loading' | 'empty' | 'initial' | null,
		tab: string | null
	): string {
		if (type === 'empty') {
			if (tab === 'all') return 'No options match current filters.'; // Message for 'all' view
			if (tab) return `No options available for ${tab}.`; // Message for specific category
			return 'No options generated.'; // Generic fallback
		}
		if (type === 'initial') {
			return 'Select a category above...'; // Should be less common now
		}
		return ''; // No message text needed
	}
</script>

<div class="option-display-area">
	{#if messageType === 'loading'}
		<div class="message-container">
			<LoadingMessage />
		</div>
	{:else if hasOptions}
		<div class="panels-container">
			{#key selectedTab}
				<div class="panel-wrapper"
					in:fade={{ duration: 200, easing: cubicOut }}
					out:fade={{ duration: 120, easing: cubicOut }}>
					<OptionsPanel options={optionsToDisplay} selectedTab={selectedTab} />
				</div>
			{/key}
		</div>
	{:else if messageType === 'empty' || messageType === 'initial'}
		<div class="message-container">
			<EmptyMessage type={messageType} message={messageText} />
		</div>
	{/if}
</div>

<style>
	.option-display-area {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden; /* Keep overflow hidden */
	}

	.panels-container {
		width: 100%;
		height: 100%;
		position: relative; /* Positioning context for absolute children */
		overflow: hidden; /* Keep overflow hidden */
	}

	.panel-wrapper {
		position: absolute; /* Absolute positioning is KEY */
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: auto; /* Ensure interaction */
		/* background-color: #fff; /* Optional: Add background to prevent seeing through during fade */
	}

	.message-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 5; /* Ensure messages are above panels if needed */
		pointer-events: none; /* Messages shouldn't block interaction */
	}
</style>
