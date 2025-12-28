<!--
  AnimationPreview.svelte

  Animation format preview with inline playback controls.
  Reuses existing AnimatorCanvas and PlayPauseButton components.

  Features:
  - Live animation preview via AnimatorCanvas
  - Play/Pause toggle using PlayPauseButton
  - FPS and loop count display from settings
  - Settings button opens AnimationSettings panel

  Domain: Share Hub - Single Media - Animation Format
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { getShareHubState } from '../../state/share-hub-state.svelte';
  import AnimatorCanvas from '$lib/shared/animation-engine/components/AnimatorCanvas.svelte';
  import PlayPauseButton from '$lib/features/compose/components/controls/PlayPauseButton.svelte';
  import { resolve, loadPixiModule, loadFeatureModule } from '$lib/shared/inversify/di';
  import { TYPES } from '$lib/shared/inversify/types';
  import { animationSettings } from '$lib/shared/animation-engine/state/animation-settings-state.svelte';
  import { createAnimationPanelState } from '$lib/features/compose/state/animation-panel-state.svelte';
  import type { IAnimationPlaybackController } from '$lib/features/compose/services/contracts/IAnimationPlaybackController';

  const hubState = getShareHubState();

  // Animation services and state
  let playbackController: IAnimationPlaybackController | null = null;
  const animationState = createAnimationPanelState();

  let loading = $state(true);
  let error = $state<string | null>(null);
  let servicesReady = $state(false);

  // Trail settings from global animation settings
  // NUCLEAR TEST: Disabled to check if trail settings is causing infinite loop
  // let trailSettings = $state(animationSettings.settings.trail);
  // $effect(() => {
  //   trailSettings = animationSettings.settings.trail;
  // });

  // Derived: Total beats for display
  const totalBeats = $derived(hubState.sequence?.beats?.length ?? 0);

  // Derived: Current beat data for AnimatorCanvas
  const currentBeatData = $derived.by(() => {
    if (!animationState.sequenceData) return null;

    const currentBeat = animationState.currentBeat;

    // Handle start position
    if (currentBeat === 0 && !animationState.isPlaying && animationState.sequenceData.startPosition) {
      return animationState.sequenceData.startPosition;
    }

    // Get beat from sequence
    if (animationState.sequenceData.beats?.length > 0) {
      const beatIndex = Math.floor(currentBeat);
      const clampedIndex = Math.max(0, Math.min(beatIndex, animationState.sequenceData.beats.length - 1));
      return animationState.sequenceData.beats[clampedIndex] || null;
    }

    return null;
  });

  // Derived: Current letter for glyph display
  const currentLetter = $derived(currentBeatData?.letter || null);

  // Initialize services on mount
  onMount(() => {
    const initialize = async () => {
      try {
        // Load animator module
        await loadFeatureModule('animate');

        playbackController = resolve(TYPES.IAnimationPlaybackController) as IAnimationPlaybackController;

        // Load Pixi module
        await loadPixiModule();

        servicesReady = true;
        loading = false;
      } catch (err) {
        console.error('Failed to initialize animation preview:', err);
        error = 'Failed to load animation services';
        loading = false;
      }
    };
    initialize();

    return () => {
      // Cleanup: stop playback and dispose state effects
      if (animationState.isPlaying) {
        playbackController?.togglePlayback();
      }
      animationState.dispose();
    };
  });

  // Initialize animation when sequence changes
  // NUCLEAR TEST: Disabled to check if animation initialization is causing infinite loop
  // $effect(() => {
  //   if (!hubState.sequence || !playbackController || !servicesReady) return;

  //   const initAnimation = async () => {
  //     try {
  //       const success = playbackController!.initialize(hubState.sequence!, animationState);
  //       if (!success) {
  //         error = 'Failed to initialize animation';
  //       }
  //     } catch (err) {
  //       console.error('Animation init error:', err);
  //       error = err instanceof Error ? err.message : 'Animation error';
  //     }
  //   };

  //   initAnimation();
  // });

  // Sync hub playing state with animation state
  // NUCLEAR TEST: Disabled to check if playing state sync is causing infinite loop
  // $effect(() => {
  //   if (!playbackController || !animationState.sequenceData) return;

  //   if (hubState.isPlaying !== animationState.isPlaying) {
  //     playbackController.togglePlayback();
  //   }
  // });

  // Sync current beat back to hub state
  // NUCLEAR TEST: Disabled to check if beat sync is causing infinite loop
  // $effect(() => {
  //   hubState.currentBeat = animationState.currentBeat;
  // });

  // Toggle play/pause
  function handlePlayToggle(playing: boolean) {
    hubState.isPlaying = playing;
  }

  // Open settings
  function handleSettingsClick() {
    hubState.settingsPanelOpen = true;
    hubState.settingsContext = { format: 'animation' };
  }
