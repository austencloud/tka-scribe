<!--
  ShareAnimationViewer.svelte

  Self-contained animation viewer for the Share panel.
  Reuses the full AnimatorCanvas/PixiJS infrastructure for proper rendering.
  Includes built-in playback controls.
-->
<script lang="ts">
  import AnimatorCanvas from "./AnimatorCanvas.svelte";
  import { resolve, loadFeatureModule } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { animationSettings } from "../state/animation-settings-state.svelte";
  import type { IAnimationPlaybackController } from "$lib/features/animate/services/contracts/IAnimationPlaybackController";
  import { createAnimationPanelState } from "$lib/features/animate/state/animation-panel-state.svelte";
  import { onMount, untrack } from "svelte";

  // Props
  let {
    sequenceData,
    loop = $bindable(),
    autoPlay = false,
  }: {
    sequenceData: SequenceData | null;
    loop?: boolean;
    autoPlay?: boolean;
  } = $props();

  // Use global animation settings for loop, but allow prop override
  $effect(() => {
    if (loop === undefined) {
      loop = animationSettings.shouldLoop;
    }
  });

  // Services
  let playbackController: IAnimationPlaybackController | null = $state(null);

  // Animation state
  const animationPanelState = createAnimationPanelState();
  let loading = $state(false);
  let error = $state<string | null>(null);
  let initialized = $state(false);

  // Initialize services on mount
  onMount(() => {
    // Load animator module first to ensure animation services are bound
    loadFeatureModule("animate").then(() => {
      try {
        playbackController = resolve(
          TYPES.IAnimationPlaybackController
        ) as IAnimationPlaybackController;
      } catch (err) {
        console.error(
          "ShareAnimationViewer: Failed to resolve playback controller:",
          err
        );
        error = "Failed to initialize animation services";
      }
    }).catch((err) => {
      console.error("ShareAnimationViewer: Failed to load animator module:", err);
      error = "Failed to load animation module";
    });

    // Cleanup on unmount
    return () => {
      if (playbackController && initialized) {
        playbackController.stop();
      }
    };
  });

  // Initialize animation when sequence or controller changes
  $effect(() => {
    const seq = sequenceData;
    const controller = playbackController;

    untrack(() => {
      if (!seq || !controller) {
        initialized = false;
        return;
      }

      // Skip if no beats
      if (!seq.beats || seq.beats.length === 0) {
        error = "No beats to animate";
        initialized = false;
        return;
      }

      initializeAnimation(seq, controller);
    });
  });

  // Sync loop setting
  $effect(() => {
    animationPanelState.setShouldLoop(loop ?? animationSettings.shouldLoop);
  });

  async function initializeAnimation(
    seq: SequenceData,
    controller: IAnimationPlaybackController
  ) {
    try {
      loading = true;
      error = null;

      // Small delay to ensure UI is ready
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Initialize playback controller with sequence
      const success = controller.initialize(seq, animationPanelState);

      if (!success) {
        throw new Error("Failed to initialize animation playback");
      }

      // Set loop preference
      animationPanelState.setShouldLoop(loop ?? animationSettings.shouldLoop);

      initialized = true;
      loading = false;

      // Auto-start if requested
      if (autoPlay) {
        setTimeout(() => {
          animationPanelState.setIsPlaying(true);
          controller.togglePlayback();
        }, 100);
      }
    } catch (err) {
      console.error("ShareAnimationViewer: Failed to initialize:", err);
      error =
        err instanceof Error ? err.message : "Failed to initialize animation";
      loading = false;
      initialized = false;
    }
  }

  function togglePlayback() {
    if (!playbackController || !initialized) return;
    playbackController.togglePlayback();
  }

  function handleReset() {
    if (!playbackController || !initialized) return;
    playbackController.jumpToBeat(0);
    if (animationPanelState.isPlaying) {
      playbackController.togglePlayback();
    }
  }

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

  // Get current beat data for AnimatorCanvas
  let currentBeatData = $derived.by(() => {
    if (!animationPanelState.sequenceData?.beats) return null;
    const beatIndex = Math.max(0, animationPanelState.currentBeat - 1);
    return animationPanelState.sequenceData.beats[beatIndex] || null;
  });
</script>

<div class="share-animation-viewer">
  {#if !sequenceData || (sequenceData.beats?.length ?? 0) === 0}
    <div class="viewer-placeholder">
      <i class="fas fa-film"></i>
      <span>No sequence to animate</span>
    </div>
  {:else if loading}
    <div class="viewer-loading">
      <div class="spinner"></div>
      <span>Loading...</span>
    </div>
  {:else if error}
    <div class="viewer-error">
      <i class="fas fa-exclamation-triangle"></i>
      <span>{error}</span>
    </div>
  {:else}
    <div class="canvas-container">
      <AnimatorCanvas
        blueProp={animationPanelState.bluePropState}
        redProp={animationPanelState.redPropState}
        gridVisible={true}
        gridMode={sequenceData.gridMode}
        letter={currentLetter}
        beatData={currentBeatData}
        currentBeat={animationPanelState.currentBeat}
        sequenceData={animationPanelState.sequenceData}
        isPlaying={animationPanelState.isPlaying}
        onPlaybackToggle={togglePlayback}
        trailSettings={animationSettings.trail}
      />

      <!-- Playback Controls -->
      <div class="playback-controls">
        <button
          class="control-btn reset-btn"
          onclick={handleReset}
          title="Reset to start"
          aria-label="Reset animation"
        >
          <i class="fas fa-undo"></i>
        </button>

        <button
          class="control-btn play-pause-btn"
          onclick={togglePlayback}
          title={animationPanelState.isPlaying ? "Pause" : "Play"}
          aria-label={animationPanelState.isPlaying ? "Pause animation" : "Play animation"}
        >
          <i class="fas {animationPanelState.isPlaying ? 'fa-pause' : 'fa-play'}"></i>
        </button>

        <div class="beat-indicator">
          Beat {Math.floor(animationPanelState.currentBeat) + 1} / {animationPanelState.totalBeats}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .share-animation-viewer {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    overflow: hidden;
  }

  .canvas-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .viewer-placeholder,
  .viewer-loading,
  .viewer-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 13px;
  }

  .viewer-placeholder i,
  .viewer-error i {
    font-size: 32px;
    opacity: 0.5;
  }

  .viewer-error {
    color: #ef4444;
  }

  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Playback Controls */
  .playback-controls {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(10px);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10;
  }

  .control-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }

  .control-btn:active {
    transform: scale(0.95);
  }

  .play-pause-btn {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: transparent;
    font-size: 16px;
  }

  .play-pause-btn:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  .beat-indicator {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 600;
    padding: 0 8px;
    white-space: nowrap;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .control-btn {
      transition: none;
    }

    .control-btn:hover,
    .control-btn:active {
      transform: none;
    }
  }
</style>
