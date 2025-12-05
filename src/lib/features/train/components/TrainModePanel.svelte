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
	import ResultsScreen from "./ResultsScreen.svelte";
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
	import ModeSettingsSheet from "./practice/ModeSettingsSheet.svelte";
	import SequenceBrowserPanel from "$lib/shared/animation-engine/components/SequenceBrowserPanel.svelte";
	import PracticeViewContainer from "./practice/PracticeViewContainer.svelte";
	import FloatingControlGroup from "./practice/FloatingControlGroup.svelte";
	import GridSettingsPopover from "./practice/GridSettingsPopover.svelte";

	interface Props {
		sequence?: SequenceData | null;
		practiceMode?: PracticeMode;
		modeConfig?: AdaptiveConfig | StepConfig | TimedConfig;
		challengeId?: string;
		onSequenceSelect?: (sequence: SequenceData) => void;
		onSequenceClear?: () => void;
		onSessionComplete?: () => void;
	}

	let {
		sequence = null,
		practiceMode = PracticeMode.TIMED,
		modeConfig,
		challengeId,
		onSequenceSelect,
		onSequenceClear,
		onSessionComplete
	}: Props = $props();

	// Practice state for mode switching and settings
	const practiceState = getTrainPracticeState();

	// UI sheet states
	let showSettingsSheet = $state(false);
	let showSequenceBrowser = $state(false);
	let showModePicker = $state(false);
	let showGridSettings = $state(false);

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

	// Beat selection for setup mode (manual beat preview)
	// -1 = start position, 0+ = actual beats (0-indexed)
	let selectedBeatIndex = $state(-1);

	// Determine which beat index to show - selected during setup, current during performance
	const displayBeatIndex = $derived(
		trainState.isPerforming ? trainState.currentBeatIndex : selectedBeatIndex
	);

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
		// Skip countdown - start immediately for faster testing
		trainState.startPerformance();
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
		showSequenceBrowser = false;
		// Reset beat selection to start position when sequence changes
		selectedBeatIndex = -1;
		onSequenceSelect?.(selectedSequence);
	}

	function handleBeatSelect(beatIndex: number) {
		// Only allow beat selection during setup mode
		if (!trainState.isPerforming) {
			selectedBeatIndex = beatIndex;
			hapticService?.trigger("selection");
		}
	}

	function handleOpenSequenceBrowser() {
		hapticService?.trigger("selection");
		showSequenceBrowser = true;
	}

	function handleCloseSequenceBrowser() {
		showSequenceBrowser = false;
	}

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
	<!-- Main Content: Visualization Panels -->
	<div class="panel-content">
		<PracticeViewContainer
			displayView={practiceState.displayView}
			sequence={trainState.sequence}
			currentBeatIndex={displayBeatIndex}
			isPlaying={trainState.isPerforming}
			bpm={trainState.bpm}
			isCameraReady={trainState.isCameraReady}
			{isDetectionReady}
			isDetectionActive={trainState.isDetectionActive}
			isPerforming={trainState.isPerforming}
			currentFrame={trainState.currentFrame}
			expectedPositions={trainState.expectedPositions}
			mode={trainState.mode}
			countdownValue={trainState.countdownValue}
			currentScore={trainState.currentScore}
			currentCombo={trainState.currentCombo}
			{lastHitResult}
			{lastHitPoints}
			gridScale={practiceState.gridScale}
			onCameraReady={handleCameraReady}
			onCameraError={handleCameraError}
			onFrame={handleFrame}
			onBeatSelect={handleBeatSelect}
			onBrowseSequences={handleOpenSequenceBrowser}
			onGridSettingsClick={() => { showGridSettings = true; }}
		/>

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
				onExit={() => { handleBackToSetup(); onSequenceClear?.(); }}
			/>
		{/if}
	</div>

	<!-- Floating Controls (bottom-right) -->
	<FloatingControlGroup
		displayView={practiceState.displayView}
		practiceMode={practiceState.currentMode}
		hasSequence={!!trainState.sequence}
		onSequenceClick={handleOpenSequenceBrowser}
		onViewCycle={() => practiceState.cycleDisplayView()}
		onModeClick={() => { showModePicker = true; }}
		onSettingsClick={() => { showSettingsSheet = true; }}
	/>

	<!-- Floating Start/Stop Button -->
	<div class="floating-action">
		{#if trainState.mode === TrainMode.SETUP}
			<button
				class="start-button"
				disabled={!trainState.canStartPerformance}
				onclick={handleStartCountdown}
			>
				{#if !trainState.isCameraReady}
					<i class="fas fa-spinner fa-spin"></i>
				{:else}
					<i class="fas fa-play"></i>
					<span>Start</span>
				{/if}
			</button>
		{:else if trainState.mode === TrainMode.PERFORMING}
			<button class="stop-button" onclick={handleBackToSetup}>
				<i class="fas fa-stop"></i>
				<span>Stop</span>
			</button>
		{/if}
	</div>

	<!-- Sequence Info Badge (top-left when sequence is loaded) -->
	{#if trainState.sequence}
		<div class="sequence-badge">
			<span class="badge-name">{trainState.sequence?.word || trainState.sequence?.name}</span>
			<span class="badge-beats">{trainState.totalBeats} beats</span>
		</div>
	{/if}

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

	<!-- Grid Settings Popover -->
	<GridSettingsPopover
		isOpen={showGridSettings}
		gridScale={practiceState.gridScale}
		onScaleChange={(scale) => practiceState.setGridScale(scale)}
		onClose={() => { showGridSettings = false; }}
	/>

	<!-- Sequence Browser Panel -->
	<SequenceBrowserPanel
		mode="primary"
		show={showSequenceBrowser}
		onSelect={handleSelectSequence}
		onClose={handleCloseSequenceBrowser}
	/>
</div>

<style>
	/* ============================================
	   TRAIN MODE PANEL - Minimal Floating UI
	   ============================================ */
	.train-mode-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100%;
		background: transparent;
		color: white;
		overflow: hidden;
	}

	/* Main Content Area */
	.panel-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
	}

	/* ============================================
	   FLOATING ACTION BUTTON (Start/Stop)
	   ============================================ */
	.floating-action {
		position: absolute;
		bottom: 12px;
		left: 12px;
		z-index: 100;
	}

	.start-button,
	.stop-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-width: 56px;
		min-height: 56px;
		padding: 0.875rem 1.25rem;
		border-radius: 28px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	.start-button {
		background: linear-gradient(
			135deg,
			rgba(34, 197, 94, 0.9) 0%,
			rgba(22, 163, 74, 0.9) 100%
		);
		border: 1px solid rgba(74, 222, 128, 0.4);
		color: white;
	}

	.start-button:hover:not(:disabled) {
		background: linear-gradient(
			135deg,
			rgba(34, 197, 94, 1) 0%,
			rgba(22, 163, 74, 1) 100%
		);
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 6px 24px rgba(34, 197, 94, 0.4);
	}

	.start-button:active:not(:disabled) {
		transform: translateY(0) scale(0.98);
	}

	.start-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.stop-button {
		background: linear-gradient(
			135deg,
			rgba(239, 68, 68, 0.9) 0%,
			rgba(220, 38, 38, 0.9) 100%
		);
		border: 1px solid rgba(248, 113, 113, 0.4);
		color: white;
	}

	.stop-button:hover {
		background: linear-gradient(
			135deg,
			rgba(239, 68, 68, 1) 0%,
			rgba(220, 38, 38, 1) 100%
		);
		transform: translateY(-2px) scale(1.02);
		box-shadow: 0 6px 24px rgba(239, 68, 68, 0.4);
	}

	.stop-button:active {
		transform: translateY(0) scale(0.98);
	}

	/* ============================================
	   SEQUENCE BADGE (Top-left info)
	   ============================================ */
	.sequence-badge {
		position: absolute;
		top: 12px;
		left: 12px;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		padding: 0.5rem 0.75rem;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.12) 0%,
			rgba(255, 255, 255, 0.06) 100%
		);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: 10px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
		z-index: 50;
		pointer-events: none;
	}

	.badge-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: rgba(255, 255, 255, 0.95);
		white-space: nowrap;
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.badge-beats {
		font-size: 0.7rem;
		color: rgba(255, 255, 255, 0.5);
	}

	/* ============================================
	   ERROR TOAST
	   ============================================ */
	.error-toast {
		position: absolute;
		bottom: 80px;
		left: 12px;
		right: 12px;
		background: linear-gradient(
			135deg,
			rgba(239, 68, 68, 0.95) 0%,
			rgba(220, 38, 38, 0.95) 100%
		);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(248, 113, 113, 0.3);
		border-radius: 12px;
		padding: 0.75rem 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		z-index: 150;
		animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
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
		font-size: 0.875rem;
		flex: 1;
	}

	.error-toast button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		min-width: 48px;
		min-height: 48px;
		background: rgba(255, 255, 255, 0.15);
		border: none;
		border-radius: 12px;
		color: white;
		font-size: 1rem;
		cursor: pointer;
		transition: background 0.2s;
	}

	.error-toast button:hover {
		background: rgba(255, 255, 255, 0.25);
	}

	/* ============================================
	   RESPONSIVE ADJUSTMENTS
	   ============================================ */
	@media (min-width: 768px) {
		.sequence-badge {
			padding: 0.625rem 1rem;
		}

		.badge-name {
			font-size: 0.9375rem;
			max-width: 200px;
		}

		.badge-beats {
			font-size: 0.75rem;
		}
	}

	/* Hide text labels on very small screens for action buttons */
	@media (max-width: 400px) {
		.start-button span,
		.stop-button span {
			display: none;
		}

		.start-button,
		.stop-button {
			min-width: 56px;
			padding: 0.875rem;
		}
	}
</style>
