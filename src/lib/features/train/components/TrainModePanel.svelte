<!--
  TrainModePanel.svelte - Main Train Mode Panel

  Full-screen training interface with camera preview and beat visualization.
  Responsive layout that works on all device sizes.
-->
<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { createTrainState } from "../state/train-state.svelte";
	import { TrainMode, PracticeMode } from "../domain/enums/TrainEnums";
	import type { AdaptiveConfig, StepConfig, TimedConfig } from "../state/train-practice-state.svelte";
	import CameraPreview from "./CameraPreview.svelte";
	import GridOverlay from "./GridOverlay.svelte";
	import Pictograph from "$lib/shared/pictograph/shared/components/Pictograph.svelte";
	import HitFeedback from "./HitFeedback.svelte";
	import ResultsScreen from "./ResultsScreen.svelte";
	import TrainSetup from "./TrainSetup.svelte";
	import type { IPositionDetectionService } from "../services/contracts/IPositionDetectionService";
	import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
	import { resolve, TYPES } from "$lib/shared/inversify/di";
	import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
	import type { ITrainChallengeService } from "../services/contracts/ITrainChallengeService";
	import type { IPerformanceHistoryService } from "../services/contracts/IPerformanceHistoryService";
	import type { IAchievementService } from "$lib/shared/gamification/services/contracts/IAchievementService";
	import type { StoredPerformance } from "../domain/models/TrainDatabaseModels";
	import { activeChallengeState } from "../state/active-challenge-state.svelte";
	import {
		sessionResultToScore,
		checkChallengeRequirement,
		calculateSessionXP,
		type SessionResult,
	} from "../utils/challenge-completion-detector";
	import { addNotification } from "$lib/shared/gamification/state/notification-state.svelte";
	import { getTrainPracticeState } from "../state/train-practice-state.svelte";
	import PracticeModeToggle from "./practice/PracticeModeToggle.svelte";
	import ModeSettingsSheet from "./practice/ModeSettingsSheet.svelte";

	interface Props {
		sequence?: SequenceData | null;
		practiceMode?: PracticeMode;
		modeConfig?: AdaptiveConfig | StepConfig | TimedConfig;
		challengeId?: string;
		onBack?: () => void;
		onSessionComplete?: () => void;
	}

	let {
		sequence = null,
		practiceMode = PracticeMode.TIMED,
		modeConfig,
		challengeId,
		onBack,
		onSessionComplete
	}: Props = $props();

	// Practice state for mode switching and settings
	const practiceState = getTrainPracticeState();

	// Settings sheet state
	let showSettingsSheet = $state(false);

	// Initialize train state
	const trainState = createTrainState();

	// Services
	let detectionService: IPositionDetectionService | null = $state(null);
	let hapticService: IHapticFeedbackService | undefined;
	let isDetectionReady = $state(false);
	const challengeService = resolve<ITrainChallengeService>(
		TYPES.ITrainChallengeService
	);
	const achievementService = resolve<IAchievementService>(
		TYPES.IAchievementService
	);
	const historyService = resolve<IPerformanceHistoryService>(
		TYPES.IPerformanceHistoryService
	);

	// Session tracking
	let sessionStartTime = 0;
	let hasProcessedSession = false;

	// Results data for display
	let sessionXPBreakdown = $state<{
		baseXP: number;
		accuracyBonus: number;
		comboBonus: number;
		totalXP: number;
	} | undefined>(undefined);

	let sessionChallengeProgress = $state<{
		challenge: any;
		currentProgress: number;
		isComplete: boolean;
	} | undefined>(undefined);

	// Timing system (using requestAnimationFrame for better performance)
	let beatAnimationFrameId: number | null = null;
	let lastBeatTime = 0;
	let beatDuration = 0;

	// Hit detection tracking
	let hasCheckedCurrentBeat = false;
	let lastHitResult: boolean | null = $state(null);
	let lastHitPoints = $state(0);

	// UI state
	let showBeatGrid = $state(true); // Default to beat grid view

	// Set sequence if provided
	$effect(() => {
		if (sequence) {
			trainState.setSequence(sequence);
		}
	});

	async function initDetection() {
		try {
			detectionService = resolve<IPositionDetectionService>(TYPES.IPositionDetectionService);
			await detectionService.initialize();
			isDetectionReady = true;
		} catch (error) {
			console.error("Failed to initialize detection:", error);
			trainState.setError("Failed to initialize hand detection. Please refresh and try again.");
		}
	}

	function handleCameraReady() {
		trainState.setCameraReady(true);
	}

	function handleCameraError(error: string) {
		trainState.setError(`Camera error: ${error}`);
		trainState.setCameraReady(false);
	}

	async function handleFrame(video: HTMLVideoElement) {
		if (!detectionService || !isDetectionReady || !trainState.isCameraReady) return;

		try {
			// Start detection if not already active
			if (!trainState.isDetectionActive) {
				trainState.setDetectionActive(true);
				await detectionService.startRealTimeDetection(
					video,
					(frame) => {
						trainState.updateDetectionFrame(frame);
					},
					{ mirrored: true }
				);
			}
		} catch (error) {
			console.error("Detection error:", error);
		}
	}

	function handleStartCountdown() {
		hapticService?.trigger("selection");
		trainState.startCountdown();
		runCountdown();
	}

	function runCountdown() {
		let count = 3;
		const interval = setInterval(() => {
			count--;
			if (count >= 0) {
				trainState.updateCountdown(count);
			} else {
				clearInterval(interval);
			}
		}, 1000);
	}

	function handleBackToSetup() {
		hapticService?.trigger("selection");
		stopBeatTimer();
		if (detectionService) {
			detectionService.stopDetection();
		}
		trainState.setDetectionActive(false);
		trainState.resetToSetup();
	}

	// Timing system - start beat timer when performance begins
	$effect(() => {
		if (trainState.isPerforming && !beatAnimationFrameId) {
			startBeatTimer();
			// Record session start time
			sessionStartTime = Date.now();
			hasProcessedSession = false;
		} else if (!trainState.isPerforming && beatAnimationFrameId) {
			stopBeatTimer();
		}
	});

	// Process session completion when entering REVIEW mode
	$effect(() => {
		if (trainState.mode === TrainMode.REVIEW && !hasProcessedSession) {
			hasProcessedSession = true;
			processSessionCompletion();
		}
	});

	async function processSessionCompletion() {
		const duration = Date.now() - sessionStartTime;
		const accuracy =
			trainState.totalBeats > 0
				? (trainState.totalHits / trainState.totalBeats) * 100
				: 0;

		const sessionResult: SessionResult = {
			totalBeats: trainState.totalBeats,
			hits: trainState.totalHits,
			misses: trainState.totalMisses,
			maxCombo: trainState.maxCombo,
			finalScore: trainState.currentScore,
			accuracy,
			mode: practiceMode,
			sequenceId: sequence?.id,
			bpm: (modeConfig as any)?.bpm, // For timed mode
			duration,
		};

		// Award base session XP
		const xpBreakdown = calculateSessionXP(sessionResult);
		sessionXPBreakdown = xpBreakdown; // Store for ResultsScreen

		// Determine grade based on accuracy
		const grade = accuracy >= 95 ? "S" : accuracy >= 85 ? "A" : accuracy >= 70 ? "B" : accuracy >= 55 ? "C" : accuracy >= 40 ? "D" : "F";

		// Save session to history
		try {
			const storedPerformance: StoredPerformance = {
				id: crypto.randomUUID(),
				sequenceId: sequence?.id ?? "unknown",
				sequenceName: sequence?.word ?? sequence?.name ?? "Unknown Sequence",
				performedAt: new Date(),
				detectionMethod: "mediapipe",
				bpm: trainState.bpm,
				beatResultsJson: "[]", // TODO: Store actual beat results if needed
				score: {
					percentage: Math.round(accuracy * 10) / 10,
					grade: grade as "S" | "A" | "B" | "C" | "D" | "F",
					perfectHits: trainState.totalHits,
					goodHits: 0,
					misses: trainState.totalMisses,
					maxCombo: trainState.maxCombo,
					xpEarned: xpBreakdown.totalXP,
				},
				metadata: {
					sessionDuration: duration,
				},
			};

			await historyService.savePerformance(storedPerformance);
		} catch (error) {
			console.error("Failed to save session to history:", error);
		}

		try {
			await achievementService.trackAction("training_session_completed", {
				accuracy: sessionResult.accuracy,
				combo: sessionResult.maxCombo,
				mode: practiceMode,
			});

			// Track specific achievements
			if (accuracy === 100) {
				await achievementService.trackAction("perfect_training_run", {});
			}
			if (sessionResult.maxCombo >= 20) {
				await achievementService.trackAction("training_combo_20", {});
			}
			if (
				practiceMode === PracticeMode.TIMED &&
				sessionResult.bpm &&
				sessionResult.bpm >= 150
			) {
				await achievementService.trackAction("timed_150bpm", {});
			}
		} catch (error) {
			console.error("Failed to award session XP:", error);
		}

		// Process active challenge if exists
		const activeChallenge = activeChallengeState.activeChallenge;
		if (activeChallenge) {
			try {
				const increment = checkChallengeRequirement(
					activeChallenge,
					sessionResult
				);

				if (increment > 0) {
					const score = sessionResultToScore(sessionResult);
					await challengeService.recordProgress(
						activeChallenge.id,
						increment,
						score
					);

					// Check if challenge is now complete
					const progress = await challengeService.getUserProgressForChallenge(
						activeChallenge.id
					);

					if (
						progress &&
						progress.progress >= activeChallenge.requirement.target &&
						!progress.isCompleted
					) {
						// Complete the challenge
						const challengeXP = await challengeService.completeChallenge(
							activeChallenge.id,
							score
						);

						// Store challenge completion for ResultsScreen
						sessionChallengeProgress = {
							challenge: activeChallenge,
							currentProgress: progress.progress,
							isComplete: true,
						};

						// Show completion notification
						addNotification({
							id: `challenge-${activeChallenge.id}-${Date.now()}`,
							type: "challenge_complete",
							title: "Challenge Completed!",
							message: `${activeChallenge.title} - +${challengeXP} XP`,
							icon: "fa-trophy",
							timestamp: new Date(),
							isRead: false,
							data: {
								xpGained: challengeXP,
								challengeTitle: activeChallenge.title,
							},
						});

						// Track challenge completion achievement
						await achievementService.trackAction("train_challenge_completed", {
							challengeId: activeChallenge.id,
							difficulty: activeChallenge.difficulty,
							challengeType: "train",
						});

						// Clear active challenge
						activeChallengeState.clearActiveChallenge();
					} else {
						// Store challenge progress for ResultsScreen
						if (progress) {
							sessionChallengeProgress = {
								challenge: activeChallenge,
								currentProgress: progress.progress,
								isComplete: false,
							};
						}

						// Show progress notification
						if (progress) {
							addNotification({
								id: `progress-${activeChallenge.id}-${Date.now()}`,
								type: "challenge_complete",
								title: "Challenge Progress",
								message: `${activeChallenge.title}: ${progress.progress}/${activeChallenge.requirement.target}`,
								icon: "fa-dumbbell",
								timestamp: new Date(),
								isRead: false,
								data: { challengeTitle: activeChallenge.title },
							});
						}
					}
				}
			} catch (error) {
				console.error("Failed to process challenge progress:", error);
			}
		}
	}

	function startBeatTimer() {
		beatDuration = (60 / trainState.bpm) * 1000;
		lastBeatTime = performance.now();
		hasCheckedCurrentBeat = false;

		// Use requestAnimationFrame for better performance:
		// - Automatically pauses when tab is hidden
		// - Syncs with display refresh rate
		// - More efficient than setInterval
		function tick() {
			const now = performance.now();
			const elapsed = now - lastBeatTime;

			if (elapsed >= beatDuration) {
				lastBeatTime = now;
				hasCheckedCurrentBeat = false;
				trainState.advanceBeat();
			}

			// Continue the loop if still performing
			if (trainState.isPerforming) {
				beatAnimationFrameId = requestAnimationFrame(tick);
			}
		}

		beatAnimationFrameId = requestAnimationFrame(tick);
	}

	// Hit detection
	$effect(() => {
		if (!trainState.isPerforming || hasCheckedCurrentBeat) return;
		if (!trainState.currentFrame || !trainState.expectedPositions) return;

		const expected = trainState.expectedPositions;
		const detected = trainState.currentFrame;

		const blueCorrect = expected.blue && detected.blue
			? detected.blue.quadrant === expected.blue
			: expected.blue === null;

		const redCorrect = expected.red && detected.red
			? detected.red.quadrant === expected.red
			: expected.red === null;

		const isHit = blueCorrect && redCorrect;

		const basePoints = 100;
		const comboMultiplier = 1 + (trainState.currentCombo * 0.1);
		const points = Math.floor(basePoints * comboMultiplier);

		trainState.recordHit(isHit, points);
		lastHitResult = isHit;
		lastHitPoints = points;
		hasCheckedCurrentBeat = true;
	});

	function stopBeatTimer() {
		if (beatAnimationFrameId) {
			cancelAnimationFrame(beatAnimationFrameId);
			beatAnimationFrameId = null;
		}
	}

	function handleSelectSequence(selectedSequence: SequenceData) {
		trainState.setSequence(selectedSequence);
	}

	// Get beats to display in grid (current + next 3, max 4 columns)
	const beatsToDisplay = $derived.by(() => {
		if (!trainState.sequence?.beats) return [];
		const beats = trainState.sequence.beats;
		const startIndex = trainState.currentBeatIndex;
		return beats.slice(startIndex, startIndex + 4);
	});

	onMount(() => {
		hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
		initDetection();
	});

	onDestroy(() => {
		stopBeatTimer();
		if (detectionService) {
			detectionService.stopDetection();
			detectionService.dispose();
		}
	});
