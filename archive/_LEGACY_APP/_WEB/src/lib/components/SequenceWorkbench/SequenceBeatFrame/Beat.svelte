<!-- src/lib/components/SequenceWorkbench/SequenceBeatFrame/Beat.svelte -->
<script lang="ts">
	import { writable } from 'svelte/store';
	import Pictograph from '$lib/components/Pictograph/Pictograph.svelte';
	import type { BeatData } from './BeatData';

	export let beat: BeatData;
	export let onClick: () => void;

	// Create a local pictograph data store
	const pictographDataStore = writable(beat.pictographData);
	

	
	// This is important: update the store whenever the beat's pictograph data changes
	$: {
		if (beat.pictographData) {

			pictographDataStore.set(beat.pictographData);
		}
	}
	
	// Handle the click event once at this level
	function handleClick(event: MouseEvent) {
		// Prevent the event from propagating to avoid double-handling
		event.stopPropagation();
		onClick();
	}
</script>

<button
	class="beat"
	class:filled={beat.filled}
	on:click={handleClick}
	aria-label={`Beat ${beat.beatNumber}`}
>
	<Pictograph 
		pictographDataStore={pictographDataStore} 
	/>
</button>

<style>
	.beat {
		width: 100%;
		height: 100%;
		background-color: transparent;
		border: none;
		padding: 0;
		margin: 0;
		cursor: pointer;
		transition: transform 0.2s ease;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 4px;
	}

	.beat:hover {
		transform: scale(1.05);
	}

	.beat:active {
		transform: scale(0.95);
	}
	
	.filled {
		box-shadow: 0 0 8px transparent
	}
</style>