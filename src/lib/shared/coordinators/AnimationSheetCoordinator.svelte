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
  import AnimationPanel from "$lib/modules/animate/components/AnimationPanel.svelte";
  import type {
    AnimationExportFormat,
    GifExportProgress,
    IAnimationPlaybackController,
    IGifExportOrchestrator,
  } from "$lib/modules/animate/services/contracts";
  import { createAnimationPanelState } from "$lib/modules/animate/state/animation-panel-state.svelte";
  import { loadSequenceForAnimation } from "$lib/modules/animate/utils/sequence-loader";
  import type { ISequenceService } from "$create/shared";
  import { resolve, TYPES, type SequenceData } from "$shared";
  import type { IHapticFeedbackService } from "$shared/application/services/contracts";
  import { onMount } from "svelte";
  import {
    ANIMATION_LOAD_DELAY_MS,
    ANIMATION_AUTO_START_DELAY_MS,
    GIF_EXPORT_SUCCESS_DELAY_MS,
  } from "$lib/modules/animate/constants/timing";
  import type {
    ISheetRouterService,
    AnimationPanelState,
  } from "$shared/navigation/services/contracts/ISheetRouterService";

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

  // Resolve services on mount
  onMount(() => {
    try {
      sequenceService = resolve<ISequenceService>(TYPES.ISequenceService);
      playbackController = resolve<IAnimationPlaybackController>(
        TYPES.IAnimationPlaybackController
      );
      hapticService = resolve<IHapticFeedbackService>(
        TYPES.IHapticFeedbackService
      );
      gifExportOrchestrator = resolve<IGifExportOrchestrator>(
        TYPES.IGifExportOrchestrator
      );
      sheetRouterService = resolve<ISheetRouterService>(
        TYPES.ISheetRouterService
      );
    } catch (error) {
      console.error("Failed to resolve animation services:", error);
      animationPanelState.setError("Failed to initialize animation services");
    }

    // Listen for route changes to restore animation panel from URL
    const cleanupRouteListener = sheetRouterService?.onRouteChange((state) => {
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

    return () => {
      cleanupRouteListener?.();
    };
  });

  // Load and auto-start animation when panel becomes visible
  // Also reloads when sequence changes (e.g., after rotation) while panel is open
  $effect(() => {
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

  async function loadAndStartAnimation(seq: SequenceData) {
    if (!sequenceService || !playbackController) return;

    animationPanelState.setLoading(true);
    animationPanelState.setError(null);

    try {
      // Load sequence
      const result = await loadSequenceForAnimation(seq, sequenceService);

      if (!result.success || !result.sequence) {
        throw new Error(result.error || "Failed to load sequence");
      }

      // Initialize playback controller
      animationPanelState.setShouldLoop(true);
      const success = playbackController.initialize(
        result.sequence,
        animationPanelState
      );

      if (!success) {
        throw new Error("Failed to initialize animation playback");
      }

      animationPanelState.setSequenceData(result.sequence);

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
        const currentState = sheetRouterService?.getCurrentAnimationPanelState();
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
</script>

<AnimationPanel
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
  onCanvasReady={handleCanvasReady}
/>
