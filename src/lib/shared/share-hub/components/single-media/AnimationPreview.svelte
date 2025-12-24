<!--
  AnimationPreview.svelte

  Animation format preview with inline playback controls.
  Displays animation canvas and settings gear icon.

  Features:
  - Animation preview canvas
  - Play/Pause control
  - Speed/FPS control
  - Settings button (opens AnimationSettings panel)
  - Loop indicator

  Domain: Share Hub - Single Media - Animation Format
-->
<script lang="ts">
  import { getShareHubState } from '../../state/share-hub-state.svelte';

  const state = getShareHubState();
  let playing = $state(false);
  let currentBeat = $state(0);

  function togglePlay() {
    playing = !playing;
    // TODO: Wire to actual animation playback
  }

  function handleSettingsClick() {
    state.settingsPanelOpen = true;
    state.settingsContext = { format: 'animation' };
  }
</script>

<div class="animation-preview">
  <!-- Preview Canvas -->
  <div class="preview-canvas">
    <!-- TODO: Integrate AnimationCanvas from compose module -->
    <div class="placeholder-canvas">
      <i class="fas fa-play-circle"></i>
      <p>Animation Preview</p>
      <span class="beat-indicator">Beat {currentBeat} / 8</span>
    </div>
  </div>

  <!-- Inline Controls -->
  <div class="inline-controls">
    <button class="control-button play-button" onclick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
      <i class="fas {playing ? 'fa-pause' : 'fa-play'}"></i>
      <span>{playing ? 'Pause' : 'Play'}</span>
    </button>

    <div class="control-group">
      <label for="fps-display">
        <i class="fas fa-tachometer-alt"></i>
        {state.animationSettings.fps} FPS
      </label>
    </div>

    <div class="control-group">
      <label for="loop-display">
        <i class="fas fa-redo"></i>
        {state.animationSettings.loopCount}x Loop
      </label>
    </div>

    <button
      class="control-button settings-button"
      onclick={handleSettingsClick}
      aria-label="Animation settings"
    >
      <i class="fas fa-cog"></i>
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
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.02));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .placeholder-canvas {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .placeholder-canvas i {
    font-size: 48px;
    opacity: 0.3;
  }

  .placeholder-canvas p {
    font-size: var(--font-size-min, 14px);
    margin: 0;
  }

  .beat-indicator {
    font-size: var(--font-size-compact, 12px);
    padding: 4px 12px;
    background: var(--theme-accent, rgba(74, 158, 255, 0.2));
    border-radius: 12px;
  }

  .inline-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
    flex-wrap: wrap;
  }

  .control-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 8px;
    font-size: var(--font-size-min, 14px);
    font-weight: 500;
    color: var(--theme-text, white);
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .control-button i {
    font-size: 16px;
  }

  .control-button:hover {
    background: var(--theme-card-bg-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
  }

  .control-button:focus-visible {
    outline: 2px solid var(--theme-accent, #4a9eff);
    outline-offset: 2px;
  }

  .play-button {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
  }

  .play-button:hover {
    background: var(--theme-accent-hover, #3d8de6);
  }

  .settings-button {
    margin-left: auto;
  }

  .control-group {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    font-size: var(--font-size-min, 14px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
  }

  .control-group label {
    display: flex;
    align-items: center;
    gap: 6px;
    cursor: default;
  }

  .control-group i {
    font-size: 14px;
    opacity: 0.7;
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .inline-controls {
      gap: 8px;
    }

    .control-button span {
      display: none;
    }

    .control-button {
      padding: 8px 12px;
    }

    .control-group {
      font-size: var(--font-size-compact, 12px);
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .control-button {
      transition: none;
    }
  }
</style>
