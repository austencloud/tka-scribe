<!--
  TunnelRenderer.svelte

  Dual-sequence animation renderer for Tunnel mode.
  Overlays two sequences with different colors on the same canvas.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import AnimatorCanvas from "$lib/shared/animation-engine/components/AnimatorCanvas.svelte";
  import {
    getContainerInstance,
    loadPixiModule,
    loadFeatureModule,
  } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import { animationSettings } from "$lib/shared/animation-engine/state/animation-settings-state.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import type { IAnimationPlaybackController } from "../../../services/contracts/IAnimationPlaybackController";
  import type { IPixiAnimationRenderer } from "../../../services/contracts/IPixiAnimationRenderer";
  import type { ISettingsState } from "$lib/shared/settings/services/contracts/ISettingsState";
  import { createAnimationPanelState } from "../../../state/animation-panel-state.svelte";
  import {
    ANIMATION_LOAD_DELAY_MS,
    ANIMATION_AUTO_START_DELAY_MS,
  } from "../../../shared/domain/constants/timing";
  import CanvasControls from "../components/CanvasControls.svelte";

  // Local type definition for tunnel colors
  type TunnelColors = {
    primary: {
      blue: string;
      red: string;
    };
    secondary: {
      blue: string;
      red: string;
    };
  };

  let {
    primarySequence,
    secondarySequence,
    tunnelColors,
    isPlaying = false,
    speed = 1.0,
    primaryVisible = true,
    primaryBlueVisible = true,
    primaryRedVisible = true,
    secondaryVisible = true,
    secondaryBlueVisible = true,
    secondaryRedVisible = true,
    onOpenSettings,
  }: {
    primarySequence: SequenceData | null;
    secondarySequence: SequenceData | null;
    tunnelColors: TunnelColors;
    isPlaying?: boolean;
    speed?: number;
    primaryVisible?: boolean;
    primaryBlueVisible?: boolean;
    primaryRedVisible?: boolean;
    secondaryVisible?: boolean;
    secondaryBlueVisible?: boolean;
    secondaryRedVisible?: boolean;
    onOpenSettings: (canvasId: string) => void;
  } = $props();

  // Services
  let primaryPlaybackController: IAnimationPlaybackController | null = null;
  let secondaryPlaybackController: IAnimationPlaybackController | null = null;
  let pixiRenderer: IPixiAnimationRenderer | null = null;
  let settingsService: ISettingsState | null = null;

  // Animation states (one for each sequence)
  const primaryAnimationState = createAnimationPanelState();
  const secondaryAnimationState = createAnimationPanelState();

  let loading = $state(false);
  let error = $state<string | null>(null);
  let secondaryTexturesLoaded = $state(false);

  // Trail settings - must track the settings object directly to get reactivity
  let trailSettings = $derived.by(() => {
    const settings = animationSettings.settings;
    return settings.trail;
  });

  // Initialize services
  onMount(() => {
    const initialize = async () => {
      try {
        // Ensure animator module is loaded (handles HMR recovery)
        await loadFeatureModule("animate");

        const container = await getContainerInstance();
        primaryPlaybackController = container.get<IAnimationPlaybackController>(
          TYPES.IAnimationPlaybackController
        );
        secondaryPlaybackController = container.get<IAnimationPlaybackController>(
          TYPES.IAnimationPlaybackController
        );
        settingsService = container.get<ISettingsState>(TYPES.ISettingsState);

        // Load Pixi module on-demand
        await loadPixiModule();
        pixiRenderer = container.get<IPixiAnimationRenderer>(
          TYPES.IPixiAnimationRenderer
        );

        // Load secondary prop textures for tunnel mode
        loadSecondaryPropTextures();
      } catch (err) {
        console.error("❌ Failed to initialize tunnel renderer:", err);
        error = "Failed to initialize animation services";
      }
    };
    initialize();
  });

  // Load secondary prop textures with tunnel colors
  async function loadSecondaryPropTextures() {
    if (!pixiRenderer || !settingsService) return;

    try {
      const propType = settingsService.currentSettings.propType || "staff";

      console.log("🎨 Loading secondary prop textures for tunnel mode:", {
        propType,
        blueColor: tunnelColors.secondary.blue,
        redColor: tunnelColors.secondary.red,
      });

      await pixiRenderer.loadSecondaryPropTextures(
        propType,
        tunnelColors.secondary.blue,
        tunnelColors.secondary.red
      );

      secondaryTexturesLoaded = true;
      console.log("✅ Secondary prop textures loaded successfully");
    } catch (err) {
      console.error("❌ Failed to load secondary prop textures:", err);
    }
  }

  // Reload secondary textures when tunnel colors change
  $effect(() => {
    if (secondaryTexturesLoaded) {
      tunnelColors.secondary.blue;
      tunnelColors.secondary.red;
      loadSecondaryPropTextures();
    }
  });

  // Load and start animations when sequences change
  $effect(() => {
    if (
      !primarySequence ||
      !secondarySequence ||
      !primaryPlaybackController ||
      !secondaryPlaybackController
    )
      return;

    loadAndStartAnimations();
  });

  async function loadAndStartAnimations() {
    if (
      !primarySequence ||
      !secondarySequence ||
      !primaryPlaybackController ||
      !secondaryPlaybackController
    )
      return;

    try {
      loading = true;
      error = null;

      await new Promise((resolve) =>
        setTimeout(resolve, ANIMATION_LOAD_DELAY_MS)
      );

      console.log("🎬 Initializing tunnel animations:", {
        primary: primarySequence.id,
        secondary: secondarySequence.id,
      });

      // Initialize both playback controllers
      const primarySuccess = primaryPlaybackController.initialize(
        primarySequence,
        primaryAnimationState
      );
      const secondarySuccess = secondaryPlaybackController.initialize(
        secondarySequence,
        secondaryAnimationState
      );

      if (!primarySuccess || !secondarySuccess) {
        throw new Error("Failed to initialize animation playback");
      }

      console.log("✅ Tunnel animations initialized successfully");
      loading = false;

      // Auto-start animations if playing
      if (isPlaying) {
        setTimeout(() => {
          primaryAnimationState.setIsPlaying(true);
          secondaryAnimationState.setIsPlaying(true);
        }, ANIMATION_AUTO_START_DELAY_MS);
      }
    } catch (err) {
      console.error("❌ Failed to initialize animations:", err);
      error =
        err instanceof Error ? err.message : "Failed to initialize animations";
      loading = false;
    }
  }

  // Sync isPlaying with both animation states
  $effect(() => {
    if (
      primaryAnimationState.sequenceData &&
      secondaryAnimationState.sequenceData &&
      primaryPlaybackController &&
      secondaryPlaybackController
    ) {
      const primaryNeedsToggle = isPlaying !== primaryAnimationState.isPlaying;
      const secondaryNeedsToggle =
        isPlaying !== secondaryAnimationState.isPlaying;

      if (primaryNeedsToggle) {
        primaryPlaybackController.togglePlayback();
      }
      if (secondaryNeedsToggle) {
        secondaryPlaybackController.togglePlayback();
      }
    }
  });

  // Sync speed with both playback controllers
  $effect(() => {
    if (
      primaryPlaybackController &&
      secondaryPlaybackController &&
      primaryAnimationState.sequenceData &&
      secondaryAnimationState.sequenceData
    ) {
      console.log(`🎬 Syncing speed to tunnel renderers: ${speed}x`);
      primaryPlaybackController.setSpeed(speed);
      secondaryPlaybackController.setSpeed(speed);
    }
  });

  // Derived: Current letters for both sequences
  let primaryLetter = $derived.by(() => {
    if (!primaryAnimationState.sequenceData) return null;

    const currentBeat = primaryAnimationState.currentBeat;

    if (
      currentBeat === 0 &&
      !primaryAnimationState.isPlaying &&
      primaryAnimationState.sequenceData.startPosition
    ) {
      return primaryAnimationState.sequenceData.startPosition.letter || null;
    }

    if (
      primaryAnimationState.sequenceData.beats &&
      primaryAnimationState.sequenceData.beats.length > 0
    ) {
      const beatIndex = Math.floor(currentBeat);
      const clampedIndex = Math.max(
        0,
        Math.min(beatIndex, primaryAnimationState.sequenceData.beats.length - 1)
      );
      return (
        primaryAnimationState.sequenceData.beats[clampedIndex]?.letter || null
      );
    }

    return null;
  });

  let secondaryLetter = $derived.by(() => {
    if (!secondaryAnimationState.sequenceData) return null;

    const currentBeat = secondaryAnimationState.currentBeat;

    if (
      currentBeat === 0 &&
      !secondaryAnimationState.isPlaying &&
      secondaryAnimationState.sequenceData.startPosition
    ) {
      return secondaryAnimationState.sequenceData.startPosition.letter || null;
    }

    if (
      secondaryAnimationState.sequenceData.beats &&
      secondaryAnimationState.sequenceData.beats.length > 0
    ) {
      const beatIndex = Math.floor(currentBeat);
      const clampedIndex = Math.max(
        0,
        Math.min(
          beatIndex,
          secondaryAnimationState.sequenceData.beats.length - 1
        )
      );
      return (
        secondaryAnimationState.sequenceData.beats[clampedIndex]?.letter || null
      );
    }

    return null;
  });
