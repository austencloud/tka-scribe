<!--
  InlineAnimationPlayer.svelte

  Lightweight animation player for inline use in gallery detail panels.
  Does not require Create module context - fully standalone.

  Uses the shared animation engine with BPM preset controls.
-->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.svelte";
  import BpmPresetChips from "$lib/features/compose/components/controls/BpmPresetChips.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { IAnimationPlaybackController } from "$lib/features/compose/services/contracts/IAnimationPlaybackController";
  import type { ISequenceService } from "$lib/features/create/shared/services/contracts/ISequenceService";
  import { createAnimationPanelState } from "$lib/features/compose/state/animation-panel-state.svelte";
  import { resolve, loadFeatureModule } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";

  // BPM/Speed conversion constant
  const DEFAULT_BPM = 60;

  let {
    sequence,
    autoPlay = true,
  }: {
    sequence: SequenceData;
    autoPlay?: boolean;
  } = $props();

  // Services
  let sequenceService: ISequenceService | null = null;
  let playbackController: IAnimationPlaybackController | null = null;
  let servicesReady = $state(false);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Animation state
  const animationState = createAnimationPanelState();

  // Local reactive state for UI
  let isPlaying = $state(false);
  let bpm = $state(DEFAULT_BPM); // 60 BPM = 1.0x speed

  // Sync playing state from animation state
  $effect(() => {
    const checkPlaying = () => {
      const current = animationState.isPlaying;
      if (current !== isPlaying) {
        isPlaying = current;
      }
    };
    checkPlaying();
    const interval = setInterval(checkPlaying, 50);
    return () => clearInterval(interval);
  });

  // Derived state for canvas
  let currentLetter = $derived.by(() => {
    if (!animationState.sequenceData) return null;
    const currentBeat = animationState.currentBeat;

    if (currentBeat === 0 && !animationState.isPlaying && animationState.sequenceData.startPosition) {
      return animationState.sequenceData.startPosition.letter || null;
    }

    if (animationState.sequenceData.beats?.length > 0) {
      const beatIndex = Math.floor(currentBeat);
      const clampedIndex = Math.max(0, Math.min(beatIndex, animationState.sequenceData.beats.length - 1));
      return animationState.sequenceData.beats[clampedIndex]?.letter || null;
    }

    return null;
  });

  let currentBeatData = $derived.by(() => {
    if (!animationState.sequenceData) return null;
    const currentBeat = animationState.currentBeat;

    if (currentBeat === 0 && !animationState.isPlaying && animationState.sequenceData.startPosition) {
      return animationState.sequenceData.startPosition;
    }

    if (animationState.sequenceData.beats?.length > 0) {
      const beatIndex = Math.floor(currentBeat);
      const clampedIndex = Math.max(0, Math.min(beatIndex, animationState.sequenceData.beats.length - 1));
      return animationState.sequenceData.beats[clampedIndex] || null;
    }

    return null;
  });

  let gridMode = $derived(animationState.sequenceData?.gridMode ?? sequence?.gridMode);

  // Load services on mount
  onMount(async () => {
    try {
      // Load animator module
      await loadFeatureModule("animate");

      sequenceService = resolve<ISequenceService>(TYPES.ISequenceService);
      playbackController = resolve<IAnimationPlaybackController>(TYPES.IAnimationPlaybackController);
      servicesReady = true;

      // Load and start animation
      await loadAnimation();
    } catch (err) {
      console.error("Failed to initialize animation player:", err);
      error = "Failed to load animation";
      loading = false;
    }
  });

  onDestroy(() => {
    playbackController?.dispose();
  });

  async function loadAnimation() {
    if (!sequenceService || !playbackController || !sequence) return;

    loading = true;
    error = null;

    try {
      // Load full sequence data if needed
      const fullSequence = await loadSequenceData(sequence);

      if (!fullSequence) {
        throw new Error("Failed to load sequence data");
      }

      // Initialize playback
      animationState.setShouldLoop(true);
      const success = playbackController.initialize(fullSequence, animationState);

      if (!success) {
        throw new Error("Failed to initialize playback");
      }

      animationState.setSequenceData(fullSequence);

      // Auto-start if enabled
      if (autoPlay) {
        setTimeout(() => {
          playbackController?.togglePlayback();
        }, 300);
      }
    } catch (err) {
      console.error("Failed to load animation:", err);
      error = err instanceof Error ? err.message : "Failed to load animation";
    } finally {
      loading = false;
    }
  }

  async function loadSequenceData(seq: SequenceData): Promise<SequenceData | null> {
    if (!sequenceService) return null;

    const hasMotionData = (s: SequenceData) =>
      Array.isArray(s.beats) &&
      s.beats.length > 0 &&
      s.beats.some((beat) => beat?.motions?.blue && beat?.motions?.red);

    if (hasMotionData(seq)) {
      return seq;
    }

    // Try to load from gallery
    const identifier = seq.word || seq.name || seq.id;
    if (identifier) {
      const loaded = await sequenceService.getSequence(identifier);
      if (loaded && hasMotionData(loaded)) {
        return loaded;
      }
    }

    return seq;
  }

  function togglePlayback() {
    playbackController?.togglePlayback();
  }

  function handleBpmChange(newBpm: number) {
    bpm = newBpm;
    const speed = newBpm / DEFAULT_BPM;
    playbackController?.setSpeed(speed);
  }
</script>

<div class="inline-animation-player">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <span>Loading animation...</span>
    </div>
  {:else if error}
    <div class="error-state">
      <span>{error}</span>
      <button class="retry-btn" onclick={() => loadAnimation()}>Retry</button>
    </div>
  {:else}
    <!-- Animation Canvas -->
    <div class="canvas-container">
      <AnimatorCanvas
        blueProp={animationState.bluePropState}
        redProp={animationState.redPropState}
        gridVisible={true}
        {gridMode}
        letter={currentLetter}
        beatData={currentBeatData}
        sequenceData={animationState.sequenceData}
        {isPlaying}
        onPlaybackToggle={togglePlayback}
      />
    </div>

    <!-- Controls -->
    <div class="controls">
      <button
        class="control-btn play-btn"
        onclick={togglePlayback}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {#if isPlaying}
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
        {/if}
      </button>

      <div class="bpm-controls">
        <BpmPresetChips {bpm} onBpmChange={handleBpmChange} />
      </div>
    </div>
  {/if}
</div>

<style>
  .inline-animation-player {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    gap: 8px;
  }

  .canvas-container {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    overflow: hidden;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
  }

  .control-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .control-btn svg {
    width: 20px;
    height: 20px;
  }

  .control-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .control-btn:active {
    transform: scale(0.95);
  }

  .play-btn {
    width: 48px;
    height: 48px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: transparent;
  }

  .play-btn:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  .bpm-controls {
    flex: 1;
    min-width: 0;
  }

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px;
    height: 100%;
    color: rgba(255, 255, 255, 0.7);
    font-size: 14px;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: rgba(59, 130, 246, 0.8);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-state {
    color: rgba(252, 165, 165, 1);
  }

  .retry-btn {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: white;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .retry-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Reduce motion */
  @media (prefers-reduced-motion: reduce) {
    .control-btn,
    .retry-btn {
      transition: none;
    }

    .spinner {
      animation: none;
    }
  }
</style>
