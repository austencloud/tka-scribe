<!--
  TrailSettings.svelte

  Trail effect settings component for the animation viewer.
  Provides controls for trail mode, fade duration, and visual properties.

  2026 Design: Modern toggle switches and click-based steppers.
-->
<script lang="ts">
  import {
    type TrailSettings,
    TrailMode,
    TrackingMode,
  } from "../domain/types/TrailTypes";
  import ToggleSwitch from "./ToggleSwitch.svelte";
  import ModernStepper from "./ModernStepper.svelte";

  // Props
  let {
    settings = $bindable(),
    compact = false,
    blueMotionVisible = true,
    redMotionVisible = true,
    onToggleBlueMotion,
    onToggleRedMotion,
    hideVisibilityButtons = false,
  }: {
    settings: TrailSettings;
    compact?: boolean;
    blueMotionVisible?: boolean;
    redMotionVisible?: boolean;
    onToggleBlueMotion?: () => void;
    onToggleRedMotion?: () => void;
    hideVisibilityButtons?: boolean;
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

  function handleOpacityChange(opacity: number) {
    settings.maxOpacity = opacity;
  }

  function handleGlowToggle(enabled: boolean) {
    settings.glowEnabled = enabled;
  }

  function handleHidePropsToggle(enabled: boolean) {
    settings.hideProps = enabled;
  }

  function handlePreviewModeToggle(enabled: boolean) {
    settings.previewMode = enabled;
  }

  function setTrackingMode(mode: TrackingMode) {
    settings.trackingMode = mode;
  }
</script>

<div class="trail-settings" class:compact>
  {#if !compact}
    <div class="settings-header">
      <h3>Trail Settings</h3>
    </div>
  {/if}

  <!-- Mode & Track - Two column grid layout -->
  <div class="button-grid">
    <!-- Trail Mode Selection -->
    <div class="section-card">
      <div class="setting-group">
        <div class="setting-label">Mode</div>
        <div class="mode-buttons mode-grid">
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
    </div>

    <!-- Tracking Mode Selection -->
    <div class="section-card">
      <div class="setting-group">
        <div class="setting-label">Track</div>
        <div class="track-buttons">
          <div class="track-row">
            <button
              class="mode-btn"
              class:active={settings.trackingMode === TrackingMode.LEFT_END}
              onclick={() => setTrackingMode(TrackingMode.LEFT_END)}
              type="button"
              title="Track left end only"
            >
              <i class="fas fa-arrow-left"></i>
              {#if !compact}<span>Left</span>{/if}
            </button>
            <button
              class="mode-btn"
              class:active={settings.trackingMode === TrackingMode.RIGHT_END}
              onclick={() => setTrackingMode(TrackingMode.RIGHT_END)}
              type="button"
              title="Track right end (tip) only"
            >
              <i class="fas fa-arrow-right"></i>
              {#if !compact}<span>Right</span>{/if}
            </button>
          </div>
          <button
            class="mode-btn both-btn"
            class:active={settings.trackingMode === TrackingMode.BOTH_ENDS}
            onclick={() => setTrackingMode(TrackingMode.BOTH_ENDS)}
            type="button"
            title="Track both ends"
          >
            <i class="fas fa-arrows-alt-h"></i>
            {#if !compact}<span>Both</span>{/if}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Fade Duration, Line Width & Opacity - Compact row -->
  <div class="stepper-row three-col">
    {#if settings.mode === TrailMode.FADE}
      <div class="section-card">
        <div class="setting-group">
          <ModernStepper
            bind:value={fadeDurationSeconds}
            min={0.5}
            max={10}
            step={0.5}
            label="Fade"
            unit="s"
            onInput={handleFadeDurationChange}
            compact={true}
          />
        </div>
      </div>
    {/if}
    <div class="section-card">
      <div class="setting-group">
        <ModernStepper
          bind:value={settings.lineWidth}
          min={1}
          max={8}
          step={0.5}
          label="Width"
          unit="px"
          onInput={handleLineWidthChange}
          compact={true}
        />
      </div>
    </div>
    <div class="section-card">
      <div class="setting-group">
        <ModernStepper
          bind:value={settings.maxOpacity}
          min={0.1}
          max={1}
          step={0.05}
          label="Opacity"
          unit=""
          onInput={handleOpacityChange}
          compact={true}
        />
      </div>
    </div>
  </div>

  <!-- Motion Visibility - Styled color buttons -->
  {#if !hideVisibilityButtons}
    <div class="setting-group">
      <div class="setting-label">Visibility</div>
      <div class="visibility-buttons">
        <button
          class="vis-btn blue-vis-btn"
          class:active={blueMotionVisible}
          onclick={onToggleBlueMotion}
          type="button"
          title={blueMotionVisible ? "Hide blue motion" : "Show blue motion"}
        >
          <i class="fas {blueMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
          <span>Blue</span>
        </button>
        <button
          class="vis-btn red-vis-btn"
          class:active={redMotionVisible}
          onclick={onToggleRedMotion}
          type="button"
          title={redMotionVisible ? "Hide red motion" : "Show red motion"}
        >
          <i class="fas {redMotionVisible ? 'fa-eye' : 'fa-eye-slash'}"></i>
          <span>Red</span>
        </button>
      </div>
    </div>
  {/if}

  <!-- Display Toggles -->
  <div class="setting-group toggles">
    <ToggleSwitch
      bind:checked={settings.glowEnabled}
      label="Glow Effect"
      onToggle={handleGlowToggle}
    />

    <ToggleSwitch
      bind:checked={settings.hideProps}
      label="Hide Props"
      onToggle={handleHidePropsToggle}
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
    gap: clamp(6px, 1.2vw, 10px); /* Tighter for space efficiency */
  }

  /* Full mode (mobile settings panel) */
  .trail-settings:not(.compact) {
    max-width: 500px;
    margin: 0 auto;
    padding: clamp(16px, 4vw, 24px);
    gap: 12px;
  }

  /* Compact mode (inline desktop/mobile) */
  .trail-settings.compact {
    padding: 0;
    gap: clamp(6px, 1.2vw, 10px); /* Tighter for better space usage */
  }

  /* Desktop compact mode - use container units for perfect fit */
  @container (min-aspect-ratio: 5/4) {
    .trail-settings.compact {
      gap: 0.6cqh; /* Tighter for maximum canvas space */
    }

    .compact .setting-group {
      gap: 0.4cqh; /* Tighter spacing */
    }

    .compact .setting-label {
      font-size: 0.85cqh;
    }
  }

  .settings-header {
    text-align: center;
    margin-bottom: 4px;
  }

  .settings-header h3 {
    font-size: clamp(16px, 4vw, 20px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  /* ===========================
     GRID LAYOUTS
     =========================== */

  /* Two-column grid for Mode and Track buttons */
  .button-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(8px, 1.6vw, 12px);
    width: 100%;
  }

  /* Stack buttons on very small screens */
  @media (max-width: 380px) {
    .button-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Row layout for steppers */
  .stepper-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(8px, 1.6vw, 12px);
    width: 100%;
  }

  /* Three-column layout for compact steppers */
  .stepper-row.three-col {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }

  /* ===========================
     SECTION CARDS
     Visual separation for button groups
     =========================== */

  .section-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: clamp(10px, 2vw, 12px);
    padding: clamp(8px, 1.6vw, 10px);
    transition: all 0.2s ease;
  }

  .section-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 0.8vw, 6px);
  }

  .compact .setting-group {
    gap: clamp(5px, 1.2vw, 8px); /* A bit more breathing room */
  }

  .setting-label {
    font-size: clamp(9px, 1.8vw, 10px);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.75);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .compact .setting-label {
    font-size: clamp(8px, 1.6vw, 10px);
  }

  /* ===========================
     MODE BUTTONS
     =========================== */

  .mode-buttons {
    display: flex;
    justify-content: center;
    gap: clamp(4px, 0.8vw, 6px);
    width: 100%;
    flex-wrap: wrap;
  }

  /* 2x2 Grid layout for Mode buttons */
  .mode-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: clamp(4px, 0.8vw, 6px);
  }

  /* Track buttons container */
  .track-buttons {
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 0.8vw, 6px);
    width: 100%;
  }

  /* Row for Left and Right buttons */
  .track-row {
    display: flex;
    gap: clamp(4px, 0.8vw, 6px);
    width: 100%;
  }

  .track-row .mode-btn {
    flex: 1;
  }

  /* Both button - full width */
  .both-btn {
    width: 100%;
  }

  /* Desktop: use container units */
  @container (min-aspect-ratio: 5/4) {
    .mode-buttons {
      gap: 0.5cqw; /* More breathing room */
    }

    .compact .mode-btn {
      padding: 0.8cqh;
      min-width: 3.2cqh;
      min-height: 3.2cqh;
      width: 3.2cqh;
      height: 3.2cqh;
    }

    .compact .mode-btn i {
      font-size: 1.4cqh;
    }
  }

  .mode-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: clamp(8px, 1.6vw, 10px) clamp(8px, 1.6vw, 12px);
    background: rgba(255, 255, 255, 0.06);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(8px, 1.6vw, 10px);
    color: rgba(255, 255, 255, 0.6);
    font-size: clamp(9px, 1.8vw, 10px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    min-width: 44px; /* Maintain touch target */
    min-height: 44px;
  }

  .mode-btn i {
    font-size: clamp(14px, 2.8vw, 16px);
  }

  /* Compact mode buttons - proper touch targets */
  .compact .mode-btn {
    padding: clamp(10px, 2vw, 12px);
    min-width: clamp(44px, 8.8vw, 52px); /* Better touch target */
    min-height: clamp(44px, 8.8vw, 52px);
    font-size: clamp(9px, 1.8vw, 11px);
  }

  .compact .mode-btn i {
    font-size: clamp(16px, 3.2vw, 18px);
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
     VISIBILITY BUTTONS
     Colored buttons for blue/red motion visibility
     =========================== */

  .visibility-buttons {
    display: flex;
    gap: clamp(6px, 1.2vw, 8px);
    width: 100%;
  }

  .vis-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(4px, 0.8vw, 6px);
    min-height: clamp(44px, 8.8vw, 48px);
    padding: clamp(8px, 1.6vw, 10px);
    background: rgba(0, 0, 0, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: clamp(8px, 1.6vw, 10px);
    color: rgba(255, 255, 255, 0.5);
    font-size: clamp(10px, 2vw, 12px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .vis-btn i {
    font-size: clamp(16px, 3.2vw, 18px);
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn:hover {
      background: rgba(0, 0, 0, 0.3);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-1px);
    }
  }

  .vis-btn:active {
    transform: scale(0.98);
  }

  /* Blue visibility button - active state */
  .vis-btn.active.blue-vis-btn {
    background: linear-gradient(
      135deg,
      rgba(46, 49, 146, 0.6) 0%,
      rgba(59, 130, 246, 0.6) 100%
    );
    border-color: rgba(59, 130, 246, 0.8);
    color: rgba(191, 219, 254, 1);
    box-shadow: 0 2px 12px rgba(59, 130, 246, 0.4);
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn.active.blue-vis-btn:hover {
      background: linear-gradient(
        135deg,
        rgba(46, 49, 146, 0.7) 0%,
        rgba(59, 130, 246, 0.7) 100%
      );
      border-color: rgba(59, 130, 246, 1);
      box-shadow: 0 4px 16px rgba(59, 130, 246, 0.5);
    }
  }

  /* Red visibility button - active state */
  .vis-btn.active.red-vis-btn {
    background: linear-gradient(
      135deg,
      rgba(237, 28, 36, 0.6) 0%,
      rgba(239, 68, 68, 0.6) 100%
    );
    border-color: rgba(239, 68, 68, 0.8);
    color: rgba(254, 202, 202, 1);
    box-shadow: 0 2px 12px rgba(239, 68, 68, 0.4);
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn.active.red-vis-btn:hover {
      background: linear-gradient(
        135deg,
        rgba(237, 28, 36, 0.7) 0%,
        rgba(239, 68, 68, 0.7) 100%
      );
      border-color: rgba(239, 68, 68, 1);
      box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
    }
  }

  /* ===========================
     MODERN TOGGLES
     =========================== */

  .toggles {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: clamp(6px, 1.2vw, 8px);
  }

  /* Desktop: Toggles in a row */
  @container (min-aspect-ratio: 5/4) {
    .compact .toggles {
      flex-direction: row;
      gap: 0.4cqw;
    }
  }

  /* ===========================
     RESPONSIVE
     =========================== */

  @media (max-width: 480px) {
    .trail-settings:not(.compact) {
      padding: 16px;
      gap: 10px;
    }

    .mode-buttons {
      gap: 4px;
    }

    .button-grid,
    .stepper-row {
      gap: 8px;
    }
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .mode-btn,
    .section-card {
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

    .section-card {
      border-width: 2px;
      border-color: rgba(255, 255, 255, 0.3);
    }

    .setting-label {
      color: #ffffff;
    }
  }
</style>
