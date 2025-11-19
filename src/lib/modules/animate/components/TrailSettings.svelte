<!--
  TrailSettings.svelte

  Trail effect settings component for the animation viewer.
  Provides controls for trail mode, fade duration, and visual properties.
-->
<script lang="ts">
  import { type TrailSettings, TrailMode } from "../domain/types/TrailTypes";

  // Props
  let {
    settings = $bindable(),
    compact = false,
  }: {
    settings: TrailSettings;
    compact?: boolean;
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

<div class="trail-settings" class:compact>
  {#if !compact}
    <div class="settings-header">
      <h3>Trail Settings</h3>
    </div>
  {/if}

  <!-- Trail Mode Selection -->
  <div class="setting-group">
    <div class="setting-label">Mode</div>
    <div class="mode-buttons">
      <button
        class="mode-btn"
        class:active={settings.mode === TrailMode.OFF}
        onclick={() => setTrailMode(TrailMode.OFF)}
        type="button"
        title="No trail effect"
      >
        <i class="fas fa-ban"></i>
        {#if !compact}<span>Off</span>{/if}
      </button>
      <button
        class="mode-btn"
        class:active={settings.mode === TrailMode.FADE}
        onclick={() => setTrailMode(TrailMode.FADE)}
        type="button"
        title="Fade out trail over time"
      >
        <i class="fas fa-clock"></i>
        {#if !compact}<span>Fade</span>{/if}
      </button>
      <button
        class="mode-btn"
        class:active={settings.mode === TrailMode.LOOP_CLEAR}
        onclick={() => setTrailMode(TrailMode.LOOP_CLEAR)}
        type="button"
        title="Clear trail on loop"
      >
        <i class="fas fa-redo"></i>
        {#if !compact}<span>Loop</span>{/if}
      </button>
      <button
        class="mode-btn"
        class:active={settings.mode === TrailMode.PERSISTENT}
        onclick={() => setTrailMode(TrailMode.PERSISTENT)}
        type="button"
        title="Keep trail permanently"
      >
        <i class="fas fa-infinity"></i>
        {#if !compact}<span>Persist</span>{/if}
      </button>
    </div>
  </div>

  <!-- Fade Duration (only shown in Fade mode) -->
  {#if settings.mode === TrailMode.FADE}
    <div class="setting-group">
      <label class="setting-label" for="fade-duration">
        Fade: {fadeDurationSeconds.toFixed(1)}s
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
      Width: {settings.lineWidth.toFixed(1)}px
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

  <!-- Checkboxes -->
  <div class="setting-group checkboxes">
    <!-- Glow Toggle -->
    <label class="checkbox-label">
      <input
        type="checkbox"
        checked={settings.glowEnabled}
        onchange={toggleGlow}
      />
      <span>Glow</span>
    </label>

    <!-- Track Both Ends Toggle -->
    <label class="checkbox-label">
      <input
        type="checkbox"
        checked={settings.trackBothEnds}
        onchange={toggleBothEnds}
      />
      <span>Both Ends</span>
    </label>
  </div>
</div>

<style>
  /* ===========================
     TRAIL SETTINGS
     Supports both full and compact modes
     =========================== */

  .trail-settings {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: clamp(14px, 2.5vw, 18px);
  }

  /* Full mode (mobile settings panel) */
  .trail-settings:not(.compact) {
    max-width: 500px;
    margin: 0 auto;
    padding: clamp(16px, 4vw, 24px);
    gap: 20px;
  }

  /* Compact mode (inline desktop/mobile) */
  .trail-settings.compact {
    padding: 0;
    gap: clamp(6px, 1.2vw, 14px);
  }

  /* Desktop compact mode - use container units for perfect fit */
  @container (min-aspect-ratio: 5/4) {
    .trail-settings.compact {
      gap: 1cqh;
    }

    .compact .setting-group {
      gap: 0.6cqh;
    }

    .compact .setting-label {
      font-size: 1.4cqh;
    }

    /* Checkboxes in a row on desktop */
    .compact .checkboxes {
      flex-direction: row;
      gap: 0.8cqw;
    }

    .compact .checkbox-label {
      flex: 1;
      padding: 0.8cqh 0.8cqw;
      gap: 0.6cqw;
    }

    .compact .checkbox-label input[type="checkbox"] {
      width: 1.8cqh;
      height: 1.8cqh;
    }

    .compact .checkbox-label span {
      font-size: 1.4cqh;
    }

    /* Compact sliders */
    .compact .slider {
      height: 0.5cqh;
    }

    .compact .slider::-webkit-slider-thumb {
      width: 1.8cqh;
      height: 1.8cqh;
    }

    .compact .slider::-moz-range-thumb {
      width: 1.8cqh;
      height: 1.8cqh;
    }
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
    gap: clamp(6px, 1.5vw, 8px);
  }

  .compact .setting-group {
    gap: clamp(4px, 1vw, 6px);
  }

  .setting-label {
    font-size: clamp(10px, 2vw, 11px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .compact .setting-label {
    font-size: clamp(8px, 1.6vw, 10px);
  }

  /* ===========================
     MODE BUTTONS
     =========================== */

  .mode-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(4px, 1vw, 8px);
    width: 100%;
  }

  /* Desktop: 4 buttons in a row with container units */
  @container (min-aspect-ratio: 5/4) {
    .mode-buttons {
      grid-template-columns: repeat(4, 1fr);
      gap: 0.8cqw;
    }

    .compact .mode-btn {
      padding: 1.2cqh 0.8cqw;
      min-height: 4.5cqh;
      max-height: 5.5cqh;
    }

    .compact .mode-btn i {
      font-size: 2cqh;
    }
  }

  .mode-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: clamp(8px, 2vw, 12px);
    background: rgba(255, 255, 255, 0.06);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(8px, 1.5vw, 10px);
    color: rgba(255, 255, 255, 0.6);
    font-size: clamp(10px, 2vw, 12px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .mode-btn i {
    font-size: clamp(12px, 2.4vw, 14px);
  }

  /* Compact mode buttons - icon only */
  .compact .mode-btn {
    /* Remove aspect-ratio to prevent tall squares */
    padding: clamp(8px, 1.6vw, 12px);
    min-height: clamp(32px, 6vw, 40px);
    max-height: clamp(36px, 7vw, 44px);
    font-size: clamp(9px, 1.8vw, 11px);
  }

  .compact .mode-btn i {
    font-size: clamp(14px, 2.8vw, 18px);
  }

  .mode-btn.active {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.4) 0%,
      rgba(37, 99, 235, 0.4) 100%
    );
    border-color: rgba(59, 130, 246, 0.7);
    color: rgba(191, 219, 254, 1);
    box-shadow: 0 2px 12px rgba(59, 130, 246, 0.3);
  }

  @media (hover: hover) and (pointer: fine) {
    .mode-btn:not(.active):hover {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.3);
      color: rgba(255, 255, 255, 0.85);
      transform: scale(1.02);
    }

    .mode-btn.active:hover {
      background: linear-gradient(
        135deg,
        rgba(59, 130, 246, 0.5) 0%,
        rgba(37, 99, 235, 0.5) 100%
      );
      border-color: rgba(59, 130, 246, 0.9);
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
    }
  }

  .mode-btn:active {
    transform: scale(0.98);
  }

  /* ===========================
     SLIDERS
     =========================== */

  .slider {
    width: 100%;
    height: 5px;
    border-radius: 2.5px;
    background: rgba(255, 255, 255, 0.12);
    outline: none;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
  }

  .compact .slider {
    height: 4px;
    border-radius: 2px;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 1) 0%,
      rgba(37, 99, 235, 1) 100%
    );
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .compact .slider::-webkit-slider-thumb {
    width: 14px;
    height: 14px;
  }

  .slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 1) 0%,
      rgba(37, 99, 235, 1) 100%
    );
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .compact .slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
  }

  @media (hover: hover) and (pointer: fine) {
    .slider::-webkit-slider-thumb:hover {
      transform: scale(1.15);
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.6);
    }

    .slider::-moz-range-thumb:hover {
      transform: scale(1.15);
      box-shadow: 0 4px 14px rgba(59, 130, 246, 0.6);
    }
  }

  .slider::-webkit-slider-thumb:active {
    transform: scale(1.05);
  }

  .slider::-moz-range-thumb:active {
    transform: scale(1.05);
  }

  .slider::-webkit-slider-runnable-track {
    width: 100%;
    height: 5px;
    border-radius: 2.5px;
    background: rgba(255, 255, 255, 0.12);
  }

  .slider::-moz-range-track {
    width: 100%;
    height: 5px;
    border-radius: 2.5px;
    background: rgba(255, 255, 255, 0.12);
  }

  /* ===========================
     CHECKBOXES
     =========================== */

  .checkboxes {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 1.5vw, 8px);
  }

  .compact .checkboxes {
    gap: clamp(4px, 1vw, 6px);
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: clamp(8px, 1.8vw, 10px);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: clamp(6px, 1.2vw, 8px);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .compact .checkbox-label {
    padding: clamp(6px, 1.2vw, 8px);
    gap: 6px;
  }

  @media (hover: hover) and (pointer: fine) {
    .checkbox-label:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
      transform: translateX(2px);
    }
  }

  .checkbox-label:active {
    transform: scale(0.98);
  }

  .checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: #3b82f6;
    flex-shrink: 0;
  }

  .compact .checkbox-label input[type="checkbox"] {
    width: 14px;
    height: 14px;
  }

  .checkbox-label span {
    font-size: clamp(11px, 2.2vw, 12px);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    flex: 1;
  }

  .compact .checkbox-label span {
    font-size: clamp(9px, 1.8vw, 11px);
  }

  /* ===========================
     DESKTOP OPTIMIZATIONS
     More compact in sidebar
     =========================== */

  @container (min-aspect-ratio: 5/4) {
    .trail-settings.compact {
      gap: clamp(8px, 1.5vw, 12px);
    }

    .compact .setting-group {
      gap: clamp(5px, 1.2vw, 7px);
    }

    .compact .setting-label {
      font-size: clamp(9px, 1.8vw, 10px);
    }

    .compact .mode-buttons {
      gap: clamp(5px, 1.2vw, 7px);
    }

    .compact .mode-btn {
      padding: clamp(6px, 1.5vw, 8px);
    }

    .compact .mode-btn i {
      font-size: clamp(11px, 2.2vw, 13px);
    }

    .compact .slider {
      height: 4px;
      border-radius: 2px;
    }

    .compact .slider::-webkit-slider-thumb {
      width: 16px;
      height: 16px;
    }

    .compact .slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
    }

    .compact .slider::-webkit-slider-runnable-track {
      height: 4px;
    }

    .compact .slider::-moz-range-track {
      height: 4px;
    }

    .compact .checkbox-label {
      padding: clamp(6px, 1.5vw, 8px);
      gap: 6px;
    }

    .compact .checkbox-label input[type="checkbox"] {
      width: 14px;
      height: 14px;
    }

    .compact .checkbox-label span {
      font-size: clamp(10px, 2vw, 11px);
    }
  }

  /* ===========================
     RESPONSIVE
     =========================== */

  @media (max-width: 480px) {
    .trail-settings:not(.compact) {
      padding: 16px;
      gap: 16px;
    }

    .mode-buttons {
      gap: 6px;
    }
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .mode-btn,
    .slider::-webkit-slider-thumb,
    .slider::-moz-range-thumb,
    .checkbox-label {
      transition: none;
      animation: none;
    }

    .mode-btn:hover,
    .mode-btn:active,
    .slider::-webkit-slider-thumb:hover,
    .slider::-moz-range-thumb:hover,
    .checkbox-label:hover,
    .checkbox-label:active {
      transform: none;
    }
  }

  /* High contrast */
  @media (prefers-contrast: high) {
    .mode-btn {
      border-width: 2px;
    }

    .checkbox-label {
      border-width: 2px;
    }

    .setting-label {
      color: #ffffff;
    }
  }
</style>
