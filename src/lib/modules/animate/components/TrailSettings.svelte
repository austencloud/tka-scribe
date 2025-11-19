<!--
  TrailSettings.svelte

  Trail effect settings component for the animation viewer.
  Provides controls for trail mode, fade duration, and visual properties.

  2026 Design: Modern toggle switches and premium sliders.
-->
<script lang="ts">
  import { type TrailSettings, TrailMode } from "../domain/types/TrailTypes";
  import ToggleSwitch from "./ToggleSwitch.svelte";
  import ModernSlider from "./ModernSlider.svelte";

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

  function handleFadeDurationChange(seconds: number) {
    settings.fadeDurationMs = seconds * 1000;
  }

  function handleLineWidthChange(width: number) {
    settings.lineWidth = width;
  }

  function handleGlowToggle(enabled: boolean) {
    settings.glowEnabled = enabled;
  }

  function handleBothEndsToggle(enabled: boolean) {
    settings.trackBothEnds = enabled;
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
      <ModernSlider
        bind:value={fadeDurationSeconds}
        min={0.5}
        max={10}
        step={0.5}
        label="Fade Duration"
        unit="s"
        onInput={handleFadeDurationChange}
      />
    </div>
  {/if}

  <!-- Line Width -->
  <div class="setting-group">
    <ModernSlider
      bind:value={settings.lineWidth}
      min={1}
      max={8}
      step={0.5}
      label="Line Width"
      unit="px"
      onInput={handleLineWidthChange}
    />
  </div>

  <!-- Modern Toggle Switches -->
  <div class="setting-group toggles">
    <ToggleSwitch
      bind:checked={settings.glowEnabled}
      label="Glow Effect"
      onToggle={handleGlowToggle}
    />

    <ToggleSwitch
      bind:checked={settings.trackBothEnds}
      label="Track Both Ends"
      onToggle={handleBothEndsToggle}
    />
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
      gap: 0.6cqh;
    }

    .compact .setting-group {
      gap: 0.4cqh;
    }

    .compact .setting-label {
      font-size: 1.2cqh;
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
      gap: 0.5cqw;
    }

    .compact .mode-btn {
      padding: 0.8cqh 0.5cqw;
      min-height: 3.5cqh;
      max-height: 4cqh;
    }

    .compact .mode-btn i {
      font-size: 1.5cqh;
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
     MODERN TOGGLES
     =========================== */

  .toggles {
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 1.2vw, 8px);
  }

  /* Desktop: Toggles in a row */
  @container (min-aspect-ratio: 5/4) {
    .compact .toggles {
      flex-direction: row;
      gap: 0.5cqw;
    }
  }

  /* ===========================
     DESKTOP OPTIMIZATIONS
     More compact in sidebar
     =========================== */

  @container (min-aspect-ratio: 5/4) {
    .trail-settings.compact {
      gap: clamp(6px, 1.2vw, 10px);
    }

    .compact .setting-group {
      gap: clamp(4px, 1vw, 6px);
    }

    .compact .setting-label {
      font-size: clamp(8px, 1.6vw, 10px);
    }

    .compact .mode-buttons {
      gap: clamp(4px, 1vw, 6px);
    }

    .compact .mode-btn {
      padding: clamp(5px, 1.2vw, 7px);
    }

    .compact .mode-btn i {
      font-size: clamp(10px, 2vw, 12px);
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
    .mode-btn {
      transition: none;
      animation: none;
    }

    .mode-btn:hover,
    .mode-btn:active {
      transform: none;
    }
  }

  /* High contrast */
  @media (prefers-contrast: high) {
    .mode-btn {
      border-width: 2px;
    }

    .setting-label {
      color: #ffffff;
    }
  }
</style>
