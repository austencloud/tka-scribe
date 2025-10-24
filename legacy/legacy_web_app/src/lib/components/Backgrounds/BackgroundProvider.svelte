<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { setBackgroundContext } from './contexts/BackgroundContext';
	import type { BackgroundType, QualityLevel } from './types/types';
	
	// Define props with defaults
	export let backgroundType: BackgroundType = 'snowfall';
	export let initialQuality: QualityLevel | undefined = undefined;
	export let isLoading: boolean = false;
	
	// Set up the context
	const backgroundContext = setBackgroundContext();
	
	// Initialize background type
	$: if (backgroundType) {
		backgroundContext.setBackgroundType(backgroundType);
	}
	
	// Initialize quality if provided
	onMount(() => {
		if (initialQuality) {
			backgroundContext.setQuality(initialQuality);
		}
		
		backgroundContext.setLoading(isLoading);
	});
	
	// Update loading state when it changes
	$: backgroundContext.setLoading(isLoading);
	
	// Clean up on destroy
	onDestroy(() => {
		backgroundContext.cleanup();
	});
</script>

<slot />