<!--
  CanvasSection.svelte - AnimatorCanvas wrapper for Practice tab

  Displays the PixiJS-powered sequence animation synchronized with beat timing.
  Uses the same animation pattern as SingleRenderer for consistent behavior.
-->
<script lang="ts">
	import { onMount } from "svelte";
	import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.svelte";
	import { resolve, loadPixiModule } from "$lib/shared/inversify/di";
	import { loadFeatureModule } from "$lib/shared/inversify/container";
	import { TYPES } from "$lib/shared/inversify/types";
	import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
	import type { IAnimationPlaybackController } from "$lib/features/animate/services/contracts/IAnimationPlaybackController";
	import { createAnimationPanelState } from "$lib/features/animate/state/animation-panel-state.svelte";

	interface Props {
		sequence: SequenceData | null;
		currentBeatIndex?: number;
		isPlaying?: boolean;
		isPerforming?: boolean;
		bpm?: number;
		onBrowseSequences?: () => void;
	}

	let {
		sequence = null,
		currentBeatIndex = 0,
		isPlaying = false,
		isPerforming = false,
		bpm = 60,
		onBrowseSequences
	}: Props = $props();

	// Services - using $state for reactivity with $effect
	let playbackController = $state<IAnimationPlaybackController | null>(null);
	let pixiReady = $state(false);

	// Animation state - same pattern as SingleRenderer
	const animationState = createAnimationPanelState();

	let isLoading = $state(true);
	let loadError = $state<string | null>(null);

	// Initialize services and load Pixi
	onMount(async () => {
		try {
			// Load the animate feature module (contains IAnimationPlaybackController)
			await loadFeatureModule("animate");

			// Get playback controller
			playbackController = resolve(TYPES.IAnimationPlaybackController) as IAnimationPlaybackController;

			// Load Pixi module on-demand
			await loadPixiModule();
			pixiReady = true;
			isLoading = false;
		} catch (error) {
			console.error("[CanvasSection] Failed to initialize:", error);
			loadError = "Failed to load animation canvas";
			isLoading = false;
		}
	});

	// Track last sequence to detect changes
	let lastSequenceId: string | null = null;

	// Initialize animation when sequence changes
	$effect(() => {
		// IMPORTANT: Read all reactive dependencies BEFORE any early returns
		// Otherwise Svelte won't track them and the effect won't re-run when they change
		const currentSequence = sequence;
		const controller = playbackController;
		const isPixiReady = pixiReady;

		if (!currentSequence || !controller || !isPixiReady) return;

		// Only reinitialize if sequence actually changed
		if (currentSequence.id === lastSequenceId) return;
		lastSequenceId = currentSequence.id;

		try {
			// Initialize playback controller with sequence and animation state
			const success = controller.initialize(currentSequence, animationState);
			if (success) {
				// Beat 0 = start position in animation system
				controller.jumpToBeat(0);
			}
		} catch (error) {
			console.error("[CanvasSection] Error initializing animation:", error);
		}
	});

	// Track the last target beat to prevent duplicate animation calls
	let lastTargetBeat: number | null = null;

	// Sync current beat from external source (TrainModePanel timing or grid selection)
	$effect(() => {
		// IMPORTANT: Read all reactive dependencies BEFORE any early returns
		// Otherwise Svelte won't track them and the effect won't re-run when they change
		const currentIndex = currentBeatIndex;
		const performing = isPerforming;
		const currentBpm = bpm;

		if (!playbackController || !animationState.sequenceData) return;

		// Animation beat indexing: 0 = start position, 1+ = sequence beats
		// currentBeatIndex: -1 = start position, 0+ = beats (0-indexed)
		// Convert: currentBeatIndex + 1
		const targetBeat = currentIndex + 1;

		// Only trigger animation if the TARGET beat changes (user clicked a different beat)
		// Don't retrigger just because animationState.currentBeat changed during animation
		if (targetBeat !== lastTargetBeat) {
			lastTargetBeat = targetBeat;

			// Calculate animation duration based on BPM during performance
			// At 60 BPM = 1000ms per beat, use 80% of beat duration for smooth animation
			// For manual selection, use fixed 300ms
			const beatDurationMs = (60 / currentBpm) * 1000;
			const animationDuration = performing ? beatDurationMs * 0.8 : 300;

			// Use linear interpolation during performance for consistent motion,
			// ease-out for manual selection (feels more responsive)
			playbackController.animateToBeat(targetBeat, animationDuration, performing);
		}
	});
</script>

<div class="canvas-section">
	{#if isLoading}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<span>Loading animation...</span>
		</div>
	{:else if loadError}
		<div class="error-state">
			<i class="fas fa-exclamation-triangle"></i>
			<span>{loadError}</span>
		</div>
	{:else if sequence && pixiReady}
		<AnimatorCanvas
			blueProp={animationState.bluePropState}
			redProp={animationState.redPropState}
			gridVisible={true}
			gridMode={animationState.sequenceData?.gridMode ?? null}
			beatData={animationState.sequenceData?.beats[animationState.currentBeat - 1] || null}
			currentBeat={animationState.currentBeat}
			sequenceData={animationState.sequenceData}
		/>
	{:else}
		<div class="empty-state">
			<div class="empty-icon">
				<i class="fas fa-play-circle"></i>
			</div>
			<p class="empty-text">No sequence selected</p>
			{#if onBrowseSequences}
				<button class="browse-btn" onclick={onBrowseSequences}>
					<i class="fas fa-folder-open"></i>
					Browse
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.canvas-section {
		position: relative;
		width: 100%;
		height: 100%;
		background: transparent;
		border-radius: 12px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Loading State */
	.loading-state {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		background: rgba(0, 0, 0, 0.3);
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.875rem;
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid rgba(255, 255, 255, 0.2);
		border-top-color: rgba(59, 130, 246, 0.8);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	/* Error State */
	.error-state {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		background: rgba(239, 68, 68, 0.1);
		color: rgba(239, 68, 68, 0.8);
		font-size: 0.875rem;
	}

	.error-state i {
		font-size: 1.5rem;
	}

	/* Empty State */
	.empty-state {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		padding: 1.5rem;
		text-align: center;
		background: rgba(255, 255, 255, 0.03);
		border: 1px dashed rgba(255, 255, 255, 0.15);
		border-radius: 12px;
	}

	.empty-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15));
		border: 1px solid rgba(139, 92, 246, 0.25);
		border-radius: 12px;
		color: rgba(167, 139, 250, 0.8);
		font-size: 1.25rem;
	}

	.empty-text {
		margin: 0;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.5);
	}

	.browse-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 40px;
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
		border: 1px solid rgba(139, 92, 246, 0.3);
		border-radius: 8px;
		color: rgba(196, 181, 253, 0.9);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.browse-btn:hover {
		background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3));
		border-color: rgba(139, 92, 246, 0.5);
		transform: translateY(-1px);
	}
</style>
