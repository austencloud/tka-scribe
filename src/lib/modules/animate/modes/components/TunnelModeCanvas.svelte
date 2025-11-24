<!--
  TunnelModeCanvas.svelte

  Dual-sequence animation canvas for Tunnel mode.
  Overlays two sequences with different colors on the same canvas.
-->
<script lang="ts">
  import AnimatorCanvas from "../../components/AnimatorCanvas.svelte";
  import { resolve, TYPES, type SequenceData } from "$shared";
  import type { IAnimationPlaybackController } from "../../services/contracts";
  import { createAnimationPanelState } from "../../state/animation-panel-state.svelte";
  import { onMount } from "svelte";
  import {
    ANIMATION_LOAD_DELAY_MS,
    ANIMATION_AUTO_START_DELAY_MS,
  } from "../../constants/timing";
  import type { TunnelColors } from "../../shared/state/animate-module-state.svelte";

  // Props
  let {
    primarySequence,
    secondarySequence,
    tunnelColors: _tunnelColors,
    primaryVisible = true,
    primaryBlueVisible = true,
    primaryRedVisible = true,
    secondaryVisible = true,
    secondaryBlueVisible = true,
    secondaryRedVisible = true,
    isPlaying = $bindable(),
    animatingBeatNumber = $bindable(null),
    speed = 1.0,
  }: {
    primarySequence: SequenceData;
    secondarySequence: SequenceData;
    tunnelColors: TunnelColors;
    primaryVisible?: boolean;
    primaryBlueVisible?: boolean;
    primaryRedVisible?: boolean;
    secondaryVisible?: boolean;
    secondaryBlueVisible?: boolean;
    secondaryRedVisible?: boolean;
    isPlaying?: boolean;
    animatingBeatNumber?: number | null;
    speed?: number;
  } = $props();

  // Services
  let primaryPlaybackController: IAnimationPlaybackController | null = null;
  let secondaryPlaybackController: IAnimationPlaybackController | null = null;

  // Animation states (one for each sequence)
  const primaryAnimationState = createAnimationPanelState();
  const secondaryAnimationState = createAnimationPanelState();

  let loading = $state(false);
  let error = $state<string | null>(null);

  // Initialize services
  onMount(() => {
    try {
      // Create separate playback controllers for each sequence
      primaryPlaybackController = resolve(
        TYPES.IAnimationPlaybackController
      ) as IAnimationPlaybackController;
      secondaryPlaybackController = resolve(
        TYPES.IAnimationPlaybackController
      ) as IAnimationPlaybackController;
    } catch (err) {
      console.error("❌ Failed to initialize tunnel animation services:", err);
      error = "Failed to initialize animation services";
    }
  });

  // Load and start animations when sequences change
  $effect(() => {
    if (
      !primarySequence ||
      !secondarySequence ||
      !primaryPlaybackController ||
      !secondaryPlaybackController
    )
      return;

    loadAndStartAnimations();
  });

  async function loadAndStartAnimations() {
    if (
      !primarySequence ||
      !secondarySequence ||
      !primaryPlaybackController ||
      !secondaryPlaybackController
    )
      return;

    try {
      loading = true;
      error = null;

      // Small delay to ensure UI is ready
      await new Promise((resolve) =>
        setTimeout(resolve, ANIMATION_LOAD_DELAY_MS)
      );

      console.log(
        "🎬 Initializing tunnel animations with pre-loaded sequences:",
        {
          primary: primarySequence.id,
          secondary: secondarySequence.id,
          primaryBeats: primarySequence.beats.length,
          secondaryBeats: secondarySequence.beats.length,
        }
      );

      // Initialize both playback controllers with pre-loaded sequences
      const primarySuccess = primaryPlaybackController.initialize(
        primarySequence,
        primaryAnimationState
      );
      const secondarySuccess = secondaryPlaybackController.initialize(
        secondarySequence,
        secondaryAnimationState
      );

      if (!primarySuccess || !secondarySuccess) {
        throw new Error("Failed to initialize animation playback");
      }

      console.log("✅ Tunnel animations initialized successfully");

      loading = false;

      // Auto-start animations after a brief delay
      if (isPlaying) {
        setTimeout(() => {
          primaryAnimationState.setIsPlaying(true);
          secondaryAnimationState.setIsPlaying(true);
        }, ANIMATION_AUTO_START_DELAY_MS);
      }
    } catch (err) {
      console.error("❌ Failed to initialize animations:", err);
      error =
        err instanceof Error ? err.message : "Failed to initialize animations";
      loading = false;
    }
  }

  // Sync isPlaying with both animation states
  $effect(() => {
    if (
      primaryAnimationState.sequenceData &&
      secondaryAnimationState.sequenceData &&
      primaryPlaybackController &&
      secondaryPlaybackController
    ) {
      const primaryNeedsToggle = isPlaying !== primaryAnimationState.isPlaying;
      const secondaryNeedsToggle =
        isPlaying !== secondaryAnimationState.isPlaying;

      if (primaryNeedsToggle) {
        primaryPlaybackController.togglePlayback();
      }
      if (secondaryNeedsToggle) {
        secondaryPlaybackController.togglePlayback();
      }
    }
  });

  // Sync animating beat number (use primary as source of truth)
  $effect(() => {
    animatingBeatNumber = primaryAnimationState.currentBeat;
  });

  // Sync speed with both playback controllers
  $effect(() => {
    if (
      primaryPlaybackController &&
      secondaryPlaybackController &&
      primaryAnimationState.sequenceData &&
      secondaryAnimationState.sequenceData
    ) {
      console.log(`🎬 Syncing speed to tunnel playback controllers: ${speed}x`);
      primaryPlaybackController.setSpeed(speed);
      secondaryPlaybackController.setSpeed(speed);
    }
  });

  // Derived: Current letters for both sequences
  let primaryLetter = $derived.by(() => {
    if (!primaryAnimationState.sequenceData) return null;

    const currentBeat = primaryAnimationState.currentBeat;

    if (
      currentBeat === 0 &&
      !primaryAnimationState.isPlaying &&
      primaryAnimationState.sequenceData.startPosition
    ) {
      return primaryAnimationState.sequenceData.startPosition.letter || null;
    }

    if (
      primaryAnimationState.sequenceData.beats &&
      primaryAnimationState.sequenceData.beats.length > 0
    ) {
      const beatIndex = Math.floor(currentBeat);
      const clampedIndex = Math.max(
        0,
        Math.min(beatIndex, primaryAnimationState.sequenceData.beats.length - 1)
      );
      return (
        primaryAnimationState.sequenceData.beats[clampedIndex]?.letter || null
      );
    }

    return null;
  });

  let secondaryLetter = $derived.by(() => {
    if (!secondaryAnimationState.sequenceData) return null;

    const currentBeat = secondaryAnimationState.currentBeat;

    if (
      currentBeat === 0 &&
      !secondaryAnimationState.isPlaying &&
      secondaryAnimationState.sequenceData.startPosition
    ) {
      return secondaryAnimationState.sequenceData.startPosition.letter || null;
    }

    if (
      secondaryAnimationState.sequenceData.beats &&
      secondaryAnimationState.sequenceData.beats.length > 0
    ) {
      const beatIndex = Math.floor(currentBeat);
      const clampedIndex = Math.max(
        0,
        Math.min(
          beatIndex,
          secondaryAnimationState.sequenceData.beats.length - 1
        )
      );
      return (
        secondaryAnimationState.sequenceData.beats[clampedIndex]?.letter || null
      );
    }

    return null;
  });