</script>

<div class="tunnel-renderer">
  {#if loading}
    <div class="loading-message">
      <div class="spinner"></div>
      <p>Loading animations...</p>
    </div>
  {:else if error}
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <p>{error}</p>
    </div>
  {:else if primarySequence && secondarySequence}
    <CanvasControls canvasId="tunnel" {onOpenSettings} />
    <AnimatorCanvas
      blueProp={primaryBlueVisible && primaryVisible
        ? primaryAnimationState.bluePropState
        : null}
      redProp={primaryRedVisible && primaryVisible
        ? primaryAnimationState.redPropState
        : null}
      secondaryBlueProp={secondaryBlueVisible && secondaryVisible
        ? secondaryAnimationState.bluePropState
        : null}
      secondaryRedProp={secondaryRedVisible && secondaryVisible
        ? secondaryAnimationState.redPropState
        : null}
      gridVisible={true}
      gridMode={primaryAnimationState.sequenceData?.gridMode ?? null}
      letter={primaryLetter}
      beatData={primaryAnimationState.sequenceData?.beats[
        primaryAnimationState.currentBeat - 1
      ] || null}
      currentBeat={primaryAnimationState.currentBeat}
      sequenceData={primaryAnimationState.sequenceData}
      {trailSettings}
    />
  {:else}
    <div class="empty-message">
      <i class="fas fa-video"></i>
      <p>No sequences loaded</p>
    </div>
  {/if}
</div>

<style>
  .tunnel-renderer {
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
    container-name: tunnel-renderer;
  }

  .tunnel-renderer :global(.canvas-wrapper) {
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
