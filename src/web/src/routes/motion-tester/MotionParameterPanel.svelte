<script lang="ts">
	import type { MotionTesterState } from './motion-tester-state.svelte.ts';

	interface Props {
		state: MotionTesterState;
	}

	let { state }: Props = $props();

	// Helper function to determine motion type based on start/end locations
	function getMotionType(startLoc: string, endLoc: string): string {
		if (startLoc === endLoc) {
			return 'static'; // Same location = static
		}

		// Check if it's a dash motion (opposite locations)
		const opposites = [
			['n', 's'], ['s', 'n'],
			['e', 'w'], ['w', 'e']
		];

		for (const [start, end] of opposites) {
			if (startLoc === start && endLoc === end) {
				return 'dash';
			}
		}

		// Adjacent locations = shift motion (pro/anti/float)
		return 'pro'; // Default to pro for shift motions
	}

	// Helper function to get available motion types for a start/end pair
	function getAvailableMotionTypes(startLoc: string, endLoc: string): string[] {
		const motionType = getMotionType(startLoc, endLoc);

		if (motionType === 'static') {
			return ['static'];
		} else if (motionType === 'dash') {
			return ['dash'];
		} else {
			// Shift motions can be pro, anti, or float
			return ['pro', 'anti', 'float'];
		}
	}

	// Compact location options
	const locations = ['n', 'e', 's', 'w'];

	// Simplified orientation options (no cardinal directions)
	const orientations = [
		{ value: 'in', label: 'In' },
		{ value: 'out', label: 'Out' },
		{ value: 'clock', label: 'Clock' },
		{ value: 'counter', label: 'Counter' }
	];

	// Update motion type when locations change
	function updateMotionType(propType: 'blue' | 'red') {
		const params = propType === 'blue' ? state.blueMotionParams : state.redMotionParams;
		const newMotionType = getMotionType(params.startLoc, params.endLoc);
		const availableTypes = getAvailableMotionTypes(params.startLoc, params.endLoc);

		// If current motion type is not available, switch to the first available
		if (!availableTypes.includes(params.motionType)) {
			if (propType === 'blue') {
				state.updateBlueMotionParam('motionType', availableTypes[0]);
			} else {
				state.updateRedMotionParam('motionType', availableTypes[0]);
			}
		}
	}

</script>

