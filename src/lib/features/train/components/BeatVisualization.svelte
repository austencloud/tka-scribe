<!--
  BeatVisualization.svelte - Current Beat Display

  Shows the current beat from the sequence during training.
  Displays pictograph visualization and beat information.
-->
<script lang="ts">
	import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
	import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";

	interface Props {
		beat: BeatData | null;
		beatNumber: number;
		totalBeats: number;
		showDetails?: boolean;
	}

	let { beat = null, beatNumber = 0, totalBeats = 0, showDetails = true }: Props = $props();

	// Get beat info for display
	const hasBeat = $derived(beat !== null);
	const isBlank = $derived(beat?.isBlank ?? false);
</script>

<div class="beat-visualization">
	<!-- Beat counter -->
	<div class="beat-header">
		<span class="beat-counter">Beat {beatNumber} / {totalBeats}</span>
	</div>

	<!-- Pictograph visualization -->
	<div class="pictograph-container">
		{#if hasBeat && !isBlank}
			<Pictograph pictographData={beat} />
		{:else if isBlank}
			<div class="blank-beat">
				<span>Blank Beat</span>
			</div>
		{:else}
			<div class="no-beat">
				<span>No beat data</span>
			</div>
		{/if}
	</div>

	<!-- Beat details (optional) -->
	{#if showDetails && beat}
		<div class="beat-details">
			{#if beat.blueReversal || beat.redReversal}
				<div class="reversals">
					{#if beat.blueReversal}
						<span class="reversal blue">Blue Reversal</span>
					{/if}
					{#if beat.redReversal}
						<span class="reversal red">Red Reversal</span>
					{/if}
				</div>
			{/if}

			{#if beat.motions}
				<div class="positions">
					{#if beat.motions.blue}
						<div class="position-info">
							<span class="label blue">Blue:</span>
							<span class="location">{beat.motions.blue.endLocation}</span>
						</div>
					{/if}
					{#if beat.motions.red}
						<div class="position-info">
							<span class="label red">Red:</span>
							<span class="location">{beat.motions.red.endLocation}</span>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.beat-visualization {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
	}

	.beat-header {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.beat-counter {
		font-size: 1.25rem;
		font-weight: 600;
		color: white;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.pictograph-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 200px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
		padding: 1rem;
	}

	.blank-beat,
	.no-beat {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		color: rgba(255, 255, 255, 0.5);
		font-size: 1rem;
	}

	.beat-details {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-size: 0.875rem;
	}

	.reversals {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.reversal {
		padding: 0.25rem 0.75rem;
		border-radius: 4px;
		font-weight: 600;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.reversal.blue {
		background: rgba(59, 130, 246, 0.2);
		color: #3b82f6;
		border: 1px solid rgba(59, 130, 246, 0.3);
	}

	.reversal.red {
		background: rgba(239, 68, 68, 0.2);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.positions {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.position-info {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.label {
		font-weight: 600;
		min-width: 50px;
	}

	.label.blue {
		color: #3b82f6;
	}

	.label.red {
		color: #ef4444;
	}

	.location {
		font-family: monospace;
		color: rgba(255, 255, 255, 0.9);
	}
</style>
