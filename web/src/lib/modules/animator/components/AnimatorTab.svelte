<!--
Animator Tab - Sequence animation and visualization

Provides animation controls and visualization for sequences:
- Animation playback controls
- Beat-by-beat visualization
- Motion parameter adjustment
- Prop interpolation
-->
<script lang="ts">
  import { resolve, TYPES } from "$shared";
  import { onDestroy, onMount } from "svelte";
  // Import animation components
  import type { ISequenceStateService } from "$lib/modules/build/workbench/services";
  import type {
    IAnimationControlService,
    IMotionParameterService,
    ISequenceAnimationEngine,
  } from "../services";
  // Import animator components
  import AnimationControls from "./AnimationControls.svelte";
  import AnimationPanel from "./AnimationPanel.svelte";
  import AnimatorCanvas from "./AnimatorCanvas.svelte";
  import SequenceInfo from "./SequenceInfo.svelte";

  // ============================================================================
  // SERVICE RESOLUTION
  // ============================================================================

  const animationControlService = resolve(
    TYPES.IAnimationControlService
  ) as IAnimationControlService;
  const motionParameterService = resolve(
    TYPES.IMotionParameterService
  ) as IMotionParameterService;
  const animationEngine = resolve(
    TYPES.ISequenceAnimationEngine
  ) as ISequenceAnimationEngine;
  const sequenceStateService = resolve(
    TYPES.ISequenceStateService
  ) as ISequenceStateService;

  // ============================================================================
  // COMPONENT STATE
  // ============================================================================

  let isPlaying = $state(false);
  let currentBeat = $state(0);
  let totalBeats = $state(8);
  let animationSpeed = $state(1.0);
  let error = $state<string | null>(null);

  // Default prop states for AnimatorCanvas
  const defaultPropState = {
    position: { x: 0, y: 0 },
    rotation: 0,
    scale: 1,
    opacity: 1,
    centerPathAngle: 0,
    staffRotationAngle: 0,
    x: 0,
    y: 0,
  };

  // Create a reactive mock panel state for the AnimationPanel
  // The AnimationPanel expects isAnimationVisible and isAnimationCollapsed properties
  // that don't exist in the GalleryPanelStateManager interface
  let animationVisible = $state(true);
  let animationCollapsed = $state(false);

  const animatorPanelState = {
    // Panel state getters (required by interface)
    get navigationPanel() {
      return {
        id: "navigation",
        width: 300,
        isCollapsed: false,
        isVisible: true,
        minWidth: 200,
        maxWidth: 600,
        defaultWidth: 300,
        collapsedWidth: 60,
        isResizing: false,
      };
    },

    // Current resize operation
    get currentResize() {
      return null;
    },

    // Derived states
    get isAnyPanelResizing() {
      return false;
    },
    get navigationWidth() {
      return 300;
    },
    get isNavigationCollapsed() {
      return false;
    },

    // Animation-specific properties (these are what AnimationPanel actually needs)
    get isAnimationVisible() {
      return animationVisible;
    },
    get isAnimationCollapsed() {
      return animationCollapsed;
    },

    // Actions (no-op implementations)
    toggleNavigationCollapse: () => {},
    setNavigationWidth: (width: number) => {},

    // Resize operations (no-op implementations)
    startNavigationResize: (startX: number) => {},
    updateCurrentResize: (currentX: number) => {},
    endCurrentResize: () => {},

    // Utility (no-op implementations)
    resetPanels: () => {},
    cleanup: () => {},
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  function handlePlay() {
    try {
      isPlaying = true;
      animationControlService.play();
      console.log("✅ AnimatorTab: Play started");
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to start animation";
      console.error("❌ AnimatorTab: Play failed:", err);
    }
  }

  function handlePause() {
    try {
      isPlaying = false;
      animationControlService.pause();
      console.log("✅ AnimatorTab: Paused");
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to pause animation";
      console.error("❌ AnimatorTab: Pause failed:", err);
    }
  }

  function handleStop() {
    try {
      isPlaying = false;
      currentBeat = 0;
      animationControlService.stop();
      console.log("✅ AnimatorTab: Stopped");
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to stop animation";
      console.error("❌ AnimatorTab: Stop failed:", err);
    }
  }

  function handleBeatChange(beat: number) {
    try {
      currentBeat = beat;
      animationControlService.seek(beat);
      console.log("✅ AnimatorTab: Beat changed to:", beat);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to change beat";
      console.error("❌ AnimatorTab: Beat change failed:", err);
    }
  }

  function handleSpeedChange(speed: number) {
    try {
      animationSpeed = speed;
      animationControlService.setSpeed(speed);
      console.log("✅ AnimatorTab: Speed changed to:", speed);
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to change speed";
      console.error("❌ AnimatorTab: Speed change failed:", err);
    }
  }

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  onMount(async () => {
    console.log("✅ AnimatorTab: Mounted - Initializing animator services");

    try {
      // Create a proper default sequence using the sequence state service
      const defaultSequence = sequenceStateService.createNewSequence(
        "Default Animation Sequence",
        4
      );

      // Initialize animation engine with default sequence
      const initialized =
        animationEngine.initializeWithDomainData(defaultSequence);

      if (initialized) {
        console.log(
          "✅ AnimatorTab: Animation engine initialized successfully"
        );
      } else {
        console.warn(
          "⚠️ AnimatorTab: Animation engine initialization returned false"
        );
      }
    } catch (err) {
      console.error("❌ AnimatorTab: Initialization failed:", err);
      error =
        err instanceof Error ? err.message : "Failed to initialize animator";
    }
  });

  onDestroy(() => {
    console.log("✅ AnimatorTab: Cleaning up animator services");
    try {
      animationEngine?.dispose();
    } catch (err) {
      console.error("❌ AnimatorTab: Cleanup failed:", err);
    }
  });
</script>

<!-- ============================================================================ -->
<!-- TEMPLATE -->
<!-- ============================================================================ -->

<div class="animator-tab" data-testid="animator-tab">
  <!-- Error display -->
  {#if error}
    <div class="error-banner">
      <span>{error}</span>
      <button onclick={() => (error = null)}>×</button>
    </div>
  {/if}

  <div class="animator-layout">
    <!-- Top Panel: Animation Controls -->
    <div class="controls-panel">
      <AnimationControls
        {isPlaying}
        {currentBeat}
        {totalBeats}
        speed={animationSpeed}
        onPlay={handlePlay}
        onStop={handleStop}
        onSpeedChange={handleSpeedChange}
      />
      <!-- TODO: Fix animationSpeed prop mismatch -->
    </div>

    <!-- Main Panel: Canvas and Info -->
    <div class="main-panel">
      <div class="canvas-container">
        <AnimatorCanvas
          blueProp={defaultPropState}
          redProp={defaultPropState}
        />
        <!-- TODO: Fix currentBeat and isPlaying prop mismatches -->
      </div>

      <div class="info-panel">
        <SequenceInfo />
        <AnimationPanel panelState={animatorPanelState} />
      </div>
    </div>
  </div>
</div>

<!-- ============================================================================ -->
<!-- STYLES -->
<!-- ============================================================================ -->

<style>
  .animator-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
    position: relative;
  }

  .animator-layout {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .error-banner {
    background: var(--color-error, #ff4444);
    color: white;
    padding: 0.5rem 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .error-banner button {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
  }
</style>
