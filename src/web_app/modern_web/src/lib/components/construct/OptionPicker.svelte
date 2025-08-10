<!-- eslint-disable import/no-unresolved import/default import/named -->
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
	import { OptionDataService } from '$lib/services/implementations/OptionDataService';
	import { getCurrentSequence } from '$lib/stores/sequenceState.svelte';
	import type { DifficultyLevel } from '$services/interfaces';
	import { onMount } from 'svelte';
	import OptionPickerHeader from './option-picker/OptionPickerHeader.svelte';
	import OptionPickerScroll from './option-picker/OptionPickerScroll.svelte';
	import { createOptionPickerState } from './option-picker/OptionPickerSectionState.svelte.js';
	import { LetterType } from './option-picker/types/LetterType';

	// Helper function to get the end position from the current sequence
	function getCurrentSequenceEndPosition(): string | null {
		const currentSequence = getCurrentSequence();
		if (!currentSequence) {
			return null;
		}

		// First, check if there's a start position (for new sequences)
		if (currentSequence.start_position?.pictograph_data) {
			const startEndPosition = extractEndPositionFromPictograph(
				currentSequence.start_position.pictograph_data
			);
			console.log(`🎯 Using start position as end position: ${startEndPosition}`);
			return startEndPosition;
		}

		// Then, find the last non-blank beat (for sequences with beats)
		if (currentSequence.beats && currentSequence.beats.length > 0) {
			for (let i = currentSequence.beats.length - 1; i >= 0; i--) {
				type LegacyBeat = { is_blank: boolean; pictograph_data?: PictographData | null };
				type NewBeat = { isBlank?: boolean; pictographData?: PictographData | null };
				const rawBeat = currentSequence.beats[i] as LegacyBeat | NewBeat | undefined;
				if (!rawBeat) continue;
				const isBlank = 'is_blank' in rawBeat ? rawBeat.is_blank : rawBeat.isBlank === true;
				const pictograph =
					'pictograph_data' in rawBeat ? rawBeat.pictograph_data : rawBeat.pictographData;
				if (!isBlank && pictograph) {
					// Extract end position from the pictograph data
					const endPosition = extractEndPositionFromPictograph(pictograph);
					console.log(`🎯 Found end position from beat ${i}: ${endPosition}`);
					return endPosition;
				}
			}
		}

		console.warn('⚠️ No end position found in sequence');
		return null;
	}

	// Helper function to extract end position from pictograph data
	function extractEndPositionFromPictograph(pictographData: PictographData): string | null {
		console.log('🔍 Extracting end position from pictograph:', {
			id: pictographData.id,
			letter: pictographData.letter,
			end_position: pictographData.end_position,
			metadata: pictographData.metadata,
			motions: pictographData.motions,
		});

		// Try to get from end_position field first
		if (pictographData.end_position) {
			console.log(`✅ Found end_position field: ${pictographData.end_position}`);
			return pictographData.end_position;
		}

		// Try to get from metadata
		if (pictographData.metadata?.endPosition) {
			console.log(`✅ Found metadata.endPosition: ${pictographData.metadata.endPosition}`);
			return pictographData.metadata.endPosition;
		}

		// For start positions, try to extract from the ID or letter
		if (pictographData.id?.includes('start-pos-')) {
			// Extract from start position ID like "start-pos-gamma11_gamma11-2"
			const match = pictographData.id.match(/start-pos-([^_]+)_/);
			if (match && match[1]) {
				const endPos = match[1];
				console.log(`✅ Extracted from start position ID: ${endPos}`);
				return endPos;
			}
		}

		// Try to get from motion data as fallback
		if (pictographData.motions?.blue?.end_loc) {
			const mapped = mapLocationToPosition(pictographData.motions.blue.end_loc);
			console.log(`⚠️ Using blue motion end_loc fallback: ${mapped}`);
			return mapped;
		}
		if (pictographData.motions?.red?.end_loc) {
			const mapped = mapLocationToPosition(pictographData.motions.red.end_loc);
			console.log(`⚠️ Using red motion end_loc fallback: ${mapped}`);
			return mapped;
		}

		console.warn('⚠️ No end position found, defaulting to alpha1');
		return 'alpha1';
	}

	// Helper function to map location to position string
	function mapLocationToPosition(location: string | Location): string {
		// Basic mapping - this matches the legacy system
		const locationMap: Record<string, string> = {
			n: 'alpha1',
			s: 'alpha1',
			e: 'gamma11',
			w: 'alpha1',
			ne: 'beta5',
			se: 'gamma11',
			sw: 'alpha1',
			nw: 'beta5',
		};

		const locationStr = typeof location === 'string' ? location : location?.toString() || '';
		return locationMap[locationStr.toLowerCase()] || 'alpha1';
	}

	// Props using runes
	const {
		currentSequence = null,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		difficulty: _difficulty = 'intermediate',
		onOptionSelected = () => {},
	} = $props<{
		currentSequence?: SequenceData | null;
		difficulty?: DifficultyLevel;
		onOptionSelected?: (option: PictographData) => void;
	}>();

	// Create state management using runes
	const optionPickerState = createOptionPickerState();

	// Data service removed (was unused during test option scaffolding)

	// Container element for size detection
	let containerElement: HTMLDivElement | null = null;

	// Transition state
	let isTransitioning = $state(false);

	// Initialize data service and load options
	async function initializeAndLoadOptions() {
		try {
			console.log('🎯 OptionPicker: initializeAndLoadOptions called');
			optionPickerState.setLoading(true);

			// Get the current sequence's end position
			const endPosition = getCurrentSequenceEndPosition();
			if (!endPosition) {
				console.warn('⚠️ No end position found, cannot load options');
				optionPickerState.setAllPictographs([]);
				optionPickerState.setLoadingError(false);
				return;
			}

			console.log(`🎯 Loading real options for end position: ${endPosition}`);

			// Create OptionDataService instance and load real data
			const optionDataService = new OptionDataService();
			await optionDataService.initialize();

			// Get real options from CSV data
			const realOptions = await optionDataService.getNextOptionsFromEndPosition(
				endPosition,
				'diamond', // Default to diamond mode for now
				{} // No filters - show all options
			);

			console.log(`✅ Loaded ${realOptions.length} real options from CSV data`);

			// Debug: Test the LetterType.getLetterType function with real data
			console.log('🔍 Testing LetterType.getLetterType function with real data:');
			realOptions.slice(0, 10).forEach((option) => {
				const letterType = LetterType.getLetterType(option.letter || '');
				console.log(`  Letter "${option.letter}" -> Type "${letterType}"`);
			});

			optionPickerState.setAllPictographs(realOptions);
			optionPickerState.setLoadingError(false);
		} catch (error) {
			console.error('❌ Error loading real options:', error);
			optionPickerState.setLoadingError(true);
			optionPickerState.setAllPictographs([]);
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

	// Initialize on mount using effect (Svelte 5 approach)
	let mounted = $state(false);

	$effect(() => {
		if (!mounted) {
			mounted = true;
			console.log('🎯 OptionPicker mounted via effect - initializing...');
			console.log('🎯 OptionPicker effect function started');

			// Initialize and load options
			try {
				console.log('🎯 About to call initializeAndLoadOptions...');
				initializeAndLoadOptions().catch((error) => {
					console.error('❌ Error in initializeAndLoadOptions:', error);
				});
			} catch (error) {
				console.error('❌ Sync error in initializeAndLoadOptions:', error);
			}
		}
	});

	// Initialize on mount (backup approach)
	onMount(() => {
		console.log('🎯 OptionPicker mounted - initializing...');
		console.log('🎯 OptionPicker onMount function started');

		// Set up resize observer for responsive layout
		let resizeObserver: ResizeObserver | null = null;
		if (containerElement) {
			resizeObserver = new ResizeObserver(() => {
				handleResize();
			});
			resizeObserver.observe(containerElement);
		}

		// Add event listener for start position selection
		const handleStartPositionSelected = () => {
			console.log('🎯 Start position selected - reloading options');
			initializeAndLoadOptions();
		};

		document.addEventListener('start-position-selected', handleStartPositionSelected);

		console.log('🎯 OptionPicker onMount completed');

		// Cleanup on unmount
		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
			document.removeEventListener('start-position-selected', handleStartPositionSelected);
		};
	});
</script>

<!-- Main container with desktop-style sectioned layout -->
<div class="option-picker" bind:this={containerElement}>
	<!-- Debug: Component is rendering -->
	{console.log('🎯 OptionPicker template is rendering')}

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
		background: transparent; /* Allow beautiful background to show through */
		border: none; /* Remove border to blend with background */
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
