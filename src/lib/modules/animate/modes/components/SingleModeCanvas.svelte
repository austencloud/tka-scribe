<!--
  SingleModeCanvas.svelte

  Full-screen animation canvas for Single mode.
  Renders animation inline (not in a modal/drawer).
-->
<script lang="ts">
  import AnimatorCanvas from "../../components/AnimatorCanvas.svelte";
  import { loadSequenceForAnimation } from "../../utils/sequence-loader";
  import type { ISequenceService } from "$create/shared";
  import { resolve, TYPES, type SequenceData } from "$shared";
  import type { IAnimationPlaybackController } from "../../services/contracts";
  import { createAnimationPanelState } from "../../state/animation-panel-state.svelte";
  import { onMount } from "svelte";
  import { ANIMATION_LOAD_DELAY_MS, ANIMATION_AUTO_START_DELAY_MS } from "../../constants/timing";

  // Props
  let {
    sequence,
    isPlaying = $bindable(),
    animatingBeatNumber = $bindable(null),
  }: {
    sequence: SequenceData;
    isPlaying?: boolean;
    animatingBeatNumber?: number | null;
  } = $props();

  // Services
  let sequenceService: ISequenceService | null = null;
  let playbackController: IAnimationPlaybackController | null = null;
  let animationCanvas: HTMLCanvasElement | null = null;

  // Animation state
  const animationPanelState = createAnimationPanelState();
  let loading = $state(false);
  let error = $state<string | null>(null);

  // Initialize services
  onMount(() => {
    try {
      sequenceService = resolve(TYPES.ISequenceService) as ISequenceService;
      playbackController = resolve(
        TYPES.IAnimationPlaybackController
      ) as IAnimationPlaybackController;
    } catch (err) {
      console.error("❌ Failed to initialize animation services:", err);
      error = "Failed to initialize animation services";
    }
  });

  // Load and start animation when sequence changes
  $effect(() => {
    if (!sequence || !playbackController || !sequenceService) return;

    loadAndStartAnimation();
  });

  async function loadAndStartAnimation() {
    if (!sequence || !playbackController || !sequenceService) return;

    try {
      loading = true;
      error = null;

      // Small delay to ensure UI is ready
      await new Promise((resolve) => setTimeout(resolve, ANIMATION_LOAD_DELAY_MS));

      console.log("🎬 Loading sequence for animation:", sequence.id);

      const fullSequence = await loadSequenceForAnimation(
        sequence,
        sequenceService
      );

      if (!fullSequence) {
        throw new Error(`Sequence not found: ${sequence.id}`);
      }

      // Initialize playback controller
      const success = playbackController.initialize(
        fullSequence,
        animationPanelState
      );

      if (!success) {
        throw new Error("Failed to initialize animation playback");
      }

      loading = false;

      // Auto-start animation after a brief delay
      if (isPlaying) {
        setTimeout(() => {
          playbackController?.setPlaying(true);
        }, ANIMATION_AUTO_START_DELAY_MS);
      }
    } catch (err) {
      console.error("❌ Failed to load sequence:", err);
      error = err instanceof Error ? err.message : "Failed to load sequence";
      loading = false;
    }
  }

  // Sync isPlaying with playback controller
  $effect(() => {
    if (playbackController && animationPanelState.sequenceData) {
      playbackController.setPlaying(isPlaying);
    }
  });

  // Sync animating beat number
  $effect(() => {
    animatingBeatNumber = animationPanelState.currentBeat;
  });

  // Derived: Current letter from sequence data
  let currentLetter = $derived.by(() => {
    if (!animationPanelState.sequenceData) return null;

    const currentBeat = animationPanelState.currentBeat;

    // Before animation starts (beat 0 and not playing) = start position
    if (
      currentBeat === 0 &&
      !animationPanelState.isPlaying &&
      animationPanelState.sequenceData.startPosition
    ) {
      return animationPanelState.sequenceData.startPosition.letter || null;
    }

    // During animation: show beat letters
    if (
      animationPanelState.sequenceData.beats &&
      animationPanelState.sequenceData.beats.length > 0
    ) {
      const beatIndex = Math.floor(currentBeat);
      const clampedIndex = Math.max(
        0,
        Math.min(beatIndex, animationPanelState.sequenceData.beats.length - 1)
      );
      return (
        animationPanelState.sequenceData.beats[clampedIndex]?.letter || null
      );
    }

    return null;
  });

  function handleCanvasReady(canvas: HTMLCanvasElement | null) {
    animationCanvas = canvas;
  }
</script>

<div class="single-mode-canvas">
  {#if loading}
    <div class="loading-message">
      <div class="spinner"></div>
      <p>Loading animation...</p>
    </div>
  {:else if error}
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{error}</p>
    </div>
  {:else}
    <AnimatorCanvas
      blueProp={animationPanelState.blueProp}
      redProp={animationPanelState.redProp}
      gridVisible={true}
      gridMode={null}
      letter={currentLetter}
      beatData={animationPanelState.beatData}
      onCanvasReady={handleCanvasReady}
    />
  {/if}
</div>

<style>
  .single-mode-canvas {
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
