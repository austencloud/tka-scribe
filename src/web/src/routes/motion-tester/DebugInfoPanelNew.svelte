<script lang="ts">
	import type { MotionTesterState } from './state/motion-tester-state.svelte';
	import PropStateDisplay from './components/PropStateDisplay.svelte';
	import EngineStatus from './components/EngineStatus.svelte';
	import QuickTestButtons from './components/QuickTestButtons.svelte';

	interface Props {
		state: MotionTesterState;
	}

	let { state }: Props = $props();
</script>

<div class="debug-info-panel">
	<h2>🔍 Debug Information</h2>
	
	<!-- Engine Status -->
	<EngineStatus
		isEngineInitialized={state.isEngineInitialized}
		animationState={state.animationState.isPlaying ? 'Playing' : 'Paused'}
		totalBeats={1}
		currentBeat={state.animationState.currentBeat}
	/>

	<!-- Prop States -->
	<div class="prop-states">
		<PropStateDisplay
			propName="Blue"
			propColor="#60a5fa"
			propState={state.currentPropStates.blue}
		/>
		<PropStateDisplay
			propName="Red"
			propColor="#f87171"
			propState={state.currentPropStates.red}
		/>
	</div>

	<!-- Quick Test Buttons -->
	<QuickTestButtons {state} />

	<!-- Motion Descriptions -->
	<div class="motion-descriptions">
		<h4>📝 Motion Descriptions</h4>
		<div class="description-grid">
			<div class="description-item">
				<span class="prop-label blue">🔵 Blue:</span>
				<span class="description-text">
					{state.blueMotionParams.startLoc.toUpperCase()}→{state.blueMotionParams.endLoc.toUpperCase()} 
					{state.blueMotionParams.motionType.toUpperCase()} 
					{state.blueMotionParams.turns}T 
					{state.blueMotionParams.propRotDir.toUpperCase()}
				</span>
			</div>
			<div class="description-item">
				<span class="prop-label red">🔴 Red:</span>
				<span class="description-text">
					{state.redMotionParams.startLoc.toUpperCase()}→{state.redMotionParams.endLoc.toUpperCase()} 
					{state.redMotionParams.motionType.toUpperCase()} 
					{state.redMotionParams.turns}T 
					{state.redMotionParams.propRotDir.toUpperCase()}
				</span>
			</div>
		</div>
	</div>
</div>

<style>
	.debug-info-panel {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 20px;
		height: 100%;
		overflow-y: auto;
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

	h4 {
		margin: 0 0 12px 0;
		color: #c7d2fe;
		font-size: 0.9rem;
		font-weight: 600;
	}

	.prop-states {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.motion-descriptions {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 6px;
		padding: 15px;
	}

	.description-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.description-item {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.8rem;
	}

	.prop-label {
		font-weight: 600;
		min-width: 60px;
	}

	.prop-label.blue {
		color: #60a5fa;
	}

	.prop-label.red {
		color: #f87171;
	}

	.description-text {
		color: #c7d2fe;
		font-family: 'Courier New', monospace;
		background: rgba(0, 0, 0, 0.3);
		padding: 4px 8px;
		border-radius: 3px;
		flex: 1;
	}
</style>
