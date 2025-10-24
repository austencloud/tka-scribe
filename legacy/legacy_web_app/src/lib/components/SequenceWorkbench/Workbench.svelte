<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import SequenceWidget from './SequenceWidget.svelte';
	import GraphEditor from './GraphEditor/GraphEditor.svelte';
	import GraphEditorToggleTab from './GraphEditor/GraphEditorToggleTab.svelte';
	import SequenceProvider from '$lib/context/sequence/SequenceProvider.svelte';
	import { useResizeObserver } from '$lib/composables/useResizeObserver';
	// No need for 'browser' import if only using onMount

	// Constants
	const EDITOR_HEIGHT_PERCENTAGE = 0.25; // 25% of viewport height
	const ANIMATION_DURATION = 300; // In milliseconds

	// UI state
	const graphEditorExpanded = writable(false);
	let computedEditorHeight = 0; // Default height for SSR

	// Element size tracking with our composable hook
	// Ensure useResizeObserver itself is SSR-safe (likely returns default 0/0 dimensions on server)
	const { size, resizeObserver } = useResizeObserver();

	// Compute dynamic values based on reactive state
	$: sequenceWorkbenchHeight = $size.height; // Assumes $size is SSR-safe (e.g., 0)
	$: isExpanded = $graphEditorExpanded;

	// REMOVE the problematic reactive statement:
	// $: computedEditorHeight = Math.floor(window.innerHeight * EDITOR_HEIGHT_PERCENTAGE);

	// Event handlers
	function toggleGraphEditor() {
		graphEditorExpanded.update((value) => !value);
	}

	// Lifecycle
	onMount(() => {
		// Calculate initial editor height only in the browser
		computedEditorHeight = Math.floor(window.innerHeight * EDITOR_HEIGHT_PERCENTAGE);

		// Optional: Add a resize listener if you need computedEditorHeight
		// to update based on window.innerHeight specifically,
		// otherwise rely on the resizeObserver for container size ($size).
		const handleResize = () => {
			computedEditorHeight = Math.floor(window.innerHeight * EDITOR_HEIGHT_PERCENTAGE);
		};
		window.addEventListener('resize', handleResize);

		// Cleanup listener
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<SequenceProvider>
	<div class="sequence-workbench" use:resizeObserver>
		<SequenceWidget workbenchHeight={sequenceWorkbenchHeight} />

		<!-- <GraphEditorToggleTab
			{isExpanded}
			animationDuration={ANIMATION_DURATION}
			graphEditorHeight={isExpanded ? computedEditorHeight : 0}
			on:click={toggleGraphEditor}
		/>

		<GraphEditor
			{isExpanded}
			animationDuration={ANIMATION_DURATION}
			maxEditorHeight={computedEditorHeight}
		/> -->
	</div>
</SequenceProvider>

<style>
	.sequence-workbench {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		position: relative;
	}
</style>