</script>

<div class="animation-preview">
  <!-- Preview Canvas -->
  <div class="preview-canvas">
    {#if loading}
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading animation...</p>
      </div>
    {:else if error}
      <div class="error-state">
        <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
        <p>{error}</p>
      </div>
    {:else if !hubState.sequence}
      <div class="empty-state">
        <i class="fas fa-video" aria-hidden="true"></i>
        <p>No sequence loaded</p>
      </div>
    {:else if servicesReady}
      <AnimatorCanvas
        blueProp={animationState.bluePropState}
        redProp={animationState.redPropState}
        gridVisible={true}
        gridMode={animationState.sequenceData?.gridMode ?? null}
        letter={currentLetter}
        beatData={currentBeatData}
        currentBeat={animationState.currentBeat}
        sequenceData={animationState.sequenceData}
      />
    {/if}
  </div>

  <!-- Inline Controls -->
  <div class="inline-controls">
    <PlayPauseButton
      isPlaying={hubState.isPlaying}
      onToggle={handlePlayToggle}
    />

    <div class="beat-indicator">
      <i class="fas fa-music" aria-hidden="true"></i>
      <span>Beat {Math.floor(animationState.currentBeat) + 1} / {totalBeats}</span>
    </div>

    <div class="control-group">
      <i class="fas fa-tachometer-alt" aria-hidden="true"></i>
      <span>{hubState.animationSettings.fps} FPS</span>
    </div>

    <div class="control-group">
      <i class="fas fa-redo" aria-hidden="true"></i>
      <span>{hubState.animationSettings.loopCount}x</span>
    </div>

    <button
      class="control-button settings-button"
      onclick={handleSettingsClick}
      aria-label="Animation settings"
    >
      <i class="fas fa-cog" aria-hidden="true"></i>
    </button>
  </div>
</div>

<style>
  .animation-preview {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 16px;
  }

  .preview-canvas {
    flex: 1;
    min-height: 0;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    container-type: size;
  }

  /* Ensure AnimatorCanvas sizes properly */
  .preview-canvas :global(.canvas-wrapper) {
    width: min(100cqw, 100cqh);
    height: min(100cqw, 100cqh);
    max-width: 100%;
    max-height: 100%;
  }

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--theme-text-dim, var(--theme-text-dim));
  }

  .error-state i,
  .empty-state i {
    font-size: var(--font-size-3xl);
    opacity: 0.3;
  }

  .error-state {
    color: var(--semantic-error);
  }

  .spinner {
    width: 44px;
    height: 44px;
    border: 4px solid var(--theme-stroke);
    border-top-color: var(--theme-accent);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .inline-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 12px;
    flex-wrap: wrap;
  }

  .beat-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: var(--theme-accent);
    border-radius: 8px;
    font-size: var(--font-size-min);
    font-weight: 500;
    color: var(--theme-text, white);
  }

  .beat-indicator i {
    font-size: var(--font-size-sm);
    opacity: 0.7;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    font-size: var(--font-size-min);
    color: var(--theme-text-dim, var(--theme-text-dim));
  }

  .control-group i {
    font-size: var(--font-size-sm);
    opacity: 0.7;
  }

  .control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    background: var(--theme-card-bg);
    border: 1px solid var(--theme-stroke);
    border-radius: 8px;
    font-size: var(--font-size-base);
    color: var(--theme-text, white);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .control-button:hover {
    background: var(--theme-card-hover-bg);
    border-color: var(--theme-accent);
  }

  .control-button:focus-visible {
    outline: 2px solid var(--theme-accent);
    outline-offset: 2px;
  }

  .settings-button {
    margin-left: auto;
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .inline-controls {
      gap: 8px;
    }

    .control-group {
      font-size: var(--font-size-compact);
      padding: 6px 8px;
    }

    .beat-indicator {
      font-size: var(--font-size-compact);
      padding: 6px 10px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .control-button {
      transition: none;
    }

    .spinner {
      animation: none;
    }
  }
</style>
