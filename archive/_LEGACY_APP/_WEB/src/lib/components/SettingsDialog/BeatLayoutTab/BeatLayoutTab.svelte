<script lang="ts">
	import { numBeatsStore, currentLayoutStore } from '../../../stores/sequence/layoutStore';

	import LayoutControls from './LayoutControls.svelte';
	import GridPreview from './LayoutGridPreview.svelte';
	import { onMount, tick } from 'svelte';

	let numBeats: number = 16;

	let currentLayout = { rows: 4, cols: 4 };
	let grid: number[][] = [];
	let validLayouts: { rows: number; cols: number }[] = [];
	let dialogRef: HTMLDivElement | null = null;
	// Subscribe to stores
	numBeatsStore.subscribe((value) => (numBeats = value));
	currentLayoutStore.subscribe((value) => (currentLayout = value));
	// Fetch layouts and transform data
	const fetchLayouts = async () => {
		try {
			const response = await fetch('/beat_frame_layout_options.json');
			if (!response.ok) throw new Error(`Failed to fetch layouts: ${response.statusText}`);
			const data = await response.json();
			validLayouts =
				data[numBeats]?.map(([rows, cols]: [number, number]) => ({ rows, cols })) || [];
			if (validLayouts.length > 0) currentLayout = validLayouts[0];
			updateGrid();
		} catch (error) {
			console.error('Error loading layouts:', error);
		}
	};

	// Update the grid preview
	const updateGrid = () => {
		grid = Array.from({ length: currentLayout.rows }, (_, row) =>
			Array.from({ length: currentLayout.cols }, (_, col) => col + 1 + row * currentLayout.cols)
		);
	};

	// Handle layout change
	const handleLayoutChange = (event: CustomEvent<{ rows: number; cols: number }>) => {
		const layout = event.detail;
		currentLayout = layout;
		updateGrid();
		currentLayoutStore.set(layout);

	};

	// Handle sequence length change
	const handleSequenceLengthChange = async (event: CustomEvent<number>) => {
		const delta = event.detail;
		numBeats = Math.max(1, Math.min(64, numBeats + delta));
		await fetchLayouts();
		updateGrid();
		numBeatsStore.update((n) => Math.max(1, Math.min(64, n + delta)));

	};

	// Fetch layouts and attach resize listener
	onMount(async () => {
		await fetchLayouts();
		updateGrid();
	});
</script>

<div class="settings-dialog" bind:this={dialogRef}>
	<div class="layout-controls">
		<LayoutControls
			{numBeats}
			{currentLayout}
			{validLayouts}
			onSequenceLengthChange={handleSequenceLengthChange}
			onLayoutChange={handleLayoutChange}
		/>
	</div>

	<div class="grid-preview">
		<GridPreview {grid} {numBeats} />
	</div>
</div>

<style>
	.settings-dialog {
		display: flex;
		flex-direction: column;
		gap: 20px;
		width: 100%;
		height: 100%;
		padding: 10px;
		box-sizing: border-box;
	}

	.layout-controls {
		flex: 0 0 auto;
	}

	.grid-preview {
		flex: 1 1 auto;
		display: flex;
		overflow: hidden;
	}
</style>
