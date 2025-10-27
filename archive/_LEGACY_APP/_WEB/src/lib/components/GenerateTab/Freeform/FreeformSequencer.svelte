<!-- src/lib/components/GenerateTab/freeform/FreeformSequencer.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { settingsStore, numBeats, turnIntensity, propContinuity } from '../store/settings';
	import { generatorStore } from '../store/generator';
	import LetterTypePicker from './LetterTypePicker/LetterTypePicker.svelte';
	import { createFreeformSequence } from './createFreeformSequence';
	import { beatsStore } from '../../../stores/sequence/beatsStore';

	// Letter type selection information
	const letterTypeOptions = [
		{
			id: 'type1',
			label: 'Type 1',
			description: 'Basic motions with minimal complexity'
		},
		{
			id: 'type2',
			label: 'Type 2',
			description: 'Intermediate flow with moderate transitions'
		},
		{
			id: 'type3',
			label: 'Type 3',
			description: 'Advanced patterns with complex movements'
		},
		{
			id: 'type4',
			label: 'Type 4',
			description: 'Expert-level intricate sequences'
		}
	];

	// Local state for selected letter types
	let selectedLetterTypes: string[] = [];

	// Handle letter type selection
	function handleLetterTypeSelect(types: string[]) {
		selectedLetterTypes = types;
	}

	// Handle generate sequence
	async function handleGenerateSequence() {
		generatorStore.startGeneration();

		try {
			const result = await createFreeformSequence({
				numBeats: $numBeats,
				turnIntensity: $turnIntensity,
				propContinuity: $propContinuity,
				letterTypes: selectedLetterTypes
			});

			// Update the beats store with the new sequence
			beatsStore.set(result);

			generatorStore.completeGeneration();
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : 'Failed to generate freeform sequence';

			generatorStore.setError(errorMessage);
			console.error('Generate freeform sequence error:', error);
		}
	}

	// Listen for generate-sequence event
	function setupEventListener() {
		const handleEvent = () => {
			handleGenerateSequence();
		};

		document.addEventListener('generate-sequence', handleEvent as EventListener);

		return () => {
			document.removeEventListener('generate-sequence', handleEvent as EventListener);
		};
	}

	// Lifecycle
	onMount(() => {
		const cleanup = setupEventListener();
		return cleanup;
	});
</script>

<div class="freeform-sequencer">
	<h3>Freeform Sequence Generator</h3>

	<div class="content">
		<div class="letter-type-picker-container">
			<LetterTypePicker
				options={letterTypeOptions}
				on:select={(e: CustomEvent<string[]>) => handleLetterTypeSelect(e.detail)}
			/>
		</div>

		<div class="description-container">
			<div class="description-card">
				<h4>Freeform Sequence Generation</h4>
				<p>Create a unique sequence with custom letter type complexity and flow.</p>

				<div class="info-box">
					<div class="info-item">
						<span class="info-label">Sequence Length:</span>
						<span class="info-value">{$numBeats} beats</span>
					</div>

					<div class="info-item">
						<span class="info-label">Selected Letter Types:</span>
						<span class="info-value">
							{selectedLetterTypes.length > 0 ? selectedLetterTypes.join(', ') : 'All Types'}
						</span>
					</div>

					<p class="info-note">
						The generator will create a {$numBeats}-beat sequence using the selected letter types
						and motion complexity.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.freeform-sequencer {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 100%;
	}

	h3 {
		font-size: 1.25rem;
		color: var(--color-text-primary, white);
		margin: 0;
		font-weight: 500;
	}

	.content {
		display: flex;
		gap: 1.5rem;
		width: 100%;
	}

	.letter-type-picker-container {
		flex: 2;
		overflow-y: auto;
		max-height: 30rem;
	}

	.description-container {
		flex: 1;
		min-width: 240px;
	}

	.description-card {
		background: var(--color-surface, rgba(30, 40, 60, 0.85));
		border: 1px solid var(--color-border, rgba(255, 255, 255, 0.1));
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.description-card h4 {
		font-size: 1.1rem;
		margin: 0 0 0.75rem 0;
		color: var(--color-text-primary, white);
		font-weight: 500;
	}

	.description-card p {
		color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
		font-size: 0.9rem;
		margin: 0 0 1rem 0;
		line-height: 1.4;
	}

	.info-box {
		margin-top: 1rem;
		padding: 0.75rem;
		background: var(--color-surface-hover, rgba(255, 255, 255, 0.05));
		border-radius: 0.375rem;
	}

	.info-item {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.info-label {
		font-size: 0.875rem;
		color: var(--color-text-secondary, rgba(255, 255, 255, 0.7));
	}

	.info-value {
		font-size: 0.875rem;
		color: var(--color-accent, #3a7bd5);
		font-weight: 500;
	}

	.info-note {
		font-size: 0.8rem;
		color: var(--color-text-secondary, rgba(255, 255, 255, 0.6));
		margin-top: 0.75rem;
		font-style: italic;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.content {
			flex-direction: column;
		}

		.letter-type-picker-container,
		.description-container {
			width: 100%;
		}

		.letter-type-picker-container {
			max-height: 20rem;
		}
	}
</style>
