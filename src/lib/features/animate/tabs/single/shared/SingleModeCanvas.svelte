<!--
  SingleModeCanvas.svelte

  Full-screen animation canvas for Single mode.
  Renders animation inline (not in a modal/drawer).
-->
<script lang="ts">
  import AnimatorCanvas from "../../../../../shared/animation-engine/components/AnimatorCanvas.svelte";
  import type { ISequenceService } from "../../../../create/shared/services/contracts/ISequenceService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { IAnimationPlaybackController } from "../../../services/contracts/IAnimationPlaybackController";
  import { createAnimationPanelState } from "../../../state/animation-panel-state.svelte";
  import { onMount } from "svelte";
  import {
    ANIMATION_LOAD_DELAY_MS,
    ANIMATION_AUTO_START_DELAY_MS,
  } from "../../../shared/domain/constants/timing";

  // Props
  let {
    sequence,
    isPlaying = $bindable(),
    animatingBeatNumber = $bindable(null),
    speed = 1.0,
  }: {
    sequence: SequenceData;
    isPlaying?: boolean;
    animatingBeatNumber?: number | null;
    speed?: number;
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
      await new Promise((resolve) =>
        setTimeout(resolve, ANIMATION_LOAD_DELAY_MS)
      );

      console.log("🎬 Loading sequence for animation:", sequence.id);

      const fullSequence = await loadSequenceData(sequence, sequenceService);

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

      console.log("✅ Animation initialized successfully:", {
        sequenceId: fullSequence.id,
        hasSequenceData: !!animationPanelState.sequenceData,
        beatCount: fullSequence.beats?.length || 0,
      });

      // Check if sequence has motion data
      const hasMotionDataCheck = fullSequence.beats?.some(
        (beat) => beat?.motions?.blue && beat?.motions?.red
      );

      if (!hasMotionDataCheck) {
        console.error(
          "❌ Sequence is missing motion data! Props and arrows will not render."
        );
        error =
          "This sequence is missing motion data. Please select a different sequence or recreate it in the Create module.";
        loading = false;
        return;
      }

      loading = false;

      // Auto-start animation after a brief delay
      if (isPlaying) {
        setTimeout(() => {
          animationPanelState.setIsPlaying(true);
        }, ANIMATION_AUTO_START_DELAY_MS);
      }
    } catch (err) {
      console.error("❌ Failed to load sequence:", err);
      error = err instanceof Error ? err.message : "Failed to load sequence";
      loading = false;
    }
  }

  /**
   * Load and hydrate sequence data for animation
   */
  async function loadSequenceData(
    seq: SequenceData | null,
    service: ISequenceService
  ): Promise<SequenceData | null> {
    if (!seq) return null;

    const hasMotionData = (s: SequenceData) =>
      Array.isArray(s.beats) &&
      s.beats.length > 0 &&
      s.beats.some((beat) => beat?.motions?.blue && beat?.motions?.red);

    // Check if identifier looks like a UUID (user-created sequence)
    // UUIDs: 8-4-4-4-12 hex pattern, gallery words are letters like "DKIIEJII"
    const isUUID = (id: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      );

    // Get a valid gallery-compatible identifier (word preferred, or non-UUID id)
    const getGalleryIdentifier = (s: SequenceData): string | null => {
      if (s.word && s.word.trim()) return s.word;
      if (s.name && s.name.trim() && !isUUID(s.name)) return s.name;
      if (s.id && !isUUID(s.id)) return s.id;
      return null; // No gallery-compatible identifier available
    };

    let fullSequence = seq;

    // If sequence already has motion data, use it directly
    if (hasMotionData(seq)) {
      fullSequence = seq;
    }
    // Load from database/gallery if needed (empty beats)
    else if (seq.id && (!seq.beats || seq.beats.length === 0)) {
      const galleryId = getGalleryIdentifier(seq);
      if (galleryId) {
        const loaded = await service.getSequence(galleryId);
        if (loaded) {
          fullSequence = loaded;
        } else {
          // Gallery lookup failed - return original (may be user-created without gallery entry)
          console.warn(`⚠️ Could not load sequence from gallery: ${galleryId}`);
        }
      } else {
        // UUID-only sequence can't be loaded from gallery - use what we have
        console.log(`ℹ️ User-created sequence ${seq.id} has no gallery entry`);
      }
    }
    // Hydrate if missing motion data (try gallery lookup)
    else if (fullSequence && !hasMotionData(fullSequence)) {
      const galleryId = getGalleryIdentifier(fullSequence);
      if (galleryId) {
        const hydrated = await service.getSequence(galleryId);
        if (hydrated && hasMotionData(hydrated)) {
          fullSequence = hydrated;
        }
      }
    }

    // Normalize startPosition
    const withStarting = fullSequence as unknown as {
      startingPositionBeat?: unknown;
    };
    if (!fullSequence.startPosition && withStarting.startingPositionBeat) {
      fullSequence = {
        ...fullSequence,
        startPosition:
          withStarting.startingPositionBeat as SequenceData["startPosition"],
      };
    }

    return fullSequence;
  }

  // Sync isPlaying with animation panel state AND start/stop playback
  $effect(() => {
    console.log(
      "🎬 isPlaying changed:",
      isPlaying,
      "hasSequenceData:",
      !!animationPanelState.sequenceData
    );

    if (animationPanelState.sequenceData && playbackController) {
      console.log("🎬 Syncing isPlaying to animation panel state:", isPlaying);

      // Check if state needs to change before toggling
      const needsToggle = isPlaying !== animationPanelState.isPlaying;

      if (needsToggle) {
        console.log("🎬 Toggling playback via controller");
        playbackController.togglePlayback();
      }
    } else {
      console.warn(
        "⚠️ Cannot sync isPlaying - sequence data not loaded yet. Waiting for initialization..."
      );
    }
  });

  // Sync animating beat number
  $effect(() => {
    animatingBeatNumber = animationPanelState.currentBeat;
  });

  // Sync speed with playback controller
  $effect(() => {
    if (playbackController && animationPanelState.sequenceData) {
      console.log(`🎬 Syncing speed to playback controller: ${speed}x`);
      playbackController.setSpeed(speed);
    }
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

  // Derived: Current beat data (handles start position for beat 0)
  let currentBeatData = $derived.by(() => {
    if (!animationPanelState.sequenceData) return null;

    const currentBeat = animationPanelState.currentBeat;

    // Before animation starts (beat 0) = start position
    if (currentBeat === 0 && animationPanelState.sequenceData.startPosition) {
      return animationPanelState.sequenceData.startPosition;
    }

    // During animation: use beat data
    if (
      animationPanelState.sequenceData.beats &&
      animationPanelState.sequenceData.beats.length > 0
    ) {
      const beatIndex = Math.max(0, Math.floor(currentBeat) - 1);
      return animationPanelState.sequenceData.beats[beatIndex] || null;
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
      blueProp={animationPanelState.bluePropState}
      redProp={animationPanelState.redPropState}
      gridVisible={true}
      gridMode={animationPanelState.sequenceData?.gridMode ?? null}
      letter={currentLetter}
      beatData={currentBeatData}
      currentBeat={animationPanelState.currentBeat}
      sequenceData={animationPanelState.sequenceData}
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
