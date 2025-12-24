<!--
  AnimationSettings.svelte

  Settings content for animation export format.
  Rendered inside SettingsPanel when user clicks gear icon.

  Features:
  - FPS slider (15-60 FPS)
  - Loop count control (1-10)
  - Show overlays toggle
  - Preset selector (optional future enhancement)

  Domain: Share Hub - Settings - Animation Format
-->
<script lang="ts">
  import { getShareHubState } from '../../state/share-hub-state.svelte';

  const state = getShareHubState();

  function handleFpsChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    state.animationSettings = { ...state.animationSettings, fps: value };
  }

  function handleLoopCountChange(event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value);
    state.animationSettings = { ...state.animationSettings, loopCount: value };
  }

  function handleOverlaysToggle() {
    state.animationSettings = { ...state.animationSettings, showOverlays: !state.animationSettings.showOverlays };
  }
</script>

<div class="animation-settings">
  <!-- FPS Control -->
  <div class="setting-group">
    <div class="setting-header">
      <label for="fps-slider">
        <i class="fas fa-tachometer-alt"></i>
        Frame Rate
      </label>
      <span class="setting-value">{state.animationSettings.fps} FPS</span>
    </div>
    <input
      id="fps-slider"
      type="range"
      min="15"
      max="60"
      step="5"
      value={state.animationSettings.fps}
      oninput={handleFpsChange}
      class="slider"
    />
    <div class="slider-labels">
      <span>15 FPS</span>
      <span>60 FPS</span>
    </div>
  </div>

  <!-- Loop Count Control -->
  <div class="setting-group">
    <div class="setting-header">
      <label for="loop-slider">
        <i class="fas fa-redo"></i>
        Loop Count
      </label>
      <span class="setting-value">{state.animationSettings.loopCount}x</span>
    </div>
    <input
      id="loop-slider"
      type="range"
      min="1"
      max="10"
      step="1"
      value={state.animationSettings.loopCount}
      oninput={handleLoopCountChange}
      class="slider"
    />
    <div class="slider-labels">
      <span>1x</span>
      <span>10x</span>
    </div>
  </div>

  <!-- Show Overlays Toggle -->
  <div class="setting-group">
    <div class="toggle-row">
      <div class="toggle-label">
        <i class="fas fa-layer-group"></i>
        <div>
          <span class="toggle-title">Show Overlays</span>
          <span class="toggle-description">Display grid lines and beat markers</span>
        </div>
      </div>
      <button
        class="toggle-button"
        class:active={state.animationSettings.showOverlays}
        onclick={handleOverlaysToggle}
        role="switch"
        aria-checked={state.animationSettings.showOverlays}
      >
        <span class="toggle-thumb"></span>
      </button>
    </div>
  </div>

  <!-- Preset Selector (Future Enhancement) -->
  <!-- <div class="setting-group">
    <div class="setting-header">
      <label>
        <i class="fas fa-magic"></i>
        Presets
      </label>
    </div>
    <div class="preset-grid">
      TODO: Add preset cards like TrailSettingsSheet
    </div>
  </div> -->
</div>

<style>
  .animation-settings {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .setting-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .setting-header label {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, white);
  }

  .setting-header i {
    font-size: 16px;
    opacity: 0.7;
  }

  .setting-value {
    font-size: var(--font-size-min, 14px);
    font-weight: 700;
    color: var(--theme-accent, #4a9eff);
  }

  .slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    border-radius: 3px;
    outline: none;
    cursor: pointer;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: var(--theme-accent, #4a9eff);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;
  }

  .slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: var(--theme-accent, #4a9eff);
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;
  }

  .slider::-moz-range-thumb:hover {
    transform: scale(1.1);
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 12px;
  }

  .toggle-label {
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }

  .toggle-label i {
    font-size: 18px;
    margin-top: 2px;
    opacity: 0.7;
  }

  .toggle-label > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .toggle-title {
    font-size: var(--font-size-min, 14px);
    font-weight: 600;
    color: var(--theme-text, white);
  }

  .toggle-description {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .toggle-button {
    position: relative;
    width: 48px;
    height: 28px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
    border: 2px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .toggle-button:hover {
    border-color: var(--theme-accent, rgba(74, 158, 255, 0.5));
  }

  .toggle-button:focus-visible {
    outline: 2px solid var(--theme-accent, #4a9eff);
    outline-offset: 2px;
  }

  .toggle-button.active {
    background: var(--theme-accent, #4a9eff);
    border-color: var(--theme-accent, #4a9eff);
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .toggle-button.active .toggle-thumb {
    transform: translateX(20px);
  }

  /* Mobile optimization */
  @media (max-width: 600px) {
    .animation-settings {
      gap: 20px;
    }

    .toggle-row {
      padding: 14px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .slider::-webkit-slider-thumb,
    .slider::-moz-range-thumb {
      transition: none;
    }

    .toggle-button,
    .toggle-thumb {
      transition: none;
    }
  }
</style>
