<!--
  CameraSection.svelte - Camera preview with detection overlay for Practice tab

  Displays the camera feed with grid overlay and detection status indicators.
  Used as the primary visualization panel in all Practice view modes.
-->
<script lang="ts">
	import CameraPreview from "../CameraPreview.svelte";
	import GridOverlay from "../GridOverlay.svelte";
	import { TrainMode } from "../../domain/enums/TrainEnums";
	import type { DetectionFrame } from "../../domain/models/DetectionFrame";
	import type { GridLocation } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";

	interface Props {
		isCameraReady?: boolean;
		isDetectionReady?: boolean;
		isDetectionActive?: boolean;
		isPerforming?: boolean;
		currentFrame?: DetectionFrame | null;
		expectedPositions?: { blue: GridLocation | null; red: GridLocation | null } | null;
		mode?: TrainMode;
		countdownValue?: number | null;
		currentScore?: number;
		currentCombo?: number;
		lastHitResult?: boolean | null;
		lastHitPoints?: number;
		bpm?: number;
		onCameraReady?: () => void;
		onCameraError?: (error: string) => void;
		onFrame?: (video: HTMLVideoElement) => void;
	}

	let {
		isCameraReady = false,
		isDetectionReady = false,
		isDetectionActive = false,
		isPerforming = false,
		currentFrame = null,
		expectedPositions = null,
		mode = TrainMode.SETUP,
		countdownValue = null,
		currentScore = 0,
		currentCombo = 0,
		lastHitResult = null,
		lastHitPoints = 0,
		bpm = 60,
		onCameraReady,
		onCameraError,
		onFrame
	}: Props = $props();
</script>

<div class="camera-section">
	<CameraPreview
		onCameraReady={onCameraReady}
		onCameraError={onCameraError}
		onFrame={onFrame}
		mirrored={true}
	>
		<GridOverlay
			bluePosition={currentFrame?.blue ?? null}
			redPosition={currentFrame?.red ?? null}
			expectedBlue={expectedPositions?.blue ?? null}
			expectedRed={expectedPositions?.red ?? null}
			showExpected={mode === TrainMode.PERFORMING}
			{bpm}
			{isPerforming}
		/>
	</CameraPreview>

	<!-- Countdown overlay -->
	{#if mode === TrainMode.COUNTDOWN && countdownValue !== null}
		<div class="countdown-overlay">
			<span class="countdown-number">{countdownValue || "GO!"}</span>
		</div>
	{/if}

	<!-- Detection Status Indicators -->
	<div class="status-indicators">
		<div class="status-item" class:active={isCameraReady}>
			<div class="status-dot"></div>
			<span>Camera</span>
		</div>
		<div class="status-item" class:active={isDetectionReady}>
			<div class="status-dot"></div>
			<span>Tracking</span>
		</div>
		<div class="status-item" class:active={isDetectionActive}>
			<div class="status-dot"></div>
			<span>Active</span>
		</div>
	</div>

	<!-- Performance Feedback -->
	{#if isPerforming}
		<div class="performance-overlay">
			<div class="score-display">
				{#if currentCombo > 0}
					<div class="combo">
						<span class="combo-value">{currentCombo}x</span>
						<span class="combo-label">Combo</span>
					</div>
				{/if}
				<div class="score">
					<span class="score-value">{currentScore}</span>
				</div>
			</div>
			{#if lastHitResult !== null}
				<div class="hit-indicator" class:hit={lastHitResult} class:miss={!lastHitResult}>
					{lastHitResult ? `+${lastHitPoints}` : "MISS"}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.camera-section {
		position: relative;
		aspect-ratio: 1;
		width: 100%;
		max-width: min(100%, 50vh);
		background: transparent;
		border-radius: 12px;
		overflow: hidden;
		align-self: center;
	}

	/* Status Indicators */
	.status-indicators {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		padding: 0.5rem;
		border-radius: 8px;
		font-size: 0.7rem;
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		opacity: 0.5;
		transition: opacity 0.3s;
		color: rgba(255, 255, 255, 0.9);
	}

	.status-item.active {
		opacity: 1;
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: rgba(107, 114, 128, 0.8);
		transition: all 0.3s;
	}

	.status-item.active .status-dot {
		background: #22c55e;
		box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
	}

	/* Countdown Overlay */
	.countdown-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.7);
		z-index: 30;
	}

	.countdown-number {
		font-size: clamp(3rem, 15vw, 6rem);
		font-weight: bold;
		color: white;
		text-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
		animation: pulse 1s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}

	/* Performance Overlay */
	.performance-overlay {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.5rem;
		pointer-events: none;
	}

	.score-display {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		padding: 0.5rem 0.75rem;
		border-radius: 8px;
		font-weight: 600;
	}

	.combo {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.combo-value {
		font-size: 1.125rem;
		color: #fbbf24;
	}

	.combo-label {
		font-size: 0.625rem;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.6);
	}

	.score-value {
		font-size: 1.25rem;
		color: #3b82f6;
	}

	.hit-indicator {
		padding: 0.375rem 0.75rem;
		border-radius: 6px;
		font-weight: bold;
		font-size: 1rem;
		animation: fadeInOut 0.8s ease-out forwards;
	}

	.hit-indicator.hit {
		background: rgba(34, 197, 94, 0.9);
		color: white;
	}

	.hit-indicator.miss {
		background: rgba(239, 68, 68, 0.9);
		color: white;
	}

	@keyframes fadeInOut {
		0% { opacity: 0; transform: scale(0.8); }
		20% { opacity: 1; transform: scale(1.1); }
		80% { opacity: 1; transform: scale(1); }
		100% { opacity: 0; transform: scale(0.9); }
	}
</style>
