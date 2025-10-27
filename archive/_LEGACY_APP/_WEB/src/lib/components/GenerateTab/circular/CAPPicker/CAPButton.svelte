<!-- src/lib/components/GenerateTab/circular/CAPPicker/CAPButton.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props with type definition
	export let capType: {
		id: string;
		label: string;
		description: string;
	};
	export let selected = false;

	// Event dispatcher for selection
	const dispatch = createEventDispatcher<{
		select: void;
	}>();

	// Handle button click
	function handleClick() {
		dispatch('select');
	}
</script>

<button class="cap-button" class:selected on:click={handleClick} title={capType.description}>
	<div class="cap-button-content">
		<span class="cap-label">{capType.label}</span>
		{#if selected}
			<span class="selected-indicator">✓</span>
		{/if}
	</div>
</button>

<style>
	.cap-button {
		background: var(--color-surface, rgba(30, 40, 60, 0.85));
		border: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
		color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
		border-radius: 0.25rem;
		padding: 0.75rem 1rem;
		width: 100%;
		text-align: left;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.cap-button:hover {
		background: var(--color-surface-hover, rgba(255, 255, 255, 0.05));
		border-color: var(--color-border-hover, rgba(255, 255, 255, 0.2));
	}

	.cap-button.selected {
		background: var(--color-accent, #3a7bd5);
		color: white;
		border-color: var(--color-accent-hover, #2a5298);
	}

	.cap-button-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}

	.cap-label {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.selected-indicator {
		font-size: 0.75rem;
		margin-left: 0.5rem;
	}
</style>
