<script lang="ts">
	export let grid: number[][] = [];
	export let numBeats: number = 10;

	let gridRef: HTMLDivElement | null = null; // Reference to the grid component
	let gridWidth = 0;
	let gridHeight = 0;
	let cellSize = 30; // Default size

	// Calculate the cell size based on available dimensions
	const calculateCellSize = () => {
		if (gridWidth > 0 && gridHeight > 0 && grid.length > 0) {
			const cols = grid[0]?.length || 1; // Number of columns
			const rows = grid.length || 1;
			const gap = 5; // Gap between cells

			// Calculate available dimensions
			const availableWidth = gridWidth - gap * (cols - 1);
			const availableHeight = gridHeight - gap * (rows - 1);

			// Calculate the max cell size
			cellSize = Math.max(10, Math.min(availableWidth / cols, availableHeight / rows));
		}
	};

	// Update the size of the grid container
	const updateGridSize = () => {
		if (gridRef) {
			const { width, height } = gridRef.getBoundingClientRect();
			gridWidth = width;
			gridHeight = height;
		}
	};

	// Call calculateCellSize whenever grid dimensions change
	$: {
		if (gridWidth > 0 && gridHeight > 0) calculateCellSize();
	}

	// Recalculate grid and cell size when the grid changes
	$: if (grid.length > 0) {
		updateGridSize();
		calculateCellSize();
	}

	// Attach resize listener to update grid size dynamically
	import { onMount } from 'svelte';
	onMount(() => {
		updateGridSize();
		window.addEventListener('resize', updateGridSize);
		return () => window.removeEventListener('resize', updateGridSize);
	});
</script>

<div class="grid-container">
	<div bind:this={gridRef} class="grid">
		{#each grid as row}
			<div class="grid-row">
				{#each row as beat (beat)}
					{#if beat <= numBeats}
						<div class="grid-cell" style="width: {cellSize}px; height: {cellSize}px;">
							{beat}
						</div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.grid-container {
		display: flex;
		width: 100%;
		height: 100%;
		justify-content: center;
		align-items: center;
		flex-direction: row;
	}

	.grid {
		display: flex;
		flex-direction: column;
		gap: 5px;
		width: 100%;
		height: 100%;
	}

	.grid-row {
		width: 100%;
		display: flex;
		gap: 5px;
		align-items: left;
	}

	.grid-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #f0f0f0;
		border: 1px solid #ccc;
		border-radius: 5px;
		box-sizing: border-box;
	}
</style>
