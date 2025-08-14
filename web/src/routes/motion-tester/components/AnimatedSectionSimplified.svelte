<!--
AnimatedSectionSimplified.svelte - Simplified animated pictograph

Shows animated pictograph without card wrapper, just pictograph and integrated
animation controls. This is the right 1/3 section of the new layout.
-->
<script lang="ts">
	import type { MotionTesterState } from '../state/motion-tester-state.svelte';
	import Pictograph from '$lib/components/pictograph/Pictograph.svelte';
	import { createPictographData, createGridData } from '$lib/domain';
	import { GridMode, MotionType, Location, Orientation, RotationDirection } from '$lib/domain/enums';

	interface Props {
		motionState: MotionTesterState;
	}

	let { motionState }: Props = $props();

	// Fixed size for consistent layout
	const PICTOGRAPH_SIZE = 280;

	// Reactive state for accessibility
	let progressPercent = $derived(Math.round(motionState.animationState.progress * 100));
	let playButtonLabel = $derived(motionState.animationState.isPlaying ? 'Pause animation' : 'Play animation');
	let progressLabel = $derived(`Animation progress: ${progressPercent}%`);

	// Create pictograph data for animated display (uses current animation progress)
	function createAnimatedPictographData() {
		try {
			const gridMode = motionState.gridType === 'diamond' ? GridMode.DIAMOND : GridMode.BOX;
			
			const gridData = createGridData({
				grid_mode: gridMode
			});

			const pictographData = createPictographData({
				id: 'motion-tester-animated-pictograph',
				grid_data: gridData,
				arrows: {},
				props: {},
				motions: {
					blue: {
						motion_type: motionState.blueMotionParams.motionType as MotionType,
						start_loc: motionState.blueMotionParams.startLoc as Location,
						end_loc: motionState.blueMotionParams.endLoc as Location,
						start_ori: motionState.blueMotionParams.startOri as Orientation,
						end_ori: motionState.blueMotionParams.endOri as Orientation,
						prop_rot_dir: motionState.blueMotionParams.propRotDir as RotationDirection,
						turns: motionState.blueMotionParams.turns,
						is_visible: true
					},
					red: {
						motion_type: motionState.redMotionParams.motionType as MotionType,
						start_loc: motionState.redMotionParams.startLoc as Location,
						end_loc: motionState.redMotionParams.endLoc as Location,
						start_ori: motionState.redMotionParams.startOri as Orientation,
						end_ori: motionState.redMotionParams.endOri as Orientation,
						prop_rot_dir: motionState.redMotionParams.propRotDir as RotationDirection,
						turns: motionState.redMotionParams.turns,
						is_visible: true
					}
				},
				letter: 'T', // T for "Tester"
				beat: 1,
				is_blank: false,
				is_mirrored: false,
				metadata: {
					source: 'motion_tester_animated',
					grid_type: motionState.gridType,
					progress: motionState.animationState.progress
				}
			});

			return pictographData;
		} catch (error) {
			console.error('Error creating animated pictograph data:', error);
			return null;
		}
	}

	let pictographData = $derived(createAnimatedPictographData());

	// Event handlers
	function handlePlayToggle() {
		if (motionState.animationState.isPlaying) {
			motionState.stopAnimation();
		} else {
			motionState.startAnimation();
		}
	}

	function handleReset() {
		motionState.resetAnimation();
	}

	function handleProgressChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		const newProgress = parseFloat(target.value);
		motionState.setProgress(newProgress);
	}

	function handleKeyDown(event: KeyboardEvent) {
		// Space bar for play/pause
		if (event.code === 'Space' && event.target === event.currentTarget) {
			event.preventDefault();
			handlePlayToggle();
		}
		// R key for reset
		if (event.key === 'r' || event.key === 'R') {
			event.preventDefault();
			handleReset();
		}
	}
</script>

<div 
	class="animated-section-simplified"
	role="region"
	aria-label="Animated pictograph with controls"
	tabindex="-1"
	onkeydown={handleKeyDown}
