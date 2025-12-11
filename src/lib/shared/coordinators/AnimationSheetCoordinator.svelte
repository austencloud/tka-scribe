<!--
  AnimationSheetCoordinator.svelte

  Shared animation sheet coordinator that can be used across all modules.
  Decoupled from CreateModuleState - accepts sequence directly as a prop.

  This coordinator:
  - Manages animation playback lifecycle
  - Resolves services via DI
  - Handles GIF export
  - Provides clean prop interface for any module

  Usage:
    <AnimationSheetCoordinator
      sequence={yourSequence}
      bind:isOpen={showAnimator}
      bind:animatingBeatNumber={beatNum}
      combinedPanelHeight={panelHeight}
    />
-->
<script lang="ts">
  import AnimationShareDrawer from "../animation-engine/components/AnimationShareDrawer.svelte";
  import type { IAnimationPlaybackController } from "$lib/features/compose/services/contracts/IAnimationPlaybackController";
  import type { IGifExportOrchestrator } from "$lib/features/compose/services/contracts/IGifExportOrchestrator";
  import type { AnimationExportFormat } from "$lib/features/compose/services/contracts/IGifExportOrchestrator";
  import type { GifExportProgress } from "$lib/features/compose/services/contracts/IGifExportService";
  import { createAnimationPanelState } from "$lib/features/compose/state/animation-panel-state.svelte";
  import type { ISequenceService } from "$lib/features/create/shared/services/contracts/ISequenceService";
  import { resolve, loadFeatureModule } from "../inversify/di";
  import { TYPES } from "../inversify/types";
  import type { SequenceData } from "../foundation/domain/models/SequenceData";
  import type { IHapticFeedbackService } from "../application/services/contracts/IHapticFeedbackService";
  import { onMount, onDestroy } from "svelte";
  import {
    ANIMATION_LOAD_DELAY_MS,
    ANIMATION_AUTO_START_DELAY_MS,
    GIF_EXPORT_SUCCESS_DELAY_MS,
  } from "$lib/features/compose/shared/domain/constants/timing";
  import type {
    ISheetRouterService,
    AnimationPanelState,
  } from "../navigation/services/contracts/ISheetRouterService";
  import { createComponentLogger } from "../utils/debug-logger";

  const debug = createComponentLogger("AnimationSheetCoordinator");

  // Props - decoupled from any specific module state
  let {
    sequence = $bindable(), // Sequence to animate (from any source)
    isOpen = $bindable(), // Sheet visibility
    animatingBeatNumber: _animatingBeatNumber = $bindable(), // Current beat (optional)
    combinedPanelHeight = 0, // Panel height (optional)
  }: {
    sequence?: SequenceData | null;
    isOpen?: boolean;
    animatingBeatNumber?: number | null;
    combinedPanelHeight?: number;
  } = $props();

  // Services
  let sequenceService: ISequenceService | null = null;
  let playbackController: IAnimationPlaybackController | null = null;
  let hapticService: IHapticFeedbackService | null = null;
  let gifExportOrchestrator: IGifExportOrchestrator | null = null;
  let sheetRouterService: ISheetRouterService | null = null;
  let animationCanvas: HTMLCanvasElement | null = null;

  // State to track service readiness
  let servicesReady = $state(false);

  // Animation state
  const animationPanelState = createAnimationPanelState();

  // Local reactive state that syncs with animationPanelState
  // Using $state + $effect pattern because the factory's getter pattern breaks fine-grained reactivity
  let isPlayingLocal = $state(false);

  // Sync isPlaying from state factory - this $effect subscribes to state changes
  // Polling workaround: The state factory's getter pattern breaks Svelte 5 fine-grained reactivity
  $effect(() => {
    const checkPlaying = () => {
      const current = animationPanelState.isPlaying;
      if (current !== isPlayingLocal) {
        isPlayingLocal = current;
      }
    };
    checkPlaying();
    const interval = setInterval(checkPlaying, 50);
    return () => clearInterval(interval);
  });

  // GIF Export state
  let _showExportDialog = $state(false);
  let isExporting = $state(false);
  let _exportProgress = $state<GifExportProgress | null>(null);

  // Track if we're currently responding to a route change to avoid infinite loops
  let isRespondingToRouteChange = false;

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

  // Derived: Current beat data (for turns tuple generation)
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

  // Resolved grid mode: prefer animation state's gridMode, fallback to sequence's gridMode
  let resolvedGridMode = $derived(
    animationPanelState.sequenceData?.gridMode ?? sequence?.gridMode
  );

  // Track route listener cleanup at module level
  let cleanupRouteListener: (() => void) | undefined;

  // Cleanup on destroy
  onDestroy(() => {
    cleanupRouteListener?.();
  });

  // Resolve services on mount
  onMount(() => {
    debug.log("Resolving services...");

    // Use an async IIFE to handle async initialization
    (async () => {
      // Resolve core services immediately (Tier 1 - navigation module)
      try {
        sequenceService = resolve<ISequenceService>(TYPES.ISequenceService);
        hapticService = resolve<IHapticFeedbackService>(
          TYPES.IHapticFeedbackService
        );
        sheetRouterService = resolve<ISheetRouterService>(
          TYPES.ISheetRouterService
        );
        debug.success("Core services resolved");
      } catch (error) {
        console.error("❌ Failed to resolve core services:", error);
      }

      // Load animator module and resolve animation-specific services
      try {
        await loadFeatureModule("animate");
        debug.success("Animator module loaded");

        playbackController = resolve<IAnimationPlaybackController>(
          TYPES.IAnimationPlaybackController
        );
        gifExportOrchestrator = resolve<IGifExportOrchestrator>(
          TYPES.IGifExportOrchestrator
        );

        servicesReady = true;
        debug.success(
          "Animation services resolved, ready to initialize playback"
        );
      } catch (error) {
        console.error(
          "❌ Failed to load animator module or resolve services:",
          error
        );
        animationPanelState.setError("Failed to initialize animation services");
      }

      // Listen for route changes to restore animation panel from URL
      cleanupRouteListener = sheetRouterService?.onRouteChange((state) => {
        isRespondingToRouteChange = true;

        const sheetType = state.sheet;
        if (sheetType === "animation") {
          // Open animation panel if it's not already open
          if (!isOpen) {
            isOpen = true;
          }

          // Restore animation state from URL if available
          if (state.animationPanel) {
            restoreAnimationState(state.animationPanel);
          }
        } else if (isOpen && sheetType && sheetType !== null) {
          // Close animation panel if a different sheet is opened (not animation, not null)
          const otherSheets: readonly string[] = [
            "settings",
            "auth",
            "terms",
            "privacy",
          ];
          if (otherSheets.includes(sheetType)) {
            isOpen = false;
          }
        } else if (isOpen && !sheetType) {
          // Close animation panel if no sheet is in URL (user swiped away or pressed back)
          isOpen = false;
        }

        // Reset flag after a tick to allow effects to run
        setTimeout(() => {
          isRespondingToRouteChange = false;
        }, 0);
      });

      // Check if animation panel should be open on initial load
      const initialState = sheetRouterService?.getCurrentAnimationPanelState();
      if (initialState) {
        isOpen = true;
      }
    })();
  });

  // Load and auto-start animation when panel becomes visible
  // Also reloads when sequence changes (e.g., after rotation) while panel is open
  $effect(() => {
    debug.log("Animation effect triggered:", {
      isOpen,
      servicesReady,
      hasSequence: !!sequence,
      sequenceId: sequence?.id,
      sequenceWord: sequence?.word,
      beatCount: sequence?.beats?.length,
      hasMotionData: sequence?.beats?.some(
        (b) => b?.motions?.blue && b?.motions?.red
      ),
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
      debug.success("All conditions met, loading animation...");
      animationPanelState.setLoading(true);
      animationPanelState.setError(null);

      const loadTimeout = setTimeout(() => {
        loadAndStartAnimation(sequence);
      }, ANIMATION_LOAD_DELAY_MS);

      return () => clearTimeout(loadTimeout);
    } else if (isOpen && sequence && !servicesReady) {
      debug.info("Waiting for animation services to be ready...");
    }
    return undefined;
  });

  async function loadAndStartAnimation(seq: SequenceData) {
    if (!sequenceService || !playbackController) return;

    animationPanelState.setLoading(true);
    animationPanelState.setError(null);

    try {
      // Inline sequence loading
      const loadedSequence = await loadSequenceData(seq, sequenceService);

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

  /**
   * Restore animation state from URL parameters
   */
  function restoreAnimationState(urlState: AnimationPanelState) {
    if (!playbackController) return;

    // Restore speed if specified
    if (
      urlState.speed !== undefined &&
      urlState.speed !== animationPanelState.speed
    ) {
      playbackController.setSpeed(urlState.speed);
    }

    // Restore current beat if specified
    if (
      urlState.currentBeat !== undefined &&
      urlState.currentBeat !== animationPanelState.currentBeat
    ) {
      animationPanelState.setCurrentBeat(urlState.currentBeat);
    }

    // Note: sequenceId, isPlaying, and gridVisible would need additional handling
    // based on the specific requirements of your animation system
  }

  // Sync isOpen state with URL (both open and close)
  let previousIsOpen = isOpen;
  $effect(() => {
    if (!isRespondingToRouteChange) {
      if (isOpen && !previousIsOpen && sequence) {
        // Opening: Push new history entry with animation panel
        sheetRouterService?.openAnimationPanel({
          sequenceId: sequence.id,
          speed: animationPanelState.speed,
          isPlaying: animationPanelState.isPlaying,
          currentBeat: animationPanelState.currentBeat,
          gridVisible: true,
        });
      } else if (!isOpen && previousIsOpen) {
        // Closing: Clear URL parameters by replacing state (more reliable than history.back())
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.delete("sheet");
          url.searchParams.delete("animSeqId");
          url.searchParams.delete("animSpeed");
          url.searchParams.delete("animPlaying");
          url.searchParams.delete("animBeat");
          url.searchParams.delete("animGrid");
          window.history.replaceState({}, "", url);
          // Dispatch route change event
          window.dispatchEvent(new CustomEvent("route-change", { detail: {} }));
        }
      }
    }
    previousIsOpen = isOpen;
  });

  // Update URL state when animation state changes (without pushing new history)
  let previousSpeed = animationPanelState.speed;
  let previousBeat = animationPanelState.currentBeat;
  let previousPlaying = animationPanelState.isPlaying;

  $effect(() => {
    // CRITICAL: Only update if animation panel is actually open in URL (prevents error spam)
    if (isOpen && sequence && !isRespondingToRouteChange) {
      const currentSpeed = animationPanelState.speed;
      const currentBeat = animationPanelState.currentBeat;
      const currentPlaying = animationPanelState.isPlaying;

      // Only update URL if state has changed (to avoid infinite loops)
      if (
        currentSpeed !== previousSpeed ||
        Math.floor(currentBeat) !== Math.floor(previousBeat) ||
        currentPlaying !== previousPlaying
      ) {
        // Double-check that the current route is actually showing animation sheet
        // This prevents "Cannot update animation panel state when animation sheet is not open" errors
        const currentState =
          sheetRouterService?.getCurrentAnimationPanelState();
        if (currentState !== null) {
          sheetRouterService?.updateAnimationPanelState({
            speed: currentSpeed,
            currentBeat: Math.floor(currentBeat),
            isPlaying: currentPlaying,
          });

          previousSpeed = currentSpeed;
          previousBeat = currentBeat;
          previousPlaying = currentPlaying;
        }
      }
    }
  });

  // Notify parent when current beat changes
  $effect(() => {
    const currentBeat = animationPanelState.currentBeat;
    if (animationPanelState.isPlaying || currentBeat > 0) {
      _animatingBeatNumber = Math.floor(currentBeat) + 1;
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

    // Close the sheet route (this will trigger the route change listener which will set isOpen = false)
    sheetRouterService?.closeSheet();
    _animatingBeatNumber = null;
  }

  function handleSpeedChange(newSpeed: number) {
    hapticService?.trigger("selection");
    playbackController?.setSpeed(newSpeed);
  }

  function _handleOpenExport() {
    hapticService?.trigger("selection");
    _showExportDialog = true;
  }

  function handleCloseExport() {
    if (!isExporting) {
      _showExportDialog = false;
      _exportProgress = null;
    }
  }

  async function _handleExport(format: AnimationExportFormat) {
    if (!gifExportOrchestrator || !playbackController) {
      console.error("Export services not ready");
      return;
    }

    if (!animationCanvas) {
      console.error("Animation canvas not ready");
      return;
    }

    try {
      isExporting = true;

      // Execute export using orchestrator service
      await gifExportOrchestrator.executeExport(
        animationCanvas,
        playbackController,
        animationPanelState,
        (progress) => {
          _exportProgress = progress;
        },
        { format }
      );

      // Close dialog after delay
      setTimeout(() => {
        handleCloseExport();
        isExporting = false;
      }, GIF_EXPORT_SUCCESS_DELAY_MS);
    } catch (error) {
      console.error("GIF export failed:", error);
      isExporting = false;
    }
  }

  function _handleCancelExport() {
    if (gifExportOrchestrator) {
      gifExportOrchestrator.cancelExport();
    }
    isExporting = false;
    _exportProgress = null;
    handleCloseExport();
  }
  function handleCanvasReady(canvas: HTMLCanvasElement | null) {
    animationCanvas = canvas;
  }

  function handleExportGif() {
    console.log("🎬 AnimationSheetCoordinator: handleExportGif called");
    _handleExport("gif");
  }
</script>

<AnimationShareDrawer
  show={isOpen ?? false}
  {combinedPanelHeight}
  loading={animationPanelState.loading}
  error={animationPanelState.error}
  speed={animationPanelState.speed}
  isPlaying={isPlayingLocal}
  blueProp={animationPanelState.bluePropState}
  redProp={animationPanelState.redPropState}
  gridVisible={true}
  gridMode={resolvedGridMode}
  letter={currentLetter}
  beatData={currentBeatData}
  sequenceData={animationPanelState.sequenceData}
  onClose={handleClose}
  onSpeedChange={handleSpeedChange}
  onPlaybackToggle={() => playbackController?.togglePlayback()}
  onStepHalfBeatBackward={() => playbackController?.stepHalfBeatBackward()}
  onStepHalfBeatForward={() => playbackController?.stepHalfBeatForward()}
  onStepFullBeatBackward={() => playbackController?.stepFullBeatBackward()}
  onStepFullBeatForward={() => playbackController?.stepFullBeatForward()}
  onCanvasReady={handleCanvasReady}
  onExportGif={handleExportGif}
  {isExporting}
  exportProgress={_exportProgress}
/>
