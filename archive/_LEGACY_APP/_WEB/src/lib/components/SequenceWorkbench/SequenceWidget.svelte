<script lang="ts">
	import { useResponsiveLayout } from '$lib/composables/useResponsiveLayout';
	import { getSequenceContext, sequenceActions } from '$lib/context/sequence/sequenceContext';

	// Components
	import IndicatorLabel from './Labels/IndicatorLabel.svelte';
	import CurrentWordLabel from './Labels/CurrentWordLabel.svelte';
	import DifficultyLabel from './Labels/DifficultyLabel.svelte';
	// Import the new collapsible button panel 
	import SequenceWidgetButtonPanel from './ButtonPanel/ButtonPanel.svelte';
	import BeatFrame from './SequenceBeatFrame/SequenceBeatFrame.svelte';

	// Props
	export let workbenchHeight: number;

	// Get context
	const { state, dispatch } = getSequenceContext();

	// Use responsive layout hook
	const { dimensions, isPortrait } = useResponsiveLayout();

	// Derived values from context state
	$: ({ sequenceName, difficultyLevel, status } = $state);
	$: statusText = getStatusText(status);

	// Function to get user-friendly status text
	function getStatusText(status: string): string {
		switch (status) {
			case 'ready':
				return 'Ready';
			case 'editing':
				return 'Editing';
			case 'saving':
				return 'Saving...';
			case 'error':
				return 'Error';
			default:
				return 'Ready';
		}
	}

	// Handler for button panel actions
	function handleButtonAction(event: CustomEvent<{ id: string }>) {
		const { id } = event.detail;

		// Map button actions to context actions
		switch (id) {
			case 'addToDictionary':
				// Handle dictionary addition - might need additional logic
				dispatch({ type: 'SET_STATUS', payload: 'saving' });
				// After the operation completes:
				setTimeout(() => dispatch({ type: 'SET_STATUS', payload: 'ready' }), 500);
				break;

			case 'saveImage':
				// Handle image saving
				dispatch({ type: 'SET_STATUS', payload: 'saving' });
				// After save completes:
				setTimeout(() => dispatch({ type: 'SET_STATUS', payload: 'ready' }), 500);
				break;

			case 'viewFullScreen':
				// Handle full screen - this would be UI only, no state change needed
				console.log('Entering full screen mode');
				break;

			case 'mirrorSequence':
				dispatch(sequenceActions.mirrorSequence());
				break;

			case 'swapColors':
				dispatch(sequenceActions.swapColors());
				break;

			case 'rotateSequence':
				// Rotation might need additional parameters
				dispatch({ type: 'SET_STATUS', payload: 'editing' });
				// After rotation completes:
				setTimeout(() => dispatch({ type: 'SET_STATUS', payload: 'ready' }), 200);
				break;

			case 'deleteBeat':
				// Delete the currently selected beat
				if ($state.selectedBeatIndex >= 0) {
					dispatch(sequenceActions.removeBeat($state.selectedBeatIndex));
				}
				break;

			case 'clearSequence':
				dispatch(sequenceActions.clearSequence());
				break;
		}
	}
</script>

<div class="sequence-widget">
	<div class="main-layout" class:portrait={$isPortrait}>
		<div class="left-vbox">
			<div class="centered-group">
				<div class="sequence-widget-labels">
					<CurrentWordLabel currentWord={sequenceName} width={$dimensions.width} />
					<DifficultyLabel {difficultyLevel} width={$dimensions.width} />
				</div>

				<div class="beat-frame-container">
					<BeatFrame />
				</div>
			</div>

			<div class="indicator-label-container">
				<IndicatorLabel text={statusText} width={$dimensions.width} />
			</div>

			<!-- Button Panel in portrait mode - using collapsible version -->
			{#if $isPortrait}
				<SequenceWidgetButtonPanel
					isPortrait={$isPortrait}
					containerWidth={$dimensions.width}
					containerHeight={$dimensions.height}
					on:action={handleButtonAction}
				/>
			{/if}
		</div>

		<!-- Button Panel in landscape mode - using collapsible version -->
		{#if !$isPortrait}
			<SequenceWidgetButtonPanel
				isPortrait={$isPortrait}
				containerWidth={$dimensions.width}
				containerHeight={workbenchHeight}
				on:action={handleButtonAction}
			/>
		{/if}
	</div>
</div>

<style>
	.sequence-widget {
		display: flex;
		flex-direction: column;
		height: 100%;
		flex: 1;
	}

	.main-layout {
		display: flex;
		flex-direction: row;
		height: 100%;
	}

	.main-layout.portrait {
		flex-direction: column;
	}

	.left-vbox {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		min-height: 0;
		flex: 14;
	}

	.centered-group {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		width: 100%;
	}

	.beat-frame-container {
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 1;
		min-height: 0;
		width: 100%;
	}

	.sequence-widget-labels {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		color: white;
	}

	.indicator-label-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10px;
		color: white;
		flex: 1;
	}
</style>