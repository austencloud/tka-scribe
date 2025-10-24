<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ActionButton from './ActionButton.svelte';
	import type { ButtonDefinition } from '../types';
	import { panelStore } from '../stores/panelStore';
	
	// Props
	export let buttons: ButtonDefinition[];
	export let buttonSize: number;
	
	// Get state from store
	let { isVisible, isAnimatingOut, layout } = $panelStore;
	
	// Event dispatcher
	const dispatch = createEventDispatcher<{
		action: { id: string };
	}>();
	
	// Handle button click
	function handleButtonClick(event: CustomEvent<{ id: string }>) {
		dispatch('action', { id: event.detail.id });
	}
</script>

<div 
	class="buttons-wrapper" 
	class:vertical={layout === 'vertical'}
	class:visible={isVisible}
	class:animating-out={isAnimatingOut}
>
	{#if isVisible}
		{#each buttons as button, i (button.id)}
			<ActionButton 
				{button} 
				{buttonSize} 
				index={i} 
				on:click={handleButtonClick} 
			/>
		{/each}
	{/if}
</div>

<style>
	/* Button groups container */
	.buttons-wrapper {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px;
		transition: all 0.3s ease;
	}
	
	.buttons-wrapper.vertical {
		flex-direction: column;
	}
	
	.buttons-wrapper:not(.visible) {
		opacity: 0;
		pointer-events: none;
		width: 0;
		height: 0;
		padding: 0;
		margin: 0;
	}
</style>