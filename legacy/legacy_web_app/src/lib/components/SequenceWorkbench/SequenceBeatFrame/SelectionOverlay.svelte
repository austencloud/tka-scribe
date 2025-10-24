<!-- src/lib/components/SequenceWorkbench/SequenceBeatFrame/SelectionOverlay.svelte -->
<script lang="ts">
	export let isSelected: boolean = false;
</script>

{#if isSelected}
	<div class="overlay selected"></div>
{:else}
	<div class="overlay"></div>
{/if}

<style>
	.overlay {
		position: absolute;
		inset: 0;
		border: 3px solid transparent;
		pointer-events: none; /* Important - this lets events pass through */
		transition: border-color 0.3s ease-in-out;
	}

	.selected {
		border-color: gold;
		box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
	}
</style>