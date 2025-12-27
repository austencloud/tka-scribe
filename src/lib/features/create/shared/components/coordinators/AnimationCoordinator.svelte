<script lang="ts">
  /**
   * Animation Coordinator Component
   *
   * Orchestrates all animation business logic, service resolution, and state management.
   * AnimationShareDrawer is a pure presentation component that receives everything as props.
   *
   * Domain: Create module - Animation Share Drawer Coordination
   */

  import AnimationShareDrawer from "../../../../../shared/animation-engine/components/AnimationShareDrawer.svelte";
  import type { IAnimationPlaybackController } from "$lib/features/compose/services/contracts/IAnimationPlaybackController";
  import type { IVideoExportOrchestrator } from "$lib/features/compose/services/contracts/IVideoExportOrchestrator";
  import { sharedAnimationState } from "$lib/shared/animation-engine/state/shared-animation-state.svelte";
  import type { ISequenceRepository } from "../../services/contracts/ISequenceRepository";
  import { resolve, loadFeatureModule } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import { onMount } from "svelte";
  import {
    ANIMATION_LOAD_DELAY_MS,
    ANIMATION_AUTO_START_DELAY_MS,
  } from "$lib/features/compose/shared/domain/constants/timing";
  import { getCreateModuleContext } from "../../context/create-module-context";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";

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
  let sequenceService: ISequenceRepository | null = null;
  let playbackController: IAnimationPlaybackController | null = null;
  let videoExportOrchestrator: IVideoExportOrchestrator | null = null;
  let hapticService: IHapticFeedbackService | null = null;
  let animationCanvas: HTMLCanvasElement | null = null;

  // Export state
  let isExporting = $state(false);
  let exportProgress = $state(0);
  let exportStage = $state<string>("");

  // Share state
  let isSharing = $state(false);

  // Animation state - use shared global state for beat grid synchronization
  const animationPanelState = sharedAnimationState;

  // Glyph crossfade look-ahead threshold
  // Start showing next beat's glyph at 60% through current beat
  // This gives the 200ms crossfade time to complete well before beat grid updates
  const GLYPH_LOOKAHEAD_THRESHOLD = 0.6;

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

    // During animation: show beat letters with look-ahead for smooth crossfade
    if (
      animationPanelState.sequenceData.beats &&
      animationPanelState.sequenceData.beats.length > 0
    ) {
      // Look ahead: if we're 60% through a beat, start showing next beat's glyph
      // This allows the 200ms crossfade to complete well before beat grid updates
      const fractionalPart = currentBeat - Math.floor(currentBeat);
      const shouldLookAhead = fractionalPart >= GLYPH_LOOKAHEAD_THRESHOLD;

      const beatIndex = shouldLookAhead
        ? Math.ceil(currentBeat) // Next beat
        : Math.floor(currentBeat); // Current beat

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

    // During animation: show beat data with look-ahead for smooth crossfade
    if (
      animationPanelState.sequenceData.beats &&
      animationPanelState.sequenceData.beats.length > 0
    ) {
      // Look ahead: if we're 60% through a beat, start showing next beat's glyph
      // This allows the 200ms crossfade to complete well before beat grid updates
      const fractionalPart = currentBeat - Math.floor(currentBeat);
      const shouldLookAhead = fractionalPart >= GLYPH_LOOKAHEAD_THRESHOLD;

      const beatIndex = shouldLookAhead
        ? Math.ceil(currentBeat) // Next beat
        : Math.floor(currentBeat); // Current beat

      const clampedIndex = Math.max(
        0,
        Math.min(beatIndex, animationPanelState.sequenceData.beats.length - 1)
      );
      return animationPanelState.sequenceData.beats[clampedIndex] || null;
    }

    return null;
  });

  // State to track service readiness
  let servicesReady = $state(false);

  // Resolve services on mount
  onMount(async () => {
    console.log("🔧 AnimationCoordinator: Resolving services...");

    // Resolve core services immediately (should be available from create module loading)
    try {
      sequenceService = resolve<ISequenceRepository>(TYPES.ISequenceRepository);
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
      console.log("✅ Core services resolved");
    } catch (error) {
      console.error("❌ Failed to resolve core services:", error);
    }

    // Ensure animator module is loaded and resolve animation-specific services
    try {
      await loadFeatureModule("animate");
      console.log("✅ Animator module loaded");

      playbackController = resolve<IAnimationPlaybackController>(
        TYPES.IAnimationPlaybackController
      );
      videoExportOrchestrator = resolve<IVideoExportOrchestrator>(
        TYPES.IVideoExportOrchestrator
      );

      servicesReady = true;
      console.log(
        "✅ Animation services resolved, ready to initialize playback"
      );
    } catch (error) {
      console.error(
        "❌ Failed to load animator module or resolve services:",
        error
      );
      animationPanelState.setError("Failed to initialize animation services");
    }

    return undefined;
  });

  // Load and auto-start animation when panel becomes visible
  // Also reload when sequence changes (e.g., after rotation)
  $effect(() => {
    // Get the active tab's sequence state
    // CreateModuleState.sequenceState is a getter that internally calls getActiveTabSequenceState()
    const sequence = CreateModuleState.sequenceState.currentSequence;
    const isOpen = panelState.isAnimationPanelOpen;

    console.log("🔄 Animation effect triggered:", {
      isOpen,
      servicesReady,
      hasSequence: !!sequence,
      sequenceId: sequence?.id,
      sequenceWord: sequence?.word,
      sequenceName: sequence?.name,
      hasBeatData: sequence?.beats?.length ?? 0,
      hasMotionData: sequence?.beats?.some(
        (b) => b?.motions?.blue && b?.motions?.red
      ),
      activeTab: navigationState.activeTab,
      currentSection: navigationState.currentSection,
      hasPlaybackController: !!playbackController,
      hasSequenceService: !!sequenceService,
    });

    // Wait for services to be ready AND panel to be open AND sequence to exist
    if (
      isOpen &&
      servicesReady &&
      sequence &&
      sequenceService &&
      playbackController
    ) {
      console.log("✅ All conditions met, loading animation...");
      animationPanelState.setLoading(true);
      animationPanelState.setError(null);

      const loadTimeout = setTimeout(() => {
        loadAndStartAnimation(sequence);
      }, ANIMATION_LOAD_DELAY_MS);

      return () => clearTimeout(loadTimeout);
    } else if (isOpen && sequence && !servicesReady) {
      console.log("⏳ Waiting for animation services to be ready...");
    }
    return undefined;
  });

  async function loadAndStartAnimation(sequence: any) {
    console.log("🎬 loadAndStartAnimation called with sequence:", {
      id: sequence?.id,
      word: sequence?.word,
      name: sequence?.name,
      beatCount: sequence?.beats?.length,
      hasMotionData: sequence?.beats?.some(
        (b: any) => b?.motions?.blue && b?.motions?.red
      ),
    });

    if (!sequenceService || !playbackController) {
      console.error("❌ Missing required services:", {
        hasSequenceService: !!sequenceService,
        hasPlaybackController: !!playbackController,
      });
      return;
    }

    animationPanelState.setLoading(true);
    animationPanelState.setError(null);

    try {
      // Inline sequence loading logic
      const loadedSequence = await loadSequenceData(sequence, sequenceService);

      console.log("📦 Loaded sequence result:", {
        success: !!loadedSequence,
        id: loadedSequence?.id,
        word: loadedSequence?.word,
        beatCount: loadedSequence?.beats?.length,
        hasMotionData: loadedSequence?.beats?.some(
          (b: any) => b?.motions?.blue && b?.motions?.red
        ),
        hasStartPosition: !!loadedSequence?.startPosition,
      });

      if (!loadedSequence) {
        throw new Error("Failed to load sequence");
      }

      // Initialize playback controller
      animationPanelState.setShouldLoop(true);
      console.log("🎮 Initializing playback controller...");
      const success = playbackController.initialize(
        loadedSequence,
        animationPanelState
      );

      console.log("🎮 Playback controller initialized:", success);

      if (!success) {
        throw new Error("Failed to initialize animation playback");
      }

      animationPanelState.setSequenceData(loadedSequence);
      console.log("✅ Sequence data set in animation panel state");

      // Auto-start animation
      setTimeout(() => {
        console.log("▶️ Auto-starting animation playback...");
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
    service: ISequenceRepository
  ): Promise<SequenceData | null> {
    if (!sequence) return null;

    console.log("📥 Loading sequence data:", {
      id: sequence.id,
      word: sequence.word,
      name: sequence.name,
      hasBeatArray: Array.isArray(sequence.beats),
      beatCount: sequence.beats?.length ?? 0,
    });

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
      console.log("✅ Sequence already has motion data, using directly");
      fullSequence = sequence;
    }
    // Load from database/gallery if needed (empty beats)
    else if (sequence.id && (!sequence.beats || sequence.beats.length === 0)) {
      const galleryId = getGalleryIdentifier(sequence);
      console.log(
        "🔍 Sequence has no beats, attempting gallery load:",
        galleryId
      );
      if (galleryId) {
        const loaded = await service.getSequence(galleryId);
        if (loaded) {
          console.log("✅ Loaded sequence from gallery:", galleryId);
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
      console.log(
        "🔍 Sequence missing motion data, attempting hydration:",
        galleryId
      );
      if (galleryId) {
        const hydrated = await service.getSequence(galleryId);
        if (hydrated && hasMotionData(hydrated)) {
          console.log("✅ Hydrated sequence from gallery:", galleryId);
          fullSequence = hydrated;
        } else {
          console.warn(
            "⚠️ Failed to hydrate sequence from gallery:",
            galleryId
          );
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

  // Note: animatingBeatNumber is now synced in CreateModule via sharedAnimationState

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
    console.log("🎮 handlePlaybackToggle called");
    console.log("  playbackController:", playbackController);
    console.log(
      "  animationPanelState.isPlaying:",
      animationPanelState.isPlaying
    );

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

  /**
   * Handle video export
   */
  async function handleExportVideo() {
    console.log("🎬 Video export handler called");
    console.log("Canvas:", animationCanvas);
    console.log("Playback controller:", playbackController);
    console.log("Video export orchestrator:", videoExportOrchestrator);

    hapticService?.trigger("selection");

    if (!animationCanvas) {
      console.error("❌ No canvas available for video export");
      return;
    }

    if (!playbackController || !videoExportOrchestrator) {
      console.error("❌ Required services not available for video export");
      return;
    }

    if (isExporting) {
      console.warn("⚠️ Export already in progress");
      return;
    }

    try {
      isExporting = true;
      exportProgress = 0;
      exportStage = "preparing";

      await videoExportOrchestrator.executeExport(
        animationCanvas,
        playbackController,
        animationPanelState,
        (progress) => {
          exportProgress = progress.progress;
          exportStage = progress.stage;

          if (progress.stage === "capturing" && progress.currentFrame) {
            console.log(
              `📸 Capturing frame ${progress.currentFrame}/${progress.totalFrames}`
            );
          } else if (progress.stage === "encoding") {
            console.log("🔄 Encoding MP4...");
          } else if (progress.stage === "complete") {
            console.log("✅ MP4 export complete!");
          } else if (progress.stage === "error") {
            console.error("❌ MP4 export error:", progress.error);
          }
        },
        {
          // Uses MP4 format by default with 50fps
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (errorMessage === "Export cancelled") {
        console.log("🛑 Export cancelled by user");
        hapticService?.trigger("selection");
      } else {
        console.error("❌ Failed to export:", error);
        hapticService?.trigger("error");
      }
    } finally {
      isExporting = false;
      exportProgress = 0;
      exportStage = "";
    }
  }

  /**
   * Handle cancelling an in-progress export
   */
  function handleCancelExport() {
    console.log("❌ Cancel export handler called");
    hapticService?.trigger("selection");

    if (!videoExportOrchestrator) {
      console.warn("⚠️ No export orchestrator available");
      return;
    }

    if (!isExporting) {
      console.warn("⚠️ No export in progress to cancel");
      return;
    }

    try {
      videoExportOrchestrator.cancelExport();
      console.log("✅ Export cancellation requested");
    } catch (error) {
      console.error("❌ Failed to cancel export:", error);
    }
  }

  /**
   * Handle sharing animation via native share API
   * Shares a link to the animation (video file sharing requires blob generation to be added later)
   */
  async function handleShareAnimation() {
    console.log("📤 Share animation handler called");
    hapticService?.trigger("selection");

    if (isSharing || isExporting) {
      console.warn("⚠️ Export/share already in progress");
      return;
    }

    // Check if Web Share API is available
    if (!navigator.share) {
      console.warn("⚠️ Web Share API not available");
      // Could show a toast/alert here
      return;
    }

    try {
      isSharing = true;

      const sequenceName =
        animationPanelState.sequenceData?.word ||
        animationPanelState.sequenceData?.name ||
        "animation";

      // Share link to the animation
      const shareData: ShareData = {
        title: `TKA Animation: ${sequenceName}`,
        text: `Check out this flow animation: ${sequenceName}`,
        url: window.location.href,
      };

      await navigator.share(shareData);
      console.log("✅ Animation link shared successfully");
      hapticService?.trigger("success");
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("ℹ️ Share cancelled by user");
      } else {
        console.error("❌ Failed to share animation:", error);
        hapticService?.trigger("error");
      }
    } finally {
      isSharing = false;
    }
  }
</script>

<AnimationShareDrawer
  show={panelState.isAnimationPanelOpen}
  combinedPanelHeight={panelState.combinedPanelHeight}
  isSideBySideLayout={ctx.layout.shouldUseSideBySideLayout}
  loading={animationPanelState.loading}
  error={animationPanelState.error}
  speed={animationPanelState.speed}
  isPlaying={animationPanelState.isPlaying}
  playbackMode={animationPanelState.playbackMode}
  stepPlaybackPauseMs={animationPanelState.stepPlaybackPauseMs}
  stepPlaybackStepSize={animationPanelState.stepPlaybackStepSize}
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
  onPlaybackModeChange={(mode) => animationPanelState.setPlaybackMode(mode)}
  onStepPlaybackPauseMsChange={(pauseMs) =>
    animationPanelState.setStepPlaybackPauseMs(pauseMs)}
  onStepPlaybackStepSizeChange={(stepSize) =>
    animationPanelState.setStepPlaybackStepSize(stepSize)}
  onCanvasReady={handleCanvasReady}
  onVideoBeatChange={handleVideoBeatChange}
  onExportVideo={handleExportVideo}
  onCancelExport={handleCancelExport}
  onShareAnimation={handleShareAnimation}
  {isExporting}
  exportProgress={{ progress: exportProgress, stage: exportStage }}
  {isSharing}
/>
