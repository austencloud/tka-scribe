<!-- src/lib/components/SequenceWorkbench/SequenceBeatFrame/SequenceBeatFrame.svelte -->
<script lang="ts">
	import { onMount, tick, onDestroy } from 'svelte';
	import { useResizeObserver } from '$lib/composables/useResizeObserver';
	import { defaultPictographData } from '$lib/components/Pictograph/utils/defaultPictographData';
	import { autoAdjustLayout, calculateCellSize } from './beatFrameHelpers';
	import { selectedStartPos } from '$lib/stores/sequence/selectionStore';
	import { writable } from 'svelte/store';
	import type { PictographData } from '$lib/types/PictographData';
	import type { BeatData } from './BeatData';
	import { browser } from '$app/environment'; // Import browser check
	
	// Import the global beatsStore instead of creating a local one
	import { beatsStore as globalBeatsStore, selectedBeatIndexStore as globalSelectedBeatStore } from '$lib/stores/sequence/beatsStore';

	// Components
	import StartPosBeat from './StartPosBeat.svelte';
	import Beat from './Beat.svelte';
	import SelectionOverlay from './SelectionOverlay.svelte';
	import ReversalGlyph from './ReversalGlyph.svelte';
	import BeatNumberLabel from './BeatNumberLabel.svelte';
	const ssrDefaults = { width: 800, height: 600 }; // Example reasonable defaults
	const { size, resizeObserver } = useResizeObserver(
		browser ? undefined : ssrDefaults // Pass undefined in browser to let hook calculate, use defaults for SSR
		// OR ensure useResizeObserver internally handles SSR returning 0s or defaults
	);
	// Constants
	const GAP = 10; // Gap between cells in pixels

	// Use a local ref variable for beats and selectedBeatIndex 
	// but subscribe to the global store
	let beats: BeatData[] = [];
	let selectedBeatIndex: number = -1;
	let startPosition: PictographData | null = null;
	
	// Subscribe to the global stores
	const unsubscribeGlobalBeats = globalBeatsStore.subscribe((value) => {
		beats = value;
	});
	
	const unsubscribeGlobalSelectedBeat = globalSelectedBeatStore.subscribe((value) => {
		selectedBeatIndex = value !== null ? value : -1;
	});

	// Local store just for the start position
	const startPositionStore = writable<PictographData | null>(null);
	
	// Subscribe to the local start position store
	const unsubscribeStartPos = startPositionStore.subscribe((value) => (startPosition = value));

	// Also subscribe to the global selectedStartPos store
	const unsubscribeGlobalStartPos = selectedStartPos.subscribe((startPos) => {
		if (startPos) {
			startPositionStore.set(startPos);
		}
	});

	// Clean up on component destroy
	onDestroy(() => {
		unsubscribeGlobalBeats();
		unsubscribeGlobalSelectedBeat();
		unsubscribeStartPos();
		unsubscribeGlobalStartPos();
	});

	// Create start position beat data
	$: startPosBeatData = {
		beatNumber: 0,
		filled: !!startPosition,
		pictographData: startPosition || defaultPictographData
	};

	// Reactive layout calculations based on beat count
	$: [beatRows, beatCols] = autoAdjustLayout(beats.length);

	// Calculate cell size based on container dimensions
	$: cellSize = calculateCellSize($size.width, $size.height, beatRows, beatCols, GAP);

	// Event handlers
	function handleStartPosBeatClick() {
		// Deselect current beat
		globalSelectedBeatStore.set(null);

		// Dispatch a custom event to trigger the start position selector
		const event = new CustomEvent('select-start-pos', {
			bubbles: true,
			detail: { currentStartPos: startPosition }
		});
		document.dispatchEvent(event);
	}

	function handleBeatClick(beatIndex: number) {
		globalSelectedBeatStore.set(beatIndex);
	}

	// Handle start position selection
	function updateStartPosition(newStartPos: PictographData) {
		if (newStartPos) {
			startPositionStore.set(newStartPos);
		}
	}

	// Set up event listener for when a start position is selected
	onMount(() => {
		// Listen for the custom event when a start position is selected
		const handleStartPosSelected = (event: CustomEvent) => {
			if (event.detail?.startPosition) {
				updateStartPosition(event.detail.startPosition);
			}
		};

		document.addEventListener('start-position-selected', handleStartPosSelected as EventListener);

		return () => {
			document.removeEventListener(
				'start-position-selected',
				handleStartPosSelected as EventListener
			);
		};
	});

	// Add a method to add beats (could be called from parent)
	export function addBeat(beatData: BeatData) {
		globalBeatsStore.update((beats) => [...beats, beatData]);
	}

	// Add a method to clear beats (could be called from parent)
	export function clearBeats() {
		globalBeatsStore.set([]);
		globalSelectedBeatStore.set(null);
	}
</script>

<div
	use:resizeObserver
	class="beat-frame"
	style="--total-rows: {beatRows}; --total-cols: {beatCols}; --gap: {GAP}px; --cell-size: {cellSize}px;"
>
	<!-- Start Position Beat -->
	<div class="beat-container start-position">
		<StartPosBeat beatData={startPosBeatData} onClick={handleStartPosBeatClick} />
	</div>

	<!-- Regular Beats -->
	{#each beats as beat, index (beat.beatNumber)}
		<div class="beat-container" class:selected={selectedBeatIndex === index}>
			<Beat {beat} onClick={() => handleBeatClick(index)} />

			<!-- Show beat number -->
			<div class="beat-number">
				<BeatNumberLabel beatNumber={beat.beatNumber} duration={beat.duration || 1} />
			</div>

			<!-- Show reversals if any -->
			{#if beat.metadata?.blueReversal || beat.metadata?.redReversal}
				<div class="reversal-indicator">
					<ReversalGlyph
						blueReversal={beat.metadata?.blueReversal || false}
						redReversal={beat.metadata?.redReversal || false}
					/>
				</div>
			{/if}

			<!-- Selection overlay -->
			<SelectionOverlay isSelected={selectedBeatIndex === index} />
		</div>
	{/each}
</div>

<style>
	.beat-frame {
		display: grid;
		grid-template-columns: repeat(var(--total-cols), var(--cell-size));
		grid-template-rows: repeat(var(--total-rows), var(--cell-size));
		gap: var(--gap);
		justify-content: center;
		align-content: center;
		width: 100%;
		height: 100%;
	}

	.beat-container {
		position: relative;
		width: var(--cell-size);
		height: var(--cell-size);
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: transparent;
	}

	.start-position {
		grid-column: 1;
		grid-row: 1;
	}

	.beat-number {
		position: absolute;
		top: 5px;
		left: 5px;
		z-index: 2;
	}

	.reversal-indicator {
		position: absolute;
		bottom: 5px;
		right: 5px;
		z-index: 2;
	}
</style>