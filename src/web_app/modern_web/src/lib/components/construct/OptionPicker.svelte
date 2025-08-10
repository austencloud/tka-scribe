<!--
OptionPicker.svelte - Desktop-Style Sectioned Option Picker

Matches the desktop version exactly:
- Header with "Choose Your Next Option" title
- Sections organized by letter type (Type1: Dual-Shift, Type2: Shift, etc.)
- Individual sections for Types 1, 2, 3
- Horizontal group for Types 4, 5, 6
- Responsive layout with proper state management
-->
<script lang="ts">
	import { createBeatData } from '$lib/domain/BeatData';
	import type { PictographData } from '$lib/domain/PictographData';
	import type { SequenceData } from '$lib/domain/SequenceData';
	import type { DifficultyLevel } from '$services/interfaces';
	import { onMount } from 'svelte';
	import { OptionPickerDataService } from './option-picker/OptionPickerDataService.js';
	import OptionPickerHeader from './option-picker/OptionPickerHeader.svelte';
	import OptionPickerScroll from './option-picker/OptionPickerScroll.svelte';
	import { createOptionPickerState } from './option-picker/OptionPickerSectionState.svelte.js';

	// Props using runes
	const {
		currentSequence = null,
		difficulty = 'intermediate',
		onOptionSelected = () => {},
	} = $props<{
		currentSequence?: SequenceData | null;
		difficulty?: DifficultyLevel;
		onOptionSelected?: (option: PictographData) => void;
	}>();

	// Create state management using runes
	const optionPickerState = createOptionPickerState();

	// Data service
	let dataService: OptionPickerDataService | null = null;

	// Container element for size detection
	let containerElement: HTMLDivElement | null = null;

	// Transition state
	let isTransitioning = $state(false);

	// Initialize data service and load options
	async function initializeAndLoadOptions() {
		try {
			optionPickerState.setLoading(true);

			// Initialize data service
			if (!dataService) {
				dataService = new OptionPickerDataService();
				await dataService.initialize();
			}

			// Load options based on current sequence or start position
			let result;

			if (currentSequence && currentSequence.beats.length > 0) {
				// Load options from current sequence (like desktop version)
				console.log('🎯 Loading options from current sequence...');
				result = await dataService.loadOptionsFromSequence(currentSequence);
			} else {
				// Fallback to start position from localStorage
				console.log('🎯 No sequence available, loading from start position...');
				result = await dataService.loadOptionsFromStartPosition();
			}

			if (result.success) {
				optionPickerState.setAllPictographs(result.options);
				console.log(`✅ Loaded ${result.options.length} options`);
			} else {
				console.error('❌ Failed to load options:', result.error);
				optionPickerState.setLoadingError(true);
			}
		} catch (error) {
			console.error('❌ Error initializing option picker:', error);
			optionPickerState.setLoadingError(true);
		} finally {
			optionPickerState.setLoading(false);
		}
	}

	// Handle pictograph selection
	function handlePictographSelected(pictograph: PictographData) {
		try {
			console.log('🎲 Pictograph selected:', pictograph.id);

			// Show transition state
			isTransitioning = true;

			// Update global state
			optionPickerState.setSelectedPictograph(pictograph);

			// Create beat data from pictograph
			const beatData = createBeatData({
				beat_number: currentSequence ? currentSequence.beats.length + 1 : 1,
				pictograph_data: pictograph,
			});

			// Call callback to notify parent component
			onOptionSelected(pictograph);

			// Emit modern event
			const event = new CustomEvent('option-selected', {
				detail: { option: pictograph, beatData },
				bubbles: true,
			});
			document.dispatchEvent(event);

			console.log('✅ Pictograph selection completed');
		} catch (error) {
			console.error('❌ Error selecting pictograph:', error);
		} finally {
			isTransitioning = false;
		}
	}

	// Handle container resize
	function handleResize() {
		if (containerElement) {
			const rect = containerElement.getBoundingClientRect();
			optionPickerState.setContainerDimensions(rect.width, rect.height);
		}
	}

	// Initialize on mount
	onMount(() => {
		console.log('🎯 OptionPicker mounted - initializing...');

		// Initialize and load options
		initializeAndLoadOptions();

		// Set up resize observer for responsive layout
		if (containerElement) {
			const resizeObserver = new ResizeObserver(() => {
				handleResize();
			});
			resizeObserver.observe(containerElement);

			// Cleanup on unmount
			return () => {
				resizeObserver.disconnect();
			};
		}

		// Add event listener for start position selection
		const handleStartPositionSelected = () => {
			console.log('🎯 Start position selected - reloading options');
			initializeAndLoadOptions();
		};

		document.addEventListener('start-position-selected', handleStartPositionSelected);

		// Cleanup on unmount
		return () => {
			document.removeEventListener('start-position-selected', handleStartPositionSelected);
		};
	});
</script>

<!-- Main container with desktop-style sectioned layout -->
<div class="option-picker" bind:this={containerElement}>
	<!-- Header matching desktop version -->
	<OptionPickerHeader />

	<!-- Main scrollable content area -->
	<div class="option-picker-content">
		{#if optionPickerState.isLoading}
			<div class="loading-container">
				<div class="loading-spinner"></div>
				<p>Loading options...</p>
			</div>
		{:else if optionPickerState.loadingError}
			<div class="error-container">
				<p>❌ Error loading options</p>
				<button class="retry-button" onclick={initializeAndLoadOptions}> Retry </button>
			</div>
		{:else if optionPickerState.allPictographs.length === 0}
			<div class="empty-container">
				<p>No options available</p>
				<p>Please select a start position first</p>
			</div>
		{:else}
			<!-- Sectioned scroll area matching desktop exactly -->
			<OptionPickerScroll
				pictographs={optionPickerState.allPictographs}
				onPictographSelected={handlePictographSelected}
				containerWidth={optionPickerState.containerWidth}
				containerHeight={optionPickerState.containerHeight}
			/>
		{/if}
	</div>

	<!-- Loading overlay during transition -->
	{#if isTransitioning}
		<div class="loading-overlay">
			<div class="loading-spinner"></div>
			<p>Adding to sequence...</p>
		</div>
	{/if}
</div>

<style>
	.option-picker {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: var(--background, white);
		border: 1px solid var(--border, #e2e8f0);
		border-radius: 8px;
		overflow: hidden;
	}

	.option-picker-content {
		flex: 1;
		overflow: hidden;
		position: relative;
	}

	.loading-container,
	.error-container,
	.empty-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 32px;
		text-align: center;
		color: var(--muted-foreground, #666666);
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--border, #e2e8f0);
		border-top: 3px solid var(--primary, #2563eb);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 16px;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.retry-button {
		margin-top: 16px;
		padding: 8px 16px;
		background: var(--primary, #2563eb);
		color: var(--primary-foreground, white);
		border: none;
		border-radius: 6px;
		cursor: pointer;
		font-size: 14px;
		transition: background-color 0.2s ease;
	}

	.retry-button:hover {
		background: var(--primary-hover, #1d4ed8);
	}

	.loading-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.9);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.loading-overlay p {
		margin-top: 16px;
		color: var(--foreground, #000000);
		font-weight: 500;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.option-picker {
			border-radius: 6px;
		}

		.loading-container,
		.error-container,
		.empty-container {
			padding: 24px;
		}

		.loading-spinner {
			width: 28px;
			height: 28px;
		}
	}

	@media (max-width: 480px) {
		.option-picker {
			border-radius: 4px;
		}

		.loading-container,
		.error-container,
		.empty-container {
			padding: 16px;
		}

		.loading-spinner {
			width: 24px;
			height: 24px;
		}

		.retry-button {
			padding: 6px 12px;
			font-size: 13px;
		}
	}
</style>
