<!--
MotionVisualizationControls.svelte - Animation playback controls

Handles play/pause, reset, and progress scrubbing for motion animations.
Follows accessibility best practices with proper ARIA labels and keyboard support.
-->
<script lang="ts">
	import type { MotionTesterState } from '../state/motion-tester-state.svelte';

	interface Props {
		motionState: MotionTesterState;
	}

	let { motionState }: Props = $props();

	// Reactive state for accessibility
	let progressPercent = $derived(Math.round(motionState.animationState.progress * 100));
	let playButtonLabel = $derived(motionState.animationState.isPlaying ? 'Pause animation' : 'Play animation');
	let progressLabel = $derived(`Animation progress: ${progressPercent}%`);

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
	class="motion-controls"
	role="region"
	aria-label="Animation controls"
	tabindex="-1"
	onkeydown={handleKeyDown}
>
	<div class="controls-header">
		<h3>🎬 Animation Controls</h3>
		<div class="keyboard-hint" aria-label="Keyboard shortcuts">
			<span>Space: Play/Pause</span>
			<span>R: Reset</span>
		</div>
	</div>

	<!-- Playback Controls -->
	<div class="playback-controls" role="group" aria-label="Playback controls">
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
			<span class="btn-text">
				{motionState.animationState.isPlaying ? 'Pause' : 'Play'}
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
			<span class="btn-text">Reset</span>
		</button>
	</div>

	<!-- Progress Control -->
	<div class="progress-control" role="group" aria-label="Animation progress">
		<label for="animation-progress" class="progress-label">
			Progress
		</label>
		
		<div class="slider-container">
			<input
				id="animation-progress"
				type="range"
				min="0"
				max="1"
				step="0.01"
				value={motionState.animationState.progress}
				oninput={handleProgressChange}
				disabled={!motionState.isEngineInitialized}
				aria-label={progressLabel}
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={progressPercent}
				aria-valuetext={`${progressPercent} percent`}
			/>
			
			<output class="progress-value" for="animation-progress" aria-live="polite">
				{progressPercent}%
			</output>
		</div>
	</div>

	<!-- Engine Status Indicator -->
	<div class="status-indicator" aria-live="polite">
		<span 
			class="status-dot {motionState.isEngineInitialized ? 'ready' : 'loading'}"
			aria-hidden="true"
		></span>
		<span class="status-text">
			Engine {motionState.isEngineInitialized ? 'Ready' : 'Loading...'}
		</span>
	</div>
</div>

<style>
	.motion-controls {
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.05));
		border: 1px solid rgba(99, 102, 241, 0.2);
		border-radius: 12px;
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-height: fit-content;
	}

	.motion-controls:focus-within {
		border-color: rgba(99, 102, 241, 0.4);
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1);
	}

	.controls-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 4px;
	}

	.controls-header h3 {
		margin: 0;
		color: #e0e7ff;
		font-size: 1rem;
		font-weight: 600;
	}

	.keyboard-hint {
		display: flex;
		gap: 8px;
		font-size: 11px;
		color: #a5b4fc;
		opacity: 0.7;
	}

	.keyboard-hint span {
		background: rgba(0, 0, 0, 0.2);
		padding: 2px 6px;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	/* Playback Controls */
	.playback-controls {
		display: flex;
		gap: 12px;
		justify-content: center;
	}

	.control-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(99, 102, 241, 0.2);
		border: 1px solid rgba(99, 102, 241, 0.4);
		border-radius: 8px;
		color: white;
		padding: 10px 16px;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
		transition: all 0.2s ease;
		min-width: 80px;
		justify-content: center;
	}

	.control-btn:hover:not(:disabled) {
		background: rgba(99, 102, 241, 0.3);
		border-color: rgba(99, 102, 241, 0.6);
		transform: translateY(-1px);
	}

	.control-btn:active:not(:disabled) {
		transform: translateY(0);
	}

	.control-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: rgba(107, 114, 128, 0.2);
		border-color: rgba(107, 114, 128, 0.3);
	}

	.control-btn:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
	}

	.btn-icon {
		font-size: 16px;
		line-height: 1;
	}

	.btn-text {
		font-size: 13px;
	}

	/* Progress Control */
	.progress-control {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.progress-label {
		color: #c7d2fe;
		font-size: 14px;
		font-weight: 600;
		margin: 0;
	}

	.slider-container {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.slider-container input[type="range"] {
		flex: 1;
		height: 6px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
		outline: none;
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
	}

	.slider-container input[type="range"]:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.slider-container input[type="range"]:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.5);
	}

	.slider-container input[type="range"]::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 18px;
		height: 18px;
		background: #6366f1;
		border-radius: 50%;
		cursor: pointer;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
		transition: all 0.1s ease;
	}

	.slider-container input[type="range"]::-webkit-slider-thumb:hover {
		transform: scale(1.1);
	}

	.slider-container input[type="range"]::-moz-range-thumb {
		width: 18px;
		height: 18px;
		background: #6366f1;
		border-radius: 50%;
		cursor: pointer;
		border: 2px solid white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.progress-value {
		color: #fbbf24;
		font-size: 14px;
		font-weight: 600;
		min-width: 48px;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	/* Status Indicator */
	.status-indicator {
		display: flex;
		align-items: center;
		gap: 8px;
		justify-content: center;
		padding-top: 8px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.status-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		transition: all 0.3s ease;
	}

	.status-dot.ready {
		background: #10b981;
		box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
	}

	.status-dot.loading {
		background: #f59e0b;
		animation: pulse 1.5s infinite;
	}

	.status-text {
		font-size: 12px;
		color: #c7d2fe;
		font-weight: 500;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(0.9);
		}
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.motion-controls {
			padding: 12px;
			gap: 12px;
		}

		.keyboard-hint {
			display: none; /* Hide on mobile to save space */
		}

		.control-btn {
			min-width: 70px;
			padding: 8px 12px;
		}

		.btn-text {
			display: none; /* Show only icons on mobile */
		}

		.controls-header h3 {
			font-size: 0.9rem;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.motion-controls {
			border: 2px solid white;
			background: rgba(0, 0, 0, 0.8);
		}

		.control-btn {
			border: 2px solid white;
		}

		.status-dot.ready {
			background: lime;
		}

		.status-dot.loading {
			background: yellow;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.control-btn {
			transition: none;
		}

		.status-dot.loading {
			animation: none;
		}

		.slider-container input[type="range"]::-webkit-slider-thumb {
			transition: none;
		}
	}
</style>
