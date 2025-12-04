<script lang="ts">
  /**
   * Animation Coordinator Component
   *
   * Orchestrates all animation business logic, service resolution, and state management.
   * AnimationPanel is a pure presentation component that receives everything as props.
   *
   * Domain: Create module - Animation Panel Coordination
   */

  import AnimationPanel from "../../../../../shared/animation-engine/components/AnimationPanel.svelte";
  import type { IAnimationPlaybackController } from "$lib/features/animate/services/contracts/IAnimationPlaybackController";
  import { createAnimationPanelState } from "$lib/features/animate/state/animation-panel-state.svelte";
  import type { ISequenceService } from "../../services/contracts/ISequenceService";
  import { resolve, loadFeatureModule } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";
  import {
    ANIMATION_LOAD_DELAY_MS,
    ANIMATION_AUTO_START_DELAY_MS,
  } from "$lib/features/animate/shared/domain/constants/timing";
  import { getCreateModuleContext } from "../../context/create-module-context";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  // Get context
  const ctx = getCreateModuleContext();
  const { CreateModuleState, panelState } = ctx;

  // Props (only bindable props remain)
  let {
    animatingBeatNumber = $bindable(),
  }: {
    animatingBeatNumber?: number | null;
  } = $props();

  // Services
  let sequenceService: ISequenceService | null = null;
  let playbackController: IAnimationPlaybackController | null = null;
  let hapticService: IHapticFeedbackService | null = null;
  let animationCanvas: HTMLCanvasElement | null = null;

  // Animation state
  const animationPanelState = createAnimationPanelState();

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

  // Derived: Current beat data (including motions for turn calculations)
  let currentBeatData = $derived.by(() => {
    if (!animationPanelState.sequenceData) return null;

    const currentBeat = animationPanelState.currentBeat;

    // Before animation starts (beat 0 and not playing) = start position
    if (
      currentBeat === 0 &&
      !animationPanelState.isPlaying &&
      animationPanelState.sequenceData.startPosition
    ) {
      return animationPanelState.sequenceData.startPosition;
    }

    // During animation: show beat data
    if (
      animationPanelState.sequenceData.beats &&
      animationPanelState.sequenceData.beats.length > 0
    ) {
      const beatIndex = Math.floor(currentBeat);
      const clampedIndex = Math.max(
        0,
        Math.min(beatIndex, animationPanelState.sequenceData.beats.length - 1)
      );
      return animationPanelState.sequenceData.beats[clampedIndex] || null;
    }

    return null;
  });

  // Resolve services on mount
  onMount(() => {
    // Resolve core services immediately (should be available from create module loading)
    try {
      sequenceService = resolve<ISequenceService>(TYPES.ISequenceService);
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
    } catch (error) {
      console.error("Failed to resolve core services:", error);
    }

    // Ensure animator module is loaded and resolve animation-specific services
    loadFeatureModule("animate").then(() => {
      try {
        playbackController = resolve<IAnimationPlaybackController>(
          TYPES.IAnimationPlaybackController
        );
      } catch (error) {
        console.error("Failed to resolve animation services:", error);
        animationPanelState.setError("Failed to initialize animation services");
      }
    }).catch((error) => {
      console.error("Failed to load animator module:", error);
      animationPanelState.setError("Failed to load animation module");
    });

    return undefined;
  });

  // Load and auto-start animation when panel becomes visible
  // Also reload when sequence changes (e.g., after rotation)
  $effect(() => {
    const sequence = CreateModuleState.sequenceState.currentSequence;
    const isOpen = panelState.isAnimationPanelOpen;

    if (isOpen && sequence && sequenceService && playbackController) {
      animationPanelState.setLoading(true);
      animationPanelState.setError(null);

      const loadTimeout = setTimeout(() => {
        loadAndStartAnimation(sequence);
      }, ANIMATION_LOAD_DELAY_MS);

      return () => clearTimeout(loadTimeout);
    }
    return undefined;
  });

  async function loadAndStartAnimation(sequence: any) {
    if (!sequenceService || !playbackController) return;

    animationPanelState.setLoading(true);
    animationPanelState.setError(null);

    try {
      // Inline sequence loading logic
      const loadedSequence = await loadSequenceData(sequence, sequenceService);

      if (!loadedSequence) {
        throw new Error("Failed to load sequence");
      }

      // Initialize playback controller
      animationPanelState.setShouldLoop(true);
      const success = playbackController.initialize(
        loadedSequence,
        animationPanelState
      );

      if (!success) {
        throw new Error("Failed to initialize animation playback");
      }

      animationPanelState.setSequenceData(loadedSequence);

      // Auto-start animation
      setTimeout(() => {
        playbackController?.togglePlayback();
      }, ANIMATION_AUTO_START_DELAY_MS);
    } catch (err) {
      console.error("❌ Failed to load sequence:", err);
      animationPanelState.setError(
        err instanceof Error ? err.message : "Failed to load sequence"
      );
    } finally {
      animationPanelState.setLoading(false);
    }
  }

  /**
   * Load and hydrate sequence data for animation
   */
  async function loadSequenceData(
    sequence: SequenceData | null,
    service: ISequenceService
  ): Promise<SequenceData | null> {
    if (!sequence) return null;

    const hasMotionData = (seq: SequenceData) =>
      Array.isArray(seq.beats) &&
      seq.beats.length > 0 &&
      seq.beats.some((beat) => beat?.motions?.blue && beat?.motions?.red);

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

    let fullSequence = sequence;

    // If sequence already has motion data, use it directly
    if (hasMotionData(sequence)) {
      fullSequence = sequence;
    }
    // Load from database/gallery if needed (empty beats)
    else if (sequence.id && (!sequence.beats || sequence.beats.length === 0)) {
      const galleryId = getGalleryIdentifier(sequence);
      if (galleryId) {
        const loaded = await service.getSequence(galleryId);
        if (loaded) {
          fullSequence = loaded;
        } else {
          console.warn(`⚠️ Could not load sequence from gallery: ${galleryId}`);
        }
      } else {
        console.log(
          `ℹ️ User-created sequence ${sequence.id} has no gallery entry`
        );
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

  // Notify parent when current beat changes
  $effect(() => {
    const currentBeat = animationPanelState.currentBeat;
    if (animationPanelState.isPlaying || currentBeat > 0) {
      animatingBeatNumber = Math.floor(currentBeat) + 1;
    }
  });

  // Cleanup on component destroy
  $effect(() => {
    return () => {
      if (playbackController) {
        playbackController.dispose();
      }
    };
  });

  // Event handlers
  function handleClose() {
    hapticService?.trigger("selection");

    if (playbackController) {
      playbackController.dispose();
    }

    panelState.closeAnimationPanel();
    animatingBeatNumber = null;
  }

  function handleSpeedChange(newSpeed: number) {
    hapticService?.trigger("selection");
    playbackController?.setSpeed(newSpeed);
  }

  function handlePlaybackStart() {
    hapticService?.trigger("selection");
    if (playbackController && !animationPanelState.isPlaying) {
      playbackController.togglePlayback();
    }
  }

  function handlePlaybackToggle() {
    hapticService?.trigger("selection");
    playbackController?.togglePlayback();
  }

  function handleCanvasReady(canvas: HTMLCanvasElement | null) {
    animationCanvas = canvas;
  }

  /**
   * Handle video beat changes from the video player.
   * This keeps the beat grid in sync when video is playing.
   */
  function handleVideoBeatChange(beat: number) {
    // Update the animation panel state with the current beat from video
    // This ensures the beat grid stays in sync with video playback
    animationPanelState.setCurrentBeat(beat);
  }
</script>

<AnimationPanel
  show={panelState.isAnimationPanelOpen}
  combinedPanelHeight={panelState.combinedPanelHeight}
  isSideBySideLayout={ctx.layout.shouldUseSideBySideLayout}
  loading={animationPanelState.loading}
  error={animationPanelState.error}
  speed={animationPanelState.speed}
  isPlaying={animationPanelState.isPlaying}
  blueProp={animationPanelState.bluePropState}
  redProp={animationPanelState.redPropState}
  gridVisible={true}
  gridMode={animationPanelState.sequenceData?.gridMode ??
    CreateModuleState.sequenceState.currentSequence?.gridMode}
  letter={currentLetter}
  beatData={currentBeatData}
  sequenceData={animationPanelState.sequenceData}
  onClose={handleClose}
  onSpeedChange={handleSpeedChange}
  onPlaybackStart={handlePlaybackStart}
  onPlaybackToggle={handlePlaybackToggle}
  onCanvasReady={handleCanvasReady}
  onVideoBeatChange={handleVideoBeatChange}
/>
