<script lang="ts">
	import Pictograph from '../Pictograph/Pictograph.svelte';
	import { onMount, onDestroy } from 'svelte';
	import StartPositionLabel from './StartPosLabel.svelte';
	import type { PictographData } from '$lib/types/PictographData.js';
	import { writable, type Writable, get } from 'svelte/store';
	import LoadingSpinner from '../MainWidget/loading/LoadingSpinner.svelte';
	import { selectedStartPos } from '$lib/stores/sequence/selectionStore';
	import pictographDataStore from '$lib/stores/pictograph/pictographStore';
	import startPositionService from '$lib/services/StartPositionService';
	import { isSequenceEmpty } from '$lib/stores/sequence/sequenceStateStore';
	import { browser } from '$app/environment'; // Import browser check
	import sequenceDataService from '$lib/services/SequenceDataService';

	let gridMode = 'diamond'; // TODO: Make this dynamic if necessary
	let startPositionPictographs: PictographData[] = []; // Store the processed data directly
	let filteredDataAvailable = false; // Flag to know if filtering yielded results
	let dataInitializationChecked = false; // Flag to know if we've processed the store data at least once
	let isLoading = true; // Start loading until store data is processed
	let loadingError = false; // Flag for loading timeout/error

	// Timeout for initial data load
	let initialDataTimeout: number | null = null;

	const unsubscribe = pictographDataStore.subscribe((data) => {
		// Only process if running in the browser
		if (!browser) return;

		if (data && data.length > 0) {
			// Data is available from the store

			dataInitializationChecked = true; // Mark that we've seen data

			const pictographData = data as PictographData[];
			const defaultStartPosKeys =
				gridMode === 'diamond'
					? ['alpha1_alpha1', 'beta5_beta5', 'gamma11_gamma11']
					: ['alpha2_alpha2', 'beta4_beta4', 'gamma12_gamma12'];

			const filteredPictographs = pictographData.filter(
				(entry) =>
					entry.redMotionData &&
					entry.blueMotionData &&
					defaultStartPosKeys.includes(`${entry.startPos}_${entry.endPos}`)
			);


			startPositionPictographs = filteredPictographs;
			filteredDataAvailable = filteredPictographs.length > 0;

			// Stop loading *after* processing
			isLoading = false;
			if (initialDataTimeout) clearTimeout(initialDataTimeout); // Clear safety timeout
		} else if (dataInitializationChecked) {
			// Data was previously available but is now empty (e.g., store reset)
			console.log('StartPosPicker: pictographDataStore became empty after initialization.');
			startPositionPictographs = [];
			filteredDataAvailable = false;
			isLoading = false; // Still not loading, just no data
		}
		// If data is initially empty/null, isLoading remains true until data arrives or timeout occurs
	});

	onMount(() => {
		// Safety timeout: If data hasn't been checked/processed after 10s, show error
		initialDataTimeout = window.setTimeout(() => {
			if (isLoading && !dataInitializationChecked) {
				console.error('StartPosPicker: Timeout waiting for pictographDataStore initialization.');
				isLoading = false;
				loadingError = true; // Set error flag
			}
		}, 10000); // 10 seconds

		return () => {
			unsubscribe();
			if (initialDataTimeout) {
				clearTimeout(initialDataTimeout);
			}
		};
	});

	// No longer need individual stores for each pictograph here
	// let startPositionDataStoreSet: Writable<PictographData>[] = [];
	// let loadedPictographs = 0; // Removed - Pictograph loading state handled internally
	// let totalPictographs = 0; // Removed

	const handleSelect = async (startPosPictograph: PictographData) => {
		try {
			console.log("CLICKED START POSITION:", startPosPictograph);
			
			// Log sequence before
			const beforeSequence = sequenceDataService.getCurrentSequence();
			console.log("SEQUENCE BEFORE:", JSON.stringify(beforeSequence));
			
			// Try adding start position
			await startPositionService.addStartPosition(startPosPictograph);
			
			// Log sequence after
			const afterSequence = sequenceDataService.getCurrentSequence();
			console.log("SEQUENCE AFTER:", JSON.stringify(afterSequence));
			
			// Update the selected start position in the store
			selectedStartPos.set({ ...startPosPictograph });

			// Update sequence state to not empty
			isSequenceEmpty.set(false);

			// Dispatch a custom event for components that might be listening (browser only)
			if (browser) {
				const customEvent = new CustomEvent('start-position-selected', {
					detail: { startPosition: { ...startPosPictograph } },
					bubbles: true
				});
				document.dispatchEvent(customEvent);
			}
		} catch (error) {
			console.error('Error adding start position:', error);
		}
	};

	// These handlers are now managed within the Pictograph component itself
	// function handlePictographLoaded(event: CustomEvent) {}
	// function handlePictographError(event: CustomEvent) {}

	// let fallbackDisplayed = false; // Replaced by loadingError flag
</script>

<div class="start-pos-picker">
	<StartPositionLabel />

	{#if isLoading}
		<div class="loading-container">
			<LoadingSpinner />
			<p class="loading-text">Loading Start Positions...</p>
		</div>
	{:else if loadingError}
		<div class="error-container">
			<p>Unable to load start positions. Please try refreshing the page.</p>
			<button
				on:click={() => {
					if (browser) window.location.reload();
				}}>Refresh</button
			>
		</div>
	{:else if !filteredDataAvailable}
		<div class="error-container">
			<p>No valid start positions found for the current configuration.</p>
		</div>
	{:else}
		<div class="pictograph-row">
			{#each startPositionPictographs as pictograph (pictograph.letter + '_' + pictograph.startPos + '_' + pictograph.endPos)}
				{@const pictographStore = writable(pictograph)}
				<div
					class="pictograph-container"
					role="button"
					tabindex="0"
					on:click={() => handleSelect(pictograph)}
					on:keydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault(); // Prevent space scrolling
							handleSelect(pictograph);
						}
					}}
				>
					<Pictograph pictographDataStore={pictographStore} showLoadingIndicator={false} />
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.start-pos-picker {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		width: 100%;
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 60%;
		width: 100%;
	}

	.loading-text {
		margin-top: 20px;
		font-size: 1.2rem;
		color: #555;
	}

	.error-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 60%;
		width: 100%;
		background-color: rgba(255, 220, 220, 0.7);
		padding: 20px;
		border-radius: 10px;
	}

	.pictograph-row {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		align-items: center;
		width: 90%;
		gap: 3%;
	}

	.pictograph-container {
		width: 25%;
		aspect-ratio: 1 / 1;
		height: auto;
		position: relative;
		cursor: pointer;
	}
</style>