</script>

<div class="tunnel-mode-canvas">
  {#if loading}
    <div class="loading-message">
      <div class="spinner"></div>
      <p>Loading animations...</p>
    </div>
  {:else if error}
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{error}</p>
    </div>
  {:else}
    <!-- Single canvas rendering both sequences simultaneously -->
    <AnimatorCanvas
      blueProp={primaryBlueVisible && primaryVisible
        ? primaryAnimationState.bluePropState
        : null}
      redProp={primaryRedVisible && primaryVisible
        ? primaryAnimationState.redPropState
        : null}
      secondaryBlueProp={secondaryBlueVisible && secondaryVisible
        ? secondaryAnimationState.bluePropState
        : null}
      secondaryRedProp={secondaryRedVisible && secondaryVisible
        ? secondaryAnimationState.redPropState
        : null}
      gridVisible={true}
      gridMode={primaryAnimationState.sequenceData?.gridMode ?? null}
      letter={primaryLetter}
      beatData={primaryAnimationState.sequenceData?.beats[
        primaryAnimationState.currentBeat - 1
      ] || null}
      currentBeat={primaryAnimationState.currentBeat}
      sequenceData={primaryAnimationState.sequenceData}
    />
  {/if}
</div>

<style>
  .tunnel-mode-canvas {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background-primary, #1a1a1a);
  }

  .loading-message,
  .error-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-lg);
    color: rgba(255, 255, 255, 0.7);
  }

  .loading-message p,
  .error-message p {
    font-size: 1rem;
    margin: 0;
  }

  .error-message {
    color: rgba(239, 68, 68, 0.9);
  }

  .error-message i {
    font-size: 3rem;
    opacity: 0.5;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top-color: #ec4899;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
