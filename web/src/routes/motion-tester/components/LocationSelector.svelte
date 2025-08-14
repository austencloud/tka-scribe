<script lang="ts">
	import { MotionParameterService } from '../services/MotionParameterService';

	interface Props {
		propLabel: string;
		propColor: string;
		startLocation: string;
		endLocation: string;
		onStartLocationChange: (location: string) => void;
		onEndLocationChange: (location: string) => void;
	}

	let { 
		propLabel, 
		propColor, 
		startLocation, 
		endLocation, 
		onStartLocationChange, 
		onEndLocationChange 
	}: Props = $props();

	const motionService = new MotionParameterService();
	const locations = ['n', 'e', 's', 'w'];

	// Get motion type display
	let motionType = $derived(motionService.getMotionType(startLocation, endLocation));
</script>

<div class="location-selector">
	<div class="prop-row">
		<div class="prop-label" style="color: {propColor}">
			{propLabel}
		</div>
		<div class="location-selectors">
			<select 
				value={startLocation}
				onchange={(e) => onStartLocationChange(e.currentTarget.value)}
			>
				{#each locations as loc}
					<option value={loc}>{loc.toUpperCase()}</option>
				{/each}
			</select>
			<span class="arrow">→</span>
			<select 
				value={endLocation}
				onchange={(e) => onEndLocationChange(e.currentTarget.value)}
			>
				{#each locations as loc}
					<option value={loc}>{loc.toUpperCase()}</option>
				{/each}
			</select>
		</div>
		<div class="motion-type-display">
			{motionType.toUpperCase()}
		</div>
	</div>
</div>

<style>
	.location-selector {
		width: 100%;
	}

	.prop-row {
		display: grid;
		grid-template-columns: 60px 1fr 80px;
		gap: 10px;
		align-items: center;
	}

	.prop-label {
		font-weight: 600;
		font-size: 0.9rem;
	}

	.location-selectors {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.location-selectors select {
		flex: 1;
		padding: 6px 8px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		font-size: 13px;
	}

	.location-selectors select option {
		background: #312e81;
		color: white;
	}

	.arrow {
		color: #fbbf24;
		font-weight: bold;
		font-size: 16px;
	}

	.motion-type-display {
		background: rgba(99, 102, 241, 0.2);
		padding: 4px 8px;
		border-radius: 4px;
		text-align: center;
		font-size: 11px;
		font-weight: 600;
		color: #a5b4fc;
	}
</style>