>
	<!-- Animated Pictograph -->
	<div class="pictograph-container">
		{#if pictographData}
			<Pictograph
				pictographData={pictographData}
				width={PICTOGRAPH_SIZE}
				height={PICTOGRAPH_SIZE}
				debug={false}
				beatNumber={null}
			/>
		{:else}
			<div class="error-state">
				<span class="error-icon">⚠️</span>
				<p>Unable to display pictograph</p>
			</div>
		{/if}
	</div>

	<!-- Integrated Animation Controls -->
	<div class="animation-controls">
		<!-- Status Indicator -->
		<div class="status-indicator">
			<span class="status-text">
				{motionState.animationState.isPlaying ? 'Playing' : 'Paused'} • {progressPercent}%
			</span>
		</div>

		<!-- Playback Controls -->
		<div class="playback-controls">
			<button 
				class="control-btn play-btn" 
				onclick={handlePlayToggle}
				disabled={!motionState.isEngineInitialized}
				aria-label={playButtonLabel}
				title={playButtonLabel}
			>
				<span class="btn-icon" aria-hidden="true">
					{motionState.animationState.isPlaying ? '⏸️' : '▶️'}
				</span>
			</button>
			
			<button 
				class="control-btn reset-btn" 
				onclick={handleReset}
				disabled={!motionState.isEngineInitialized}
				aria-label="Reset animation to beginning"
				title="Reset animation"
			>
				<span class="btn-icon" aria-hidden="true">⏹️</span>
			</button>
		</div>

		<!-- Progress Control -->
		<div class="progress-control">
			<input
				type="range"
				class="progress-slider"
				min="0"
				max="1"
				step="0.01"
				value={motionState.animationState.progress}
				oninput={handleProgressChange}
				disabled={!motionState.isEngineInitialized}
				aria-label={progressLabel}
				title="Scrub animation progress"
			/>
			<div class="progress-labels">
				<span>0%</span>
				<span>{progressPercent}%</span>
				<span>100%</span>
			</div>
		</div>

		<!-- Keyboard Shortcuts -->
		<div class="keyboard-hint">
			<span>Space: Play/Pause</span>
			<span>R: Reset</span>
		</div>
	</div>
</div>

<style>
	.animated-section-simplified {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.03), rgba(16, 185, 129, 0.03));
		border-radius: 8px;
		overflow: hidden;
	}

	.animated-section-simplified:focus-within {
		outline: 2px solid rgba(139, 92, 246, 0.3);
		outline-offset: 2px;
	}

	.pictograph-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		background: rgba(255, 255, 255, 0.02);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		min-height: 300px;
	}

	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #f87171;
		text-align: center;
		padding: 40px;
	}

	.error-icon {
		font-size: 32px;
		margin-bottom: 12px;
	}

	.error-state p {
		margin: 0;
		font-size: 16px;
		color: #fca5a5;
	}

	.animation-controls {
		background: rgba(0, 0, 0, 0.1);
		padding: 16px;
		flex-shrink: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.status-indicator {
		text-align: center;
	}

	.status-text {
		font-size: 12px;
		font-weight: 600;
		color: #a5b4fc;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.playback-controls {
		display: flex;
		gap: 8px;
		justify-content: center;
	}

	.control-btn {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 6px;
		color: #c7d2fe;
		padding: 8px 12px;
		cursor: pointer;
		font-size: 16px;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 40px;
	}

	.control-btn:hover:not(:disabled) {
		background: rgba(139, 92, 246, 0.2);
		border-color: rgba(139, 92, 246, 0.4);
		color: white;
	}

	.control-btn:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.5);
	}

	.control-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.progress-control {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.progress-slider {
		width: 100%;
		height: 6px;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 3px;
		outline: none;
		cursor: pointer;
		-webkit-appearance: none;
		appearance: none;
	}

	.progress-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		background: #8b5cf6;
		border-radius: 50%;
		cursor: pointer;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.progress-slider::-moz-range-thumb {
		width: 16px;
		height: 16px;
		background: #8b5cf6;
		border-radius: 50%;
		cursor: pointer;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.progress-labels {
		display: flex;
		justify-content: space-between;
		font-size: 10px;
		color: #a5b4fc;
	}

	.keyboard-hint {
		display: flex;
		justify-content: center;
		gap: 12px;
		font-size: 10px;
		color: #a5b4fc;
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.pictograph-container {
			padding: 15px;
			min-height: 250px;
		}

		.animation-controls {
			padding: 12px;
		}

		.keyboard-hint {
			display: none;
		}
	}
</style>
