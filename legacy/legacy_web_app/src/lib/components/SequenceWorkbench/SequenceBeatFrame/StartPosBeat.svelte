<!-- src/lib/components/SequenceWorkbench/SequenceBeatFrame/StartPosBeat.svelte -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Beat from './Beat.svelte';
	import type { BeatData } from './BeatData';
	import { defaultPictographData } from '$lib/components/Pictograph/utils/defaultPictographData';
	import { selectedStartPos } from '$lib/stores/sequence/selectionStore';
	import { writable } from 'svelte/store';

	export let beatData: BeatData;
	export let onClick: () => void;



	// Create a local store for the pictograph data for the Pictograph component
	const pictographStore = writable(beatData.pictographData);
	
	// Subscribe to the selectedStartPos store directly from the global store
	const unsubscribeStartPos = selectedStartPos.subscribe((startPos) => {
		
		if (startPos) {
			// Update the local pictograph data when the start position changes

			
			pictographStore.set(startPos);
			
			// Also update the beat data directly
			beatData = {
				...beatData,
				pictographData: startPos,
				filled: true
			};
		} else {
			
			// If no start position is set, use default data
			pictographStore.set(defaultPictographData);
			
			// Update the beat data accordingly
			beatData = {
				...beatData,
				pictographData: defaultPictographData,
				filled: false
			};
		}
	});
	
	// Listen for the custom event as an alternative way to receive updates
	onMount(() => {
		const handleStartPosSelectedEvent = (event: CustomEvent) => {
			
			if (event.detail?.startPosition) {
				const newStartPos = event.detail.startPosition;
				
				// Update the pictograph store with the new data
				pictographStore.set(newStartPos);
				
				// Update the beat data
				beatData = {
					...beatData,
					pictographData: newStartPos,
					filled: true
				};
				

			}
		};
		
		// Add event listener
		document.addEventListener('start-position-selected', handleStartPosSelectedEvent as EventListener);
		
		return () => {
			// Clean up event listener
			document.removeEventListener('start-position-selected', handleStartPosSelectedEvent as EventListener);
		};
	});
	
	// Clean up subscription when component is destroyed
	onDestroy(() => {
		unsubscribeStartPos();
	});

	// Handle clicks at this level to prevent multiple event handlers
	function handleContainerClick(event: MouseEvent) {
		// Only handle clicks directly on the container, not on children
		if (event.target === event.currentTarget) {
			onClick();
		}
	}
</script>

<button class="start-pos-beat" on:click={handleContainerClick} type="button">
	<Beat beat={beatData} {onClick} />
</button>

<style>
	.start-pos-beat {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 8px;
		background-color: transparent	;
		border:none;

	}
</style>