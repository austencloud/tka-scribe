<script lang="ts">
	import type { MotionTesterState } from './state/motion-tester-state.svelte';
	import LocationSelector from './components/LocationSelector.svelte';
	import MotionDetailsControl from './components/MotionDetailsControl.svelte';
	import AnimationControl from './components/AnimationControl.svelte';
	import GridOptionsControl from './components/GridOptionsControl.svelte';


	interface Props {
		state: MotionTesterState;
	}

	let { state }: Props = $props();

	// Animation control handlers
	function handlePlayPause() {
		if (state.animationState.isPlaying) {
			state.stopAnimation();
		} else {
			state.startAnimation();
		}
	}
</script>

<div class="motion-params-panel">
	<h2>🎯 Motion Parameters</h2>
	
	<!-- Location Controls Section -->
	<div class="section">
		<h3>📍 Locations</h3>
		<div class="location-controls">
			<LocationSelector
				propLabel="🔵 Blue"
				propColor="#60a5fa"
				startLocation={state.blueMotionParams.startLoc}
				endLocation={state.blueMotionParams.endLoc}
				onStartLocationChange={state.setBlueStartLocation}
				onEndLocationChange={state.setBlueEndLocation}
			/>
			<LocationSelector
				propLabel="🔴 Red"
				propColor="#f87171"
				startLocation={state.redMotionParams.startLoc}
				endLocation={state.redMotionParams.endLoc}
				onStartLocationChange={state.setRedStartLocation}
				onEndLocationChange={state.setRedEndLocation}
			/>
		</div>
	</div>

	<!-- Motion Details Section -->
	<div class="section">
		<h3>⚙️ Motion Details</h3>
		<div class="motion-controls">
			<MotionDetailsControl
				propLabel="🔵 Blue"
				propColor="#60a5fa"
				startLocation={state.blueMotionParams.startLoc}
				endLocation={state.blueMotionParams.endLoc}
				motionType={state.blueMotionParams.motionType}
				turns={state.blueMotionParams.turns}
				startOrientation={state.blueMotionParams.startOri}
				onMotionTypeChange={(type) => state.updateBlueMotionParam('motionType', type)}
				onTurnsChange={(turns) => state.updateBlueMotionParam('turns', turns)}
				onStartOrientationChange={(ori) => state.updateBlueMotionParam('startOri', ori)}
			/>
			<MotionDetailsControl
				propLabel="🔴 Red"
				propColor="#f87171"
				startLocation={state.redMotionParams.startLoc}
				endLocation={state.redMotionParams.endLoc}
				motionType={state.redMotionParams.motionType}
				turns={state.redMotionParams.turns}
				startOrientation={state.redMotionParams.startOri}
				onMotionTypeChange={(type) => state.updateRedMotionParam('motionType', type)}
				onTurnsChange={(turns) => state.updateRedMotionParam('turns', turns)}
				onStartOrientationChange={(ori) => state.updateRedMotionParam('startOri', ori)}
			/>
		</div>
	</div>

	<!-- Animation Control Section -->
	<div class="section">
		<h3>🎬 Animation Control</h3>
		<AnimationControl
			progress={state.animationState.progress}
			isPlaying={state.animationState.isPlaying}
			onProgressChange={state.setProgress}
			onPlayPause={handlePlayPause}
			onReset={state.resetAnimation}
		/>
	</div>

	<!-- Grid Options Section -->
	<div class="section">
		<h3>🔲 Grid Options</h3>
		<GridOptionsControl
			gridType={state.gridType}
			onGridTypeChange={state.setGridType}
		/>
	</div>


</div>

<style>
	.motion-params-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		gap: 20px;
		padding: 20px;
		box-sizing: border-box;
		overflow-y: auto;
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
		flex-shrink: 0;
	}

	.location-controls {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.motion-controls {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}
</style>
