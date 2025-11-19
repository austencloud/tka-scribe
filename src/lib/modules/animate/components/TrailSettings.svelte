<!--
  TrailSettings.svelte

  Trail effect settings component for the animation viewer.
  Provides controls for trail mode, fade duration, and visual properties.
-->
<script lang="ts">
  import {
    type TrailSettings,
    TrailMode,
  } from "../domain/types/TrailTypes";

  // Props
  let {
    settings = $bindable(),
  }: {
    settings: TrailSettings;
  } = $props();

  // Derived values for display
  let fadeDurationSeconds = $derived(settings.fadeDurationMs / 1000);

  function setTrailMode(mode: TrailMode) {
    settings.mode = mode;
    // Auto-enable/disable trails based on mode
    settings.enabled = mode !== TrailMode.OFF;
  }

  function setFadeDuration(event: Event) {
    const target = event.target as HTMLInputElement;
    const seconds = parseFloat(target.value);
    settings.fadeDurationMs = seconds * 1000;
  }

  function setLineWidth(event: Event) {
    const target = event.target as HTMLInputElement;
    settings.lineWidth = parseFloat(target.value);
  }

  function toggleGlow() {
    settings.glowEnabled = !settings.glowEnabled;
  }

  function toggleBothEnds() {
    settings.trackBothEnds = !settings.trackBothEnds;
  }
</script>

<div class="trail-settings">
  <div class="settings-header">
    <h3>Trail Settings</h3>
  </div>

  <!-- Trail Mode Selection -->
  <div class="setting-group">
    <div class="setting-label">Trail Mode</div>
    <div class="mode-buttons">
      <button
        class="mode-btn"
        class:active={settings.mode === TrailMode.OFF}
        onclick={() => setTrailMode(TrailMode.OFF)}
        type="button"
      >
        Off
      </button>
      <button
        class="mode-btn"
        class:active={settings.mode === TrailMode.FADE}
        onclick={() => setTrailMode(TrailMode.FADE)}
        type="button"
      >
        Fade
      </button>
      <button
        class="mode-btn"
        class:active={settings.mode === TrailMode.LOOP_CLEAR}
        onclick={() => setTrailMode(TrailMode.LOOP_CLEAR)}
        type="button"
      >
        Loop Clear
      </button>
      <button
        class="mode-btn"
        class:active={settings.mode === TrailMode.PERSISTENT}
        onclick={() => setTrailMode(TrailMode.PERSISTENT)}
        type="button"
      >
        Persistent
      </button>
    </div>
  </div>

  <!-- Fade Duration (only shown in Fade mode) -->
  {#if settings.mode === TrailMode.FADE}
    <div class="setting-group">
      <label class="setting-label" for="fade-duration">
        Fade Duration: {fadeDurationSeconds.toFixed(1)}s
      </label>
      <input
        id="fade-duration"
        type="range"
        min="0.5"
        max="10"
        step="0.5"
        value={fadeDurationSeconds}
        oninput={setFadeDuration}
        class="slider"
      />
    </div>
  {/if}

  <!-- Line Width -->
  <div class="setting-group">
    <label class="setting-label" for="line-width">
      Line Width: {settings.lineWidth.toFixed(1)}px
    </label>
    <input
      id="line-width"
      type="range"
      min="1"
      max="8"
      step="0.5"
      value={settings.lineWidth}
      oninput={setLineWidth}
      class="slider"
    />
  </div>

  <!-- Glow Toggle -->
  <div class="setting-group">
    <label class="checkbox-label">
      <input
        type="checkbox"
        checked={settings.glowEnabled}
        onchange={toggleGlow}
      />
      <span>Enable Glow Effect</span>
    </label>
  </div>

  <!-- Track Both Ends Toggle -->
  <div class="setting-group">
    <label class="checkbox-label">
      <input
        type="checkbox"
        checked={settings.trackBothEnds}
        onchange={toggleBothEnds}
      />
      <span>Track Both Ends</span>
    </label>
  </div>
</div>

<style>
  .trail-settings {
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
    padding: clamp(16px, 4vw, 24px);
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .settings-header {
    text-align: center;
    margin-bottom: 8px;
  }

  .settings-header h3 {
    font-size: clamp(16px, 4vw, 20px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .setting-label {
    font-size: clamp(11px, 2.8vw, 13px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  /* Mode Buttons */
  .mode-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    width: 100%;
  }

  .mode-btn {
    padding: clamp(10px, 2.5vw, 14px) clamp(8px, 2vw, 12px);
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: clamp(11px, 2.8vw, 13px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
    white-space: nowrap;
  }

  .mode-btn.active {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-color: #3b82f6;
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  @media (hover: hover) and (pointer: fine) {
    .mode-btn:not(.active):hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.35);
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .mode-btn:active {
    transform: scale(0.98);
  }

  /* Sliders */
  .slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
  }

  @media (hover: hover) and (pointer: fine) {
    .slider::-webkit-slider-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
    }

    .slider::-moz-range-thumb:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
    }
  }

  .slider::-webkit-slider-thumb:active {
    transform: scale(1.15);
  }

  .slider::-moz-range-thumb:active {
    transform: scale(1.15);
  }

  .slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
  }

  .slider::-moz-range-track {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: rgba(255, 255, 255, 0.1);
  }

  /* Checkbox */
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  @media (hover: hover) and (pointer: fine) {
    .checkbox-label:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }

  .checkbox-label input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #3b82f6;
  }

  .checkbox-label span {
    font-size: clamp(12px, 3vw, 14px);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.85);
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    .trail-settings {
      padding: 16px;
      gap: 16px;
    }

    .mode-buttons {
      gap: 6px;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .mode-btn,
    .slider::-webkit-slider-thumb,
    .slider::-moz-range-thumb,
    .checkbox-label {
      transition: none;
    }

    .mode-btn:active,
    .slider::-webkit-slider-thumb:hover,
    .slider::-moz-range-thumb:hover {
      transform: none;
    }
  }
</style>
