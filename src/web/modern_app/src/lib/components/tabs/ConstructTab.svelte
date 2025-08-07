<!-- ConstructTab.svelte - Modern implementation with service coordination -->
<script lang="ts">
	// Import runes-based state and components
	import { onMount } from 'svelte';
	import { getCurrentSequence, getSequences, getIsLoading } from '$stores/sequenceState.svelte';
	import StartPositionPicker from '$components/construct/StartPositionPicker.svelte';
	import OptionPicker from '$components/construct/OptionPicker.svelte';
	import type { BeatData, PictographData, SequenceData } from '$services/interfaces';
	import { IConstructTabCoordinationService, ISequenceService } from '$services/interfaces';
	import { resolve } from '$services/bootstrap';

	// Props using runes
	const { isGenerateMode = false } = $props<{ isGenerateMode?: boolean }>();

	// Modern services - resolved when container is ready
	let constructCoordinator = $state<IConstructTabCoordinationService | null>(null);
	let sequenceService = $state<ISequenceService | null>(null);

	// Runes-based state (replacing legacy workbenchStore)
	let currentView = $state<'start_position' | 'option_picker' | 'workbench'>('start_position');
	let gridMode = $state<'diamond' | 'box'>('diamond');
	let isTransitioning = $state(false);
	let errorMessage = $state<string | null>(null);

	// Reactive current sequence for template
	let currentSequence = $derived(getCurrentSequence());

	// Resolve services when container is ready
	$effect(() => {
		try {
			if (!constructCoordinator) {
				constructCoordinator = resolve(IConstructTabCoordinationService);
			}
			if (!sequenceService) {
				sequenceService = resolve(ISequenceService);
			}
		} catch (error) {
			console.error('ConstructTab: Failed to resolve services:', error);
			// Services will remain null and component will handle gracefully
		}
	});

	// Handle start position selection
	async function handleStartPositionSelected(startPosition: BeatData) {
		try {
			console.log('🎭 Start position selected in ConstructTab:', startPosition.pictograph_data?.id);
			isTransitioning = true;

			// Use coordination service to handle the selection
			if (constructCoordinator) {
				await constructCoordinator.handleStartPositionSet(startPosition);
			}

			// Transition to option picker
			currentView = 'option_picker';
			errorMessage = null;

			console.log('✅ Transitioned to option picker');
		} catch (error) {
			console.error('❌ Error handling start position selection:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to set start position';
		} finally {
			isTransitioning = false;
		}
	}

	// Handle option selection
	async function handleOptionSelected(option: PictographData) {
		try {
			console.log('🎭 Option selected in ConstructTab:', option.id);
			isTransitioning = true;

			// Create beat data from option
			const beatData: BeatData = {
				beat: getCurrentSequence()?.beats.length || 1,
				pictograph_data: option
			};

			// Use coordination service to handle beat addition
			if (constructCoordinator) {
				await constructCoordinator.handleBeatAdded(beatData);
			}

			// For now, stay on option picker to continue building sequence
			// In the future, this could transition to workbench view
			errorMessage = null;

			console.log('✅ Beat added to sequence');
		} catch (error) {
			console.error('❌ Error handling option selection:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to add option to sequence';
		} finally {
			isTransitioning = false;
		}
	}

	// Handle view transitions (triggered by coordination service)
	function handleViewTransition(targetView: string) {
		switch (targetView) {
			case 'start_position_picker':
				currentView = 'start_position';
				break;
			case 'option_picker':
				currentView = 'option_picker';
				break;
			case 'workbench':
				currentView = 'workbench';
				break;
			default:
				console.warn('Unknown view transition:', targetView);
		}
	}

	// Setup component coordination on mount
	onMount(() => {
		console.log('🎭 ConstructTab mounted, setting up coordination');

		// Register this component with the coordination service
		if (constructCoordinator) {
			constructCoordinator.setupComponentCoordination({
				constructTab: {
					handleEvent: (eventType: string, data: any) => {
						switch (eventType) {
							case 'ui_transition':
								handleViewTransition(data.targetPanel);
								break;
							default:
								console.log(`ConstructTab received event: ${eventType}`, data);
						}
					}
				}
			});
		}

		// Listen for transition events
		const handleTransitionEvent = (event: CustomEvent) => {
			handleViewTransition(event.detail.targetPanel);
		};

		document.addEventListener('construct-tab-transition', handleTransitionEvent as EventListener);

		return () => {
			document.removeEventListener('construct-tab-transition', handleTransitionEvent as EventListener);
		};
	});

	// Determine initial view based on sequence state
	$effect(() => {
		const sequence = getCurrentSequence();
		if (sequence && sequence.beats && sequence.beats.length > 0) {
			// Has beats, show option picker
			currentView = 'option_picker';
		} else {
			// No beats, show start position picker
			currentView = 'start_position';
		}
	});
</script>

<div class="construct-tab" data-testid="construct-tab">
	<!-- Header -->
	<div class="construct-header">
		<h1>Construct</h1>
		<div class="construct-controls">
			<div class="mode-indicator">
				{isGenerateMode ? 'Generate Mode' : 'Construct Mode'}
			</div>
			<div class="grid-selector">
				<label>
					Grid:
					<select bind:value={gridMode}>
						<option value="diamond">Diamond</option>
						<option value="box">Box</option>
					</select>
				</label>
			</div>
		</div>
	</div>

	<!-- Error display -->
	{#if errorMessage}
		<div class="error-banner">
			<p>❌ {errorMessage}</p>
			<button onclick={() => errorMessage = null}>Dismiss</button>
		</div>
	{/if}

	<!-- Main content area -->
	<div class="construct-content">
		{#if currentView === 'start_position'}
			<div class="view-container">
				<div class="view-header">
					<h2>Choose Start Position</h2>
					<p>Select a starting position for your sequence</p>
				</div>
				<StartPositionPicker
					{gridMode}
					onStartPositionSelected={handleStartPositionSelected}
				/>
			</div>
		{:else if currentView === 'option_picker'}
			<div class="view-container">
				<div class="view-header">
					<h2>Build Your Sequence</h2>
					<p>Choose the next move for your sequence</p>
					{#if currentSequence}
						<div class="sequence-info">
							<span class="beat-count">{currentSequence.beats.length} beats</span>
							<span class="sequence-name">{currentSequence.name}</span>
						</div>
					{/if}
				</div>
				<OptionPicker 
					{currentSequence}
					difficulty="intermediate"
					onOptionSelected={handleOptionSelected}
				/>
			</div>
		{:else if currentView === 'workbench'}
			<div class="view-container">
				<div class="view-header">
					<h2>Sequence Workbench</h2>
					<p>Edit and refine your sequence</p>
				</div>
				<div class="workbench-placeholder">
					<p>🚧 Sequence Workbench coming soon</p>
					<p>This will show the full sequence editor with beat frames</p>
				</div>
			</div>
		{/if}
	</div>

	<!-- Loading overlay -->
	{#if isTransitioning}
		<div class="loading-overlay">
			<div class="loading-spinner"></div>
			<p>Processing...</p>
		</div>
	{/if}
</div>

<style>
	.construct-tab {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		overflow: hidden;
		position: relative;
	}

	.construct-header {
		flex-shrink: 0;
		background: var(--background);
		border-bottom: 1px solid var(--border);
		padding: var(--spacing-lg);
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-md);
	}

	.construct-header h1 {
		margin: 0;
		color: var(--foreground);
		font-size: var(--font-size-2xl);
		font-weight: 600;
	}

	.construct-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.mode-indicator {
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--primary)/10;
		color: var(--primary);
		border-radius: var(--border-radius);
		font-size: var(--font-size-sm);
		font-weight: 500;
	}

	.grid-selector label {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		color: var(--foreground);
		font-size: var(--font-size-sm);
	}

	.grid-selector select {
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--border);
		border-radius: var(--border-radius);
		background: var(--background);
		color: var(--foreground);
		cursor: pointer;
	}

	.error-banner {
		flex-shrink: 0;
		background: var(--destructive)/10;
		color: var(--destructive);
		padding: var(--spacing-md) var(--spacing-lg);
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid var(--destructive)/20;
	}

	.error-banner p {
		margin: 0;
		font-size: var(--font-size-sm);
	}

	.error-banner button {
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--destructive);
		color: var(--destructive-foreground);
		border: none;
		border-radius: var(--border-radius-sm);
		cursor: pointer;
		font-size: var(--font-size-xs);
	}

	.construct-content {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.view-container {
		flex: 1;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.view-header {
		flex-shrink: 0;
		padding: var(--spacing-lg);
		background: var(--muted)/50;
		border-bottom: 1px solid var(--border);
		text-align: center;
	}

	.view-header h2 {
		margin: 0 0 var(--spacing-sm) 0;
		color: var(--foreground);
		font-size: var(--font-size-xl);
		font-weight: 500;
	}

	.view-header p {
		margin: 0;
		color: var(--muted-foreground);
		font-size: var(--font-size-sm);
	}

	.sequence-info {
		margin-top: var(--spacing-md);
		display: flex;
		justify-content: center;
		gap: var(--spacing-md);
		font-size: var(--font-size-sm);
	}

	.beat-count {
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--primary);
		color: var(--primary-foreground);
		border-radius: var(--border-radius-sm);
		font-weight: 500;
	}

	.sequence-name {
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--muted);
		color: var(--muted-foreground);
		border-radius: var(--border-radius-sm);
	}

	.workbench-placeholder {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: var(--muted-foreground);
		text-align: center;
		padding: var(--spacing-xl);
	}

	.workbench-placeholder p {
		margin: var(--spacing-md) 0;
		font-size: var(--font-size-lg);
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
		backdrop-filter: blur(4px);
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid var(--muted);
		border-top: 4px solid var(--primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: var(--spacing-md);
	}

	.loading-overlay p {
		color: var(--foreground);
		font-size: var(--font-size-lg);
		margin: 0;
		font-weight: 500;
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	@media (max-width: 768px) {
		.construct-header {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-md);
		}

		.construct-controls {
			width: 100%;
			justify-content: space-between;
		}

		.view-header {
			padding: var(--spacing-md);
		}
	}
</style>
