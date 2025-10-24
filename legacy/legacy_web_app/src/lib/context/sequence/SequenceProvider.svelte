<script lang="ts">
	import { onMount } from 'svelte';
	import { createSequenceContext } from './sequenceContext';
	import { selectedStartPos } from '$lib/stores/sequence/selectionStore';
	import { startPositionStore } from '$lib/stores/sequence/sequenceActions';
	
	// Create the sequence context
	const { state, dispatch } = createSequenceContext();
	
	// Subscribe to the selectedStartPos from selectionStore to keep startPosition in sync
	const unsubscribeStartPos = selectedStartPos.subscribe(startPos => {
	  if (startPos) {
		$state.startPosition = startPos;
	  }
	});
	
	// Also subscribe to startPositionStore from sequenceActions
	const unsubscribeStartPosStore = startPositionStore.subscribe(startPos => {
	  if (startPos) {
		$state.startPosition = startPos;
	  }
	});
	
	onMount(() => {
	  // Clean up subscriptions when the component is destroyed
	  return () => {
		unsubscribeStartPos();
		unsubscribeStartPosStore();
	  };
	});
  </script>
  
  <slot></slot>