<!--
  SingleRenderer.svelte

  Single sequence animation renderer.
  Displays one sequence on a single canvas.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.svelte";
  import {
    resolve,
    loadPixiModule,
    loadFeatureModule,
  } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { IAnimationPlaybackController } from "../../../services/contracts/IAnimationPlaybackController";
  import type { IPixiAnimationRenderer } from "../../../services/contracts/IPixiAnimationRenderer";
  import { createAnimationPanelState } from "../../../state/animation-panel-state.svelte";
  import {
    ANIMATION_LOAD_DELAY_MS,
    ANIMATION_AUTO_START_DELAY_MS,
  } from "../../../shared/domain/constants/timing";
  import CanvasControls from "../components/CanvasControls.svelte";

  let {
    sequence,
    isPlaying = false,
    speed = 1.0,
    visible = true,
    blueVisible = true,
    redVisible = true,
    onOpenSettings,
  }: {
    sequence: SequenceData | null;
    isPlaying?: boolean;
    speed?: number;
    visible?: boolean;
    blueVisible?: boolean;
    redVisible?: boolean;
    onOpenSettings: (canvasId: string) => void;
  } = $props();

  // Services
  let playbackController: IAnimationPlaybackController | null = null;
  let pixiRenderer: IPixiAnimationRenderer | null = null;

  // Animation state
  const animationState = createAnimationPanelState();

  let loading = $state(false);
  let error = $state<string | null>(null);

  // Initialize services
  onMount(() => {
    const initialize = async () => {
      try {
        // Ensure animator module is loaded (handles HMR recovery)
        await loadFeatureModule("animate");

        playbackController = resolve(
          TYPES.IAnimationPlaybackController
        ) as IAnimationPlaybackController;

        // Load Pixi module on-demand
        await loadPixiModule();
        pixiRenderer = resolve(
          TYPES.IPixiAnimationRenderer
        ) as IPixiAnimationRenderer;
      } catch (err) {
        console.error("❌ Failed to initialize single renderer:", err);
        error = "Failed to initialize animation services";
      }
    };
    initialize();
  });

  // Load and start animation when sequence changes
  $effect(() => {
    if (!sequence || !playbackController) return;
    loadAndStartAnimation();
  });

  async function loadAndStartAnimation() {
    if (!sequence || !playbackController) return;

    try {
      loading = true;
      error = null;

      // Small delay to ensure UI is ready
      await new Promise((resolve) =>
        setTimeout(resolve, ANIMATION_LOAD_DELAY_MS)
      );

      console.log("🎬 Initializing single animation:", {
        id: sequence.id,
        beats: sequence.beats.length,
      });

      // Initialize playback controller
      const success = playbackController.initialize(sequence, animationState);

      if (!success) {
        throw new Error("Failed to initialize animation playback");
      }

      console.log("✅ Single animation initialized successfully");
      loading = false;

      // Auto-start animation if playing
      if (isPlaying) {
        setTimeout(() => {
          animationState.setIsPlaying(true);
        }, ANIMATION_AUTO_START_DELAY_MS);
      }
    } catch (err) {
      console.error("❌ Failed to initialize animation:", err);
      error =
        err instanceof Error ? err.message : "Failed to initialize animation";
      loading = false;
    }
  }

  // Sync isPlaying state
  $effect(() => {
    if (animationState.sequenceData && playbackController) {
      if (isPlaying !== animationState.isPlaying) {
        playbackController.togglePlayback();
      }
    }
  });

  // Sync speed
  $effect(() => {
    if (playbackController && animationState.sequenceData) {
      console.log(`🎬 Syncing speed to single renderer: ${speed}x`);
      playbackController.setSpeed(speed);
    }
  });

  // Derived: Current letter
  let currentLetter = $derived.by(() => {
    if (!animationState.sequenceData) return null;

    const currentBeat = animationState.currentBeat;

    if (
      currentBeat === 0 &&
      !animationState.isPlaying &&
      animationState.sequenceData.startPosition
    ) {
      return animationState.sequenceData.startPosition.letter || null;
    }

    if (
      animationState.sequenceData.beats &&
      animationState.sequenceData.beats.length > 0
    ) {
      const beatIndex = Math.floor(currentBeat);
      const clampedIndex = Math.max(
        0,
        Math.min(beatIndex, animationState.sequenceData.beats.length - 1)
      );
      return animationState.sequenceData.beats[clampedIndex]?.letter || null;
    }

    return null;
  });
</script>

<div class="single-renderer">
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
  {:else if sequence}
    <CanvasControls canvasId="single" {onOpenSettings} />
    <AnimatorCanvas
      blueProp={blueVisible && visible ? animationState.bluePropState : null}
      redProp={redVisible && visible ? animationState.redPropState : null}
      gridVisible={true}
      gridMode={animationState.sequenceData?.gridMode ?? null}
      letter={currentLetter}
      beatData={animationState.sequenceData?.beats[
        animationState.currentBeat - 1
      ] || null}
      currentBeat={animationState.currentBeat}
      sequenceData={animationState.sequenceData}
    />
  {:else}
    <div class="empty-message">
      <i class="fas fa-video"></i>
      <p>No sequence loaded</p>
    </div>
  {/if}
</div>

<style>
  .single-renderer {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background-primary, #1a1a1a);
    min-height: 0;
    overflow: hidden;
    container-type: size;
    container-name: single-renderer;
  }

  /* Ensure AnimatorCanvas sizes as the largest square that fits and is centered */
  .single-renderer :global(.canvas-wrapper) {
    width: min(100cqw, 100cqh);
    height: min(100cqw, 100cqh);
    max-width: 100%;
    max-height: 100%;
    aspect-ratio: 1 / 1;
  }

  .loading-message,
  .error-message,
  .empty-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-lg);
    color: rgba(255, 255, 255, 0.7);
  }

  .loading-message p,
  .error-message p,
  .empty-message p {
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

  .empty-message i {
    font-size: 3rem;
    opacity: 0.2;
  }

  .spinner {
    width: 52px;
    height: 52px;
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