<div class="motion-params-panel">
	<h2>🎯 Motion Parameters</h2>

	<!-- Location Controls Section -->
	<div class="section">
		<h3>📍 Locations</h3>
		<div class="location-controls">
			<!-- Blue Prop -->
			<div class="prop-row">
				<div class="prop-label">🔵 Blue</div>
				<div class="location-selectors">
					<select
						value={state.blueMotionParams.startLoc}
						onchange={(e) => {
							state.setBlueStartLocation(e.currentTarget.value);
							updateMotionType('blue');
						}}
					>
						{#each locations as loc}
							<option value={loc}>{loc.toUpperCase()}</option>
						{/each}
					</select>
					<span class="arrow">→</span>
					<select
						value={state.blueMotionParams.endLoc}
						onchange={(e) => {
							state.setBlueEndLocation(e.currentTarget.value);
							updateMotionType('blue');
						}}
					>
						{#each locations as loc}
							<option value={loc}>{loc.toUpperCase()}</option>
						{/each}
					</select>
				</div>
				<div class="motion-type-display">
					{getMotionType(state.blueMotionParams.startLoc, state.blueMotionParams.endLoc).toUpperCase()}
				</div>
			</div>

			<!-- Red Prop -->
			<div class="prop-row">
				<div class="prop-label">🔴 Red</div>
				<div class="location-selectors">
					<select
						value={state.redMotionParams.startLoc}
						onchange={(e) => {
							state.setRedStartLocation(e.currentTarget.value);
							updateMotionType('red');
						}}
					>
						{#each locations as loc}
							<option value={loc}>{loc.toUpperCase()}</option>
						{/each}
					</select>
					<span class="arrow">→</span>
					<select
						value={state.redMotionParams.endLoc}
						onchange={(e) => {
							state.setRedEndLocation(e.currentTarget.value);
							updateMotionType('red');
						}}
					>
						{#each locations as loc}
							<option value={loc}>{loc.toUpperCase()}</option>
						{/each}
					</select>
				</div>
				<div class="motion-type-display">
					{getMotionType(state.redMotionParams.startLoc, state.redMotionParams.endLoc).toUpperCase()}
				</div>
			</div>
		</div>
	</div>

	<!-- Motion Details Section -->
	<div class="section">
		<h3>⚙️ Motion Details</h3>
		<div class="motion-controls">
			<!-- Blue Prop Controls -->
			<div class="prop-controls-row">
				<div class="prop-header">🔵 Blue</div>
				<div class="control-group">
					<label for="blueMotionType">Motion:</label>
					<select
						id="blueMotionType"
						value={state.blueMotionParams.motionType}
						onchange={(e) => state.updateBlueMotionParam('motionType', e.currentTarget.value)}
					>
						{#each getAvailableMotionTypes(state.blueMotionParams.startLoc, state.blueMotionParams.endLoc) as motionType}
							<option value={motionType}>{motionType.toUpperCase()}</option>
						{/each}
					</select>
				</div>
				<div class="control-group">
					<label>Turns:</label>
					<div class="turns-control">
						<button onclick={() => state.updateBlueMotionParam('turns', Math.max(0, state.blueMotionParams.turns - 0.5))}>−</button>
						<span class="turns-value">{state.blueMotionParams.turns}</span>
						<button onclick={() => state.updateBlueMotionParam('turns', Math.min(10, state.blueMotionParams.turns + 0.5))}>+</button>
					</div>
				</div>
				<div class="control-group">
					<label for="blueStartOri">Start Ori:</label>
					<select
						id="blueStartOri"
						value={state.blueMotionParams.startOri}
						onchange={(e) => state.updateBlueMotionParam('startOri', e.currentTarget.value)}
					>
						{#each orientations as ori}
							<option value={ori.value}>{ori.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Red Prop Controls -->
			<div class="prop-controls-row">
				<div class="prop-header">🔴 Red</div>
				<div class="control-group">
					<label for="redMotionType">Motion:</label>
					<select
						id="redMotionType"
						value={state.redMotionParams.motionType}
						onchange={(e) => state.updateRedMotionParam('motionType', e.currentTarget.value)}
					>
						{#each getAvailableMotionTypes(state.redMotionParams.startLoc, state.redMotionParams.endLoc) as motionType}
							<option value={motionType}>{motionType.toUpperCase()}</option>
						{/each}
					</select>
				</div>
				<div class="control-group">
					<label>Turns:</label>
					<div class="turns-control">
						<button onclick={() => state.updateRedMotionParam('turns', Math.max(0, state.redMotionParams.turns - 0.5))}>−</button>
						<span class="turns-value">{state.redMotionParams.turns}</span>
						<button onclick={() => state.updateRedMotionParam('turns', Math.min(10, state.redMotionParams.turns + 0.5))}>+</button>
					</div>
				</div>
				<div class="control-group">
					<label for="redStartOri">Start Ori:</label>
					<select
						id="redStartOri"
						value={state.redMotionParams.startOri}
						onchange={(e) => state.updateRedMotionParam('startOri', e.currentTarget.value)}
					>
						{#each orientations as ori}
							<option value={ori.value}>{ori.label}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	</div>

	<!-- Animation Control Section -->
	<div class="section">
		<h3>🎬 Animation Control</h3>
		<div class="animation-controls">
			<div class="control-group">
				<label for="progressSlider">Progress:</label>
				<div class="slider-container">
					<input
						id="progressSlider"
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={state.animationState.progress}
						oninput={(e) => state.setProgress(parseFloat(e.currentTarget.value))}
					>
					<span class="progress-value">{Math.round(state.animationState.progress * 100)}%</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Prop Visibility Section -->
	<div class="section">
		<h3>👁️ Visibility</h3>
		<div class="visibility-controls">
			<div class="visibility-row">
				<label>
					<input
						type="checkbox"
						checked={state.propVisibility.blue}
						onchange={(e) => state.setBluePropVisible(e.currentTarget.checked)}
					>
					🔵 Blue Prop
				</label>
				<label>
					<input
						type="checkbox"
						checked={state.propVisibility.red}
						onchange={(e) => state.setRedPropVisible(e.currentTarget.checked)}
					>
					🔴 Red Prop
				</label>
			</div>
		</div>
	</div>


	<!-- Progress Control -->
	<div class="input-group">
		<label for="progressSlider">Animation Progress</label>
		<div class="slider-container">
			<input 
				id="progressSlider"
				type="range" 
				min="0" 
				max="100" 
				value={state.animationState.progress * 100}
				oninput={(e) => state.setProgress(parseFloat(e.currentTarget.value) / 100)}
			>
			<div class="slider-value">
				{(state.animationState.progress * 100).toFixed(1)}%
			</div>
		</div>
	</div>

	<!-- Animation Speed -->
	<div class="input-group">
		<label for="speedSlider">Animation Speed</label>
		<div class="slider-container">
			<input 
				id="speedSlider"
				type="range" 
				min="1" 
				max="100" 
				value={state.animationState.speed * 1000}
				oninput={(e) => state.setSpeed(parseFloat(e.currentTarget.value) / 1000)}
			>
			<div class="slider-value">
				{(state.animationState.speed * 1000).toFixed(0)}%
			</div>
		</div>
	</div>


</div>

<style>
	.motion-params-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 100vh;
		gap: 20px;
		padding: 20px;
		box-sizing: border-box;
	}

	h2 {
		margin: 0 0 20px 0;
		color: #e0e7ff;
		font-size: 1.2rem;
		border-bottom: 2px solid rgba(99, 102, 241, 0.3);
		padding-bottom: 10px;
		text-align: center;
	}

	h3 {
		margin: 0 0 15px 0;
		color: #c7d2fe;
		font-size: 1rem;
		font-weight: 600;
	}

	.section {
		background: rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 20px;
		flex: 1;
		min-height: 120px;
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
		color: #c7d2fe;
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

	.motion-controls {
		background: rgba(0, 0, 0, 0.15);
		padding: 12px;
		border-radius: 6px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.prop-controls-row {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
	}

	.prop-header {
		font-weight: 600;
		font-size: 0.9rem;
		color: #c7d2fe;
		min-width: 60px;
	}

	.control-group {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.8rem;
	}

	.control-group label {
		color: #c7d2fe;
		font-size: 0.75rem;
		min-width: 50px;
	}

	.control-group select {
		padding: 4px 6px;
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 3px;
		background: rgba(255, 255, 255, 0.1);
		color: white;
		font-size: 11px;
		min-width: 70px;
	}

	.turns-control {
		display: flex;
		align-items: center;
		gap: 4px;
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 3px;
		padding: 2px;
	}

	.turns-control button {
		background: rgba(99, 102, 241, 0.3);
		border: none;
		color: white;
		width: 20px;
		height: 20px;
		border-radius: 2px;
		cursor: pointer;
		font-size: 12px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.turns-control button:hover {
		background: rgba(99, 102, 241, 0.5);
	}

	.turns-value {
		color: white;
		font-size: 11px;
		min-width: 20px;
		text-align: center;
	}

	.location-controls {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.animation-controls {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.visibility-controls {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.visibility-row {
		display: flex;
		gap: 20px;
		flex-wrap: wrap;
	}

	.visibility-row label {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #c7d2fe;
		font-size: 0.9rem;
		cursor: pointer;
	}

	.visibility-row input[type="checkbox"] {
		width: 16px;
		height: 16px;
		accent-color: #6366f1;
	}

	.slider-container {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.slider-container input[type="range"] {
		flex: 1;
		height: 6px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
		outline: none;
		-webkit-appearance: none;
	}

	.slider-container input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		background: #6366f1;
		border-radius: 50%;
		cursor: pointer;
	}

	.progress-value {
		color: #fbbf24;
		font-size: 0.8rem;
		font-weight: 600;
		min-width: 40px;
		text-align: right;
	}


	.auto-row {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
		color: #c7d2fe;
		margin-bottom: 4px;
	}

	.auto-row:last-child {
		margin-bottom: 0;
	}

	.orientation-visualizer {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}

	.orientation-display {
		padding: 12px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		text-align: center;
	}

	.orientation-display h4 {
		margin: 0 0 8px 0;
		color: #fbbf24;
		font-size: 0.9rem;
	}

	.orientation-arrow {
		font-size: 1.5rem;
		margin: 8px 0;
	}

	.orientation-text {
		font-size: 0.8rem;
		color: #c7d2fe;
		text-transform: capitalize;
	}
</style>