</script>

<div class="train-mode-panel">
	<!-- Step 1: Sequence Selection -->
	{#if !trainState.hasSequence}
		<TrainSetup onSequenceSelected={handleSelectSequence} />
	{:else}

	<!-- Step 2+: Training Interface -->
	<!-- Header -->
	<header class="panel-header">
		<button class="back-button" onclick={() => { hapticService?.trigger("selection"); onBack?.(); }} aria-label="Back to sequence selection">
			<i class="fas fa-arrow-left"></i>
		</button>
		<div class="header-info">
			<h1>{trainState.sequence?.word || trainState.sequence?.name || "Sequence"}</h1>
			<span class="beat-count">{trainState.totalBeats} beats</span>
		</div>
		<!-- Mode Toggle (compact) -->
		<div class="header-controls">
			<PracticeModeToggle
				activeMode={practiceState.currentMode}
				onModeChange={(mode) => practiceState.setMode(mode)}
				compact={true}
			/>
			<button
				class="settings-button"
				onclick={() => { hapticService?.trigger("selection"); showSettingsSheet = true; }}
				aria-label="Mode settings"
			>
				<i class="fas fa-cog"></i>
			</button>
		</div>
	</header>

	<!-- Main content -->
	<div class="panel-content">
		<!-- Top: Camera Feed -->
		<div class="camera-section">
			<CameraPreview
				onCameraReady={handleCameraReady}
				onCameraError={handleCameraError}
				onFrame={handleFrame}
				mirrored={true}
			>
				<GridOverlay
					bluePosition={trainState.currentFrame?.blue ?? null}
					redPosition={trainState.currentFrame?.red ?? null}
					expectedBlue={trainState.expectedPositions?.blue ?? null}
					expectedRed={trainState.expectedPositions?.red ?? null}
					showExpected={trainState.mode === TrainMode.PERFORMING}
				/>
			</CameraPreview>

			<!-- Countdown overlay -->
			{#if trainState.mode === TrainMode.COUNTDOWN && trainState.countdownValue !== null}
				<div class="countdown-overlay">
					<span class="countdown-number">{trainState.countdownValue || "GO!"}</span>
				</div>
			{/if}

			<!-- Detection Status Indicators -->
			<div class="status-indicators-overlay">
				<div class="status-item" class:active={trainState.isCameraReady}>
					<div class="status-dot"></div>
					<span>Camera</span>
				</div>
				<div class="status-item" class:active={isDetectionReady}>
					<div class="status-dot"></div>
					<span>Hand Tracking</span>
				</div>
				<div class="status-item" class:active={trainState.isDetectionActive}>
					<div class="status-dot"></div>
					<span>Detecting</span>
				</div>
			</div>

			<!-- Performance Feedback (during training) -->
			{#if trainState.isPerforming}
				<div class="performance-overlay">
					<div class="score-display">
						<div class="combo" class:active={trainState.currentCombo > 0}>
							{#if trainState.currentCombo > 0}
								<span class="combo-value">{trainState.currentCombo}x</span>
								<span class="combo-label">Combo</span>
							{/if}
						</div>
						<div class="score">
							<span class="score-value">{trainState.currentScore}</span>
						</div>
					</div>
					{#if lastHitResult !== null}
						<div class="hit-indicator" class:hit={lastHitResult} class:miss={!lastHitResult}>
							{lastHitResult ? `+${lastHitPoints}` : 'MISS'}
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Bottom: Beat Visualization -->
		<div class="beats-section">
			<!-- Beat Progress -->
			<div class="beat-progress">
				<span class="beat-label">Beat {trainState.currentBeatIndex + 1} / {trainState.totalBeats}</span>
				<div class="progress-bar">
					<div class="progress-fill" style="width: {trainState.progress}%"></div>
				</div>
			</div>

			<!-- Beat Grid (up to 4 columns) -->
			<div class="beat-grid">
				{#if trainState.sequence?.startPosition}
					<div class="beat-column start-position">
						<div class="beat-header">Start</div>
						<div class="pictograph-wrapper">
							<Pictograph pictographData={trainState.sequence.startPosition} />
						</div>
					</div>
				{/if}

				{#each beatsToDisplay as beat, index (beat.beatNumber || index)}
					{@const beatNum = trainState.currentBeatIndex + index + 1}
					{@const isCurrent = index === 0}
					<div class="beat-column" class:current={isCurrent}>
						<div class="beat-header">Beat {beatNum}</div>
						<div class="pictograph-wrapper">
							{#if beat.isBlank}
								<div class="blank-beat">
									<span>?</span>
								</div>
							{:else}
								<Pictograph pictographData={beat} />
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Results Screen Overlay -->
		{#if trainState.mode === TrainMode.REVIEW}
			<ResultsScreen
				totalBeats={trainState.totalBeats}
				hits={trainState.totalHits}
				misses={trainState.totalMisses}
				maxCombo={trainState.maxCombo}
				finalScore={trainState.currentScore}
				sequenceName={trainState.sequence?.name || trainState.sequence?.word}
				xpBreakdown={sessionXPBreakdown}
				challengeProgress={sessionChallengeProgress}
				onPlayAgain={handleBackToSetup}
				onExit={onBack}
			/>
		{/if}
	</div>

	<!-- Footer actions -->
	<footer class="panel-footer">
		{#if trainState.mode === TrainMode.SETUP}
			<button
				class="primary-button"
				disabled={!trainState.canStartPerformance}
				onclick={handleStartCountdown}
			>
				{#if !trainState.isCameraReady}
					Waiting for Camera...
				{:else}
					Start Training
				{/if}
			</button>
		{:else if trainState.mode === TrainMode.PERFORMING}
			<button class="secondary-button" onclick={handleBackToSetup}>
				Stop
			</button>
		{/if}
	</footer>

	<!-- Error Toast -->
	{#if trainState.error}
		<div class="error-toast">
			<p>{trainState.error}</p>
			<button onclick={() => { hapticService?.trigger("selection"); trainState.setError(null); }}>✕</button>
		</div>
	{/if}

	<!-- Mode Settings Sheet -->
	<ModeSettingsSheet
		bind:isOpen={showSettingsSheet}
		onClose={() => showSettingsSheet = false}
		currentMode={practiceState.currentMode}
		adaptiveConfig={practiceState.adaptiveConfig}
		stepConfig={practiceState.stepConfig}
		timedConfig={practiceState.timedConfig}
		onAdaptiveConfigUpdate={(config) => practiceState.updateAdaptiveConfig(config)}
		onStepConfigUpdate={(config) => practiceState.updateStepConfig(config)}
		onTimedConfigUpdate={(config) => practiceState.updateTimedConfig(config)}
	/>
	{/if}
</div>

<style>
	.train-mode-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--background-primary, #0f0f0f);
		color: white;
		overflow: hidden;
	}

	.panel-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(0, 0, 0, 0.3);
		flex-shrink: 0;
	}

	.back-button {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 10px;
		color: white;
		cursor: pointer;
		transition: background 0.2s;
		font-size: 1rem;
	}

	.back-button:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.header-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		min-width: 0;
	}

	.header-info h1 {
		font-size: 1.125rem;
		font-weight: 600;
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.beat-count {
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.panel-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.5rem;
		overflow: hidden;
		position: relative;
	}

	@media (min-width: 768px) {
		.panel-content {
			gap: 1rem;
			padding: 1rem;
		}
	}

	.camera-section {
		position: relative;
		border-radius: 12px;
		overflow: hidden;
		background: #000;
		flex: 0 0 auto;
		height: 40vh;
		min-height: 200px;
		max-height: 300px;
	}

	@media (min-width: 768px) {
		.camera-section {
			height: 50vh;
			max-height: 400px;
		}
	}

	.status-indicators-overlay {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		background: rgba(0, 0, 0, 0.7);
		padding: 0.5rem;
		border-radius: 8px;
		font-size: 0.7rem;
	}

	@media (min-width: 768px) {
		.status-indicators-overlay {
			font-size: 0.8rem;
			gap: 0.5rem;
			padding: 0.75rem;
		}
	}

	.status-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		opacity: 0.6;
		transition: opacity 0.3s;
	}

	.status-item.active {
		opacity: 1;
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #6b7280;
		transition: all 0.3s;
	}

	@media (min-width: 768px) {
		.status-dot {
			width: 8px;
			height: 8px;
		}
	}

	.status-item.active .status-dot {
		background: #22c55e;
		box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
	}

	.performance-overlay {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		right: 0.5rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		pointer-events: none;
	}

	.score-display {
		display: flex;
		align-items: center;
		gap: 1rem;
		background: rgba(0, 0, 0, 0.7);
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-weight: 600;
	}

	.combo {
		display: flex;
		flex-direction: column;
		align-items: center;
		opacity: 0;
		transition: opacity 0.3s;
	}

	.combo.active {
		opacity: 1;
	}

	.combo-value {
		font-size: 1.25rem;
		color: #fbbf24;
	}

	.combo-label {
		font-size: 0.7rem;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.7);
	}

	.score-value {
		font-size: 1.5rem;
		color: #3b82f6;
	}

	.hit-indicator {
		padding: 0.5rem 1rem;
		border-radius: 8px;
		font-weight: bold;
		font-size: 1.25rem;
		animation: fadeInOut 1s ease-out forwards;
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
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		20% {
			opacity: 1;
			transform: scale(1.1);
		}
		80% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(0.9);
		}
	}

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
		font-size: 4rem;
		font-weight: bold;
		color: white;
		text-shadow: 0 0 40px rgba(59, 130, 246, 0.8);
		animation: pulse 1s ease-in-out infinite;
	}

	@media (min-width: 768px) {
		.countdown-number {
			font-size: 6rem;
		}
	}

	@keyframes pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}

	.beats-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		overflow: hidden;
		min-height: 0;
	}

	.beat-progress {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.5rem;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 8px;
	}

	.beat-label {
		font-size: 0.875rem;
		font-weight: 600;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.progress-bar {
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6, #8b5cf6);
		transition: width 0.3s ease;
	}

	.beat-grid {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
		gap: 0.5rem;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 0.5rem;
		min-height: 0;
	}

	@media (min-width: 768px) {
		.beat-grid {
			grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
			gap: 1rem;
			padding: 1rem;
		}
	}

	.beat-column {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 0.5rem;
		transition: all 0.3s;
		min-width: 0;
	}

	.beat-column.current {
		border-color: #3b82f6;
		background: rgba(59, 130, 246, 0.1);
		box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
	}

	.beat-column.start-position {
		border-color: #8b5cf6;
		background: rgba(139, 92, 246, 0.05);
	}

	.beat-header {
		font-size: 0.7rem;
		font-weight: 600;
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: rgba(255, 255, 255, 0.8);
	}

	@media (min-width: 768px) {
		.beat-header {
			font-size: 0.8rem;
		}
	}

	.pictograph-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 6px;
		overflow: hidden;
		min-height: 80px;
	}

	@media (min-width: 768px) {
		.pictograph-wrapper {
			min-height: 120px;
		}
	}

	.blank-beat {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		color: rgba(255, 255, 255, 0.3);
		font-size: 2rem;
	}

	.panel-footer {
		padding: 0.75rem 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		justify-content: center;
		gap: 1rem;
		flex-shrink: 0;
	}

	.primary-button,
	.secondary-button {
		padding: 0.75rem 2rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		min-width: 140px;
	}

	.primary-button {
		background: linear-gradient(135deg, #3b82f6, #8b5cf6);
		border: none;
		color: white;
	}

	.primary-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
	}

	.primary-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.secondary-button {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
	}

	.secondary-button:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.error-toast {
		position: absolute;
		bottom: 1rem;
		left: 1rem;
		right: 1rem;
		background: rgba(239, 68, 68, 0.95);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 8px;
		padding: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		z-index: 100;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.error-toast p {
		margin: 0;
		color: white;
		flex: 1;
	}

	.error-toast button {
		background: transparent;
		border: none;
		color: white;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem 0.5rem;
		opacity: 0.8;
		transition: opacity 0.2s;
	}

	.error-toast button:hover {
		opacity: 1;
	}
</style>
