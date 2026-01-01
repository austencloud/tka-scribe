<!--
  SettingsTogglePanel.svelte

  Inline settings panel with animated mode switcher.
  Toggle between Visual and Playback settings - no sheets required.

  Visual: Motion visibility, Elements, Trails
  Playback: Style (continuous/step), BPM/Speed controls
-->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    getAnimationVisibilityManager,
    type GridMode,
    type TrailStyle,
  } from "$lib/shared/animation-engine/state/animation-visibility-state.svelte";
  import {
    animationSettings,
    TrailMode,
    TrackingMode,
  } from "$lib/shared/animation-engine/state/animation-settings-state.svelte";
  import { isBilateralProp } from "$lib/shared/pictograph/prop/domain/enums/PropClassification";
  import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
  import type {
    PlaybackMode,
    StepPlaybackStepSize,
  } from "../../state/animation-panel-state.svelte";

  type SettingsMode = "playback" | "visual";

  let {
    propType = null,
    bluePropType = null,
    redPropType = null,
    bpm = $bindable(60),
    playbackMode = "continuous",
    stepPlaybackStepSize = 1,
    isPlaying = false,
    onBpmChange = () => {},
    onPlaybackModeChange = () => {},
    onStepPlaybackStepSizeChange = () => {},
    onPlaybackToggle = () => {},
  }: {
    propType?: PropType | string | null;
    bluePropType?: PropType | string | null;
    redPropType?: PropType | string | null;
    bpm: number;
    playbackMode?: PlaybackMode;
    stepPlaybackStepSize?: StepPlaybackStepSize;
    isPlaying?: boolean;
    onBpmChange?: (bpm: number) => void;
    onPlaybackModeChange?: (mode: PlaybackMode) => void;
    onStepPlaybackStepSizeChange?: (stepSize: StepPlaybackStepSize) => void;
    onPlaybackToggle?: () => void;
  } = $props();

  // Active settings mode - default to playback
  let activeMode = $state<SettingsMode>("playback");

  // ============ Visual Settings State ============
  const visibilityManager = getAnimationVisibilityManager();
  let updateCounter = $state(0);
  let currentTrailStyle = $state<TrailStyle>(visibilityManager.getTrailStyle());

  onMount(() => {
    const handleChange = () => {
      currentTrailStyle = visibilityManager.getTrailStyle();
      updateCounter++;
    };
    visibilityManager.registerObserver(handleChange);
    return () => visibilityManager.unregisterObserver(handleChange);
  });

  // Both ends toggle for bilateral props
  const showBothEndsToggle = $derived.by(() => {
    const blue = bluePropType ?? propType;
    const red = redPropType ?? propType;
    const blueIsBilateral = blue != null && isBilateralProp(blue);
    const redIsBilateral = red != null && isBilateralProp(red);
    return (blueIsBilateral || redIsBilateral) && currentTrailStyle !== "off";
  });

  const isBothEnds = $derived(
    animationSettings.trail.trackingMode === TrackingMode.BOTH_ENDS
  );

  // ============ Visibility Getters ============
  function getGridEnabled() {
    updateCounter;
    return visibilityManager.getGridMode() !== "none";
  }
  function getBlueMotion() {
    updateCounter;
    return visibilityManager.getVisibility("blueMotion");
  }
  function getRedMotion() {
    updateCounter;
    return visibilityManager.getVisibility("redMotion");
  }
  function getProps() {
    updateCounter;
    return visibilityManager.getVisibility("props");
  }
  function getBeatNumbers() {
    updateCounter;
    return visibilityManager.getVisibility("beatNumbers");
  }
  function getTkaGlyph() {
    updateCounter;
    return visibilityManager.getVisibility("tkaGlyph");
  }

  // ============ Toggle Handlers ============
  function toggleGrid() {
    const currentMode = visibilityManager.getGridMode();
    const newMode: GridMode = currentMode === "none" ? "diamond" : "none";
    visibilityManager.setGridMode(newMode);
    updateCounter++;
  }
  function toggleBlueMotion() {
    const current = visibilityManager.getVisibility("blueMotion");
    visibilityManager.setVisibility("blueMotion", !current);
    updateCounter++;
  }
  function toggleRedMotion() {
    const current = visibilityManager.getVisibility("redMotion");
    visibilityManager.setVisibility("redMotion", !current);
    updateCounter++;
  }
  function toggleProps() {
    const current = visibilityManager.getVisibility("props");
    visibilityManager.setVisibility("props", !current);
    updateCounter++;
  }
  function toggleBeatNumbers() {
    const current = visibilityManager.getVisibility("beatNumbers");
    visibilityManager.setVisibility("beatNumbers", !current);
    updateCounter++;
  }
  function toggleTkaGlyph() {
    const current = visibilityManager.getVisibility("tkaGlyph");
    visibilityManager.setVisibility("tkaGlyph", !current);
    updateCounter++;
  }

  // ============ Trail Style Handlers ============
  function setTrailStyle(style: TrailStyle) {
    visibilityManager.setTrailStyle(style);
    switch (style) {
      case "off":
        animationSettings.setTrailMode(TrailMode.OFF);
        break;
      case "subtle":
        animationSettings.setTrailMode(TrailMode.FADE);
        animationSettings.setFadeDuration(1500);
        animationSettings.setTrailAppearance({
          lineWidth: 2.5,
          maxOpacity: 0.7,
          glowEnabled: false,
        });
        break;
      case "vivid":
        animationSettings.setTrailMode(TrailMode.FADE);
        animationSettings.setFadeDuration(2500);
        animationSettings.setTrailAppearance({
          lineWidth: 4,
          maxOpacity: 0.95,
          glowEnabled: true,
        });
        break;
    }
    updateCounter++;
  }

  function toggleBothEnds() {
    const newMode = isBothEnds ? TrackingMode.RIGHT_END : TrackingMode.BOTH_ENDS;
    animationSettings.setTrackingMode(newMode);
    updateCounter++;
  }

  // ============ Playback Handlers ============
  function handleModeChange(mode: PlaybackMode) {
    if (mode === playbackMode) return;
    const wasPlaying = isPlaying;
    if (wasPlaying) onPlaybackToggle();
    onPlaybackModeChange(mode);
    if (wasPlaying) setTimeout(() => onPlaybackToggle(), 0);
  }

  // BPM presets
  const BPM_PRESETS = [30, 60, 90, 120, 150];

  function selectBpmPreset(preset: number) {
    bpm = preset;
    onBpmChange(preset);
  }

  function adjustBpm(delta: number) {
    const newBpm = Math.max(15, Math.min(180, bpm + delta));
    bpm = newBpm;
    onBpmChange(newBpm);
  }

  // Tap tempo
  let tapTimes: number[] = $state([]);
  let tapTimeout: number | null = null;

  function handleTap() {
    const now = Date.now();
    if (tapTimeout !== null) clearTimeout(tapTimeout);
    tapTimes = [...tapTimes, now].slice(-8);

    if (tapTimes.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimes.length; i++) {
        intervals.push((tapTimes[i] ?? 0) - (tapTimes[i - 1] ?? 0));
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      const newBpm = Math.max(15, Math.min(180, calculatedBpm));
      bpm = newBpm;
      onBpmChange(newBpm);
    }

    tapTimeout = setTimeout(() => {
      tapTimes = [];
    }, 2000) as unknown as number;
  }
</script>

<div class="futuristic-panel">
  <!-- Animated Mode Switcher -->
  <div class="mode-switcher">
    <div class="switcher-track">
      <div
        class="switcher-pill"
        class:visual={activeMode === "visual"}
      ></div>
      <button
        class="switcher-btn"
        class:active={activeMode === "playback"}
        onclick={() => (activeMode = "playback")}
        type="button"
        aria-pressed={activeMode === "playback"}
      >
        <i class="fas fa-sliders-h" aria-hidden="true"></i>
        <span>Playback</span>
      </button>
      <button
        class="switcher-btn"
        class:active={activeMode === "visual"}
        onclick={() => (activeMode = "visual")}
        type="button"
        aria-pressed={activeMode === "visual"}
      >
        <i class="fas fa-eye" aria-hidden="true"></i>
        <span>Visual</span>
      </button>
    </div>
  </div>

  <!-- Settings Content with Crossfade -->
  <div class="settings-content">
    {#if activeMode === "playback"}
      <div class="settings-pane" data-mode="playback">
        <!-- Playback Style -->
        <section class="setting-group">
          <div class="group-header">
            <span class="group-label">Style</span>
          </div>
          <div class="style-toggle">
            <button
              class="style-btn"
              class:active={playbackMode === "continuous"}
              onclick={() => handleModeChange("continuous")}
              type="button"
            >
              <i class="fas fa-infinity" aria-hidden="true"></i>
              <span>Flow</span>
            </button>
            <button
              class="style-btn"
              class:active={playbackMode === "step"}
              onclick={() => handleModeChange("step")}
              type="button"
            >
              <i class="fas fa-shoe-prints" aria-hidden="true"></i>
              <span>Step</span>
            </button>
          </div>

          {#if playbackMode === "step"}
            <div class="step-size-row">
              <span class="step-label">Step Size</span>
              <div class="step-chips">
                <button
                  class="step-chip"
                  class:active={stepPlaybackStepSize === 1}
                  onclick={() => onStepPlaybackStepSizeChange(1)}
                  type="button"
                >
                  Beat
                </button>
                <button
                  class="step-chip"
                  class:active={stepPlaybackStepSize === 0.5}
                  onclick={() => onStepPlaybackStepSizeChange(0.5)}
                  type="button"
                >
                  Half
                </button>
              </div>
            </div>
          {/if}
        </section>

        <!-- BPM Control -->
        <section class="setting-group">
          <div class="group-header">
            <span class="group-label">Speed</span>
          </div>
          <div class="bpm-control">
            <div class="bpm-adjuster">
              <button
                class="bpm-btn minus"
                onclick={() => adjustBpm(-5)}
                disabled={bpm <= 15}
                type="button"
                aria-label="Decrease BPM"
              >
                <i class="fas fa-minus" aria-hidden="true"></i>
              </button>

              <button
                class="bpm-display"
                onclick={handleTap}
                type="button"
                aria-label="Tap to set tempo"
                title="Tap repeatedly to set BPM"
              >
                <span class="bpm-value">{bpm}</span>
                <span class="bpm-unit">{tapTimes.length > 0 ? "TAP" : "BPM"}</span>
              </button>

              <button
                class="bpm-btn plus"
                onclick={() => adjustBpm(5)}
                disabled={bpm >= 180}
                type="button"
                aria-label="Increase BPM"
              >
                <i class="fas fa-plus" aria-hidden="true"></i>
              </button>
            </div>

            <div class="bpm-presets">
              {#each BPM_PRESETS as preset}
                <button
                  class="preset-chip"
                  class:active={bpm === preset}
                  onclick={() => selectBpmPreset(preset)}
                  type="button"
                >
                  {preset}
                </button>
              {/each}
            </div>
          </div>
        </section>
      </div>
    {:else}
      <div class="settings-pane" data-mode="visual">
        <!-- Motion Visibility -->
        <section class="setting-group">
          <div class="group-header">
            <span class="group-label">Motion</span>
          </div>
          <div class="motion-toggles">
            <button
              class="motion-btn blue"
              class:active={getBlueMotion()}
              onclick={toggleBlueMotion}
              type="button"
            >
              <i class="fas fa-eye{getBlueMotion() ? '' : '-slash'}" aria-hidden="true"></i>
              <span>Blue</span>
            </button>
            <button
              class="motion-btn red"
              class:active={getRedMotion()}
              onclick={toggleRedMotion}
              type="button"
            >
              <i class="fas fa-eye{getRedMotion() ? '' : '-slash'}" aria-hidden="true"></i>
              <span>Red</span>
            </button>
          </div>
        </section>

        <!-- Element Toggles -->
        <section class="setting-group">
          <div class="group-header">
            <span class="group-label">Elements</span>
          </div>
          <div class="element-grid">
            <button
              class="element-btn grid-el"
              class:active={getGridEnabled()}
              onclick={toggleGrid}
              type="button"
            >
              <i class="fas fa-border-all" aria-hidden="true"></i>
              <span>Grid</span>
            </button>
            <button
              class="element-btn props-el"
              class:active={getProps()}
              onclick={toggleProps}
              type="button"
            >
              <i class="fas fa-circle" aria-hidden="true"></i>
              <span>Props</span>
            </button>
            <button
              class="element-btn beat-el"
              class:active={getBeatNumbers()}
              onclick={toggleBeatNumbers}
              type="button"
            >
              <i class="fas fa-hashtag" aria-hidden="true"></i>
              <span>Beat #</span>
            </button>
            <button
              class="element-btn glyph-el"
              class:active={getTkaGlyph()}
              onclick={toggleTkaGlyph}
              type="button"
              title="TKA Glyph includes turn numbers"
            >
              <i class="fas fa-font" aria-hidden="true"></i>
              <span>Glyph</span>
            </button>
          </div>
        </section>

        <!-- Trails -->
        <section class="setting-group">
          <div class="group-header">
            <span class="group-label">Trails</span>
          </div>
          <div class="trail-presets">
            <button
              class="trail-btn off"
              class:active={currentTrailStyle === "off"}
              onclick={() => setTrailStyle("off")}
              type="button"
            >
              Off
            </button>
            <button
              class="trail-btn subtle"
              class:active={currentTrailStyle === "subtle"}
              onclick={() => setTrailStyle("subtle")}
              type="button"
            >
              Subtle
            </button>
            <button
              class="trail-btn vivid"
              class:active={currentTrailStyle === "vivid"}
              onclick={() => setTrailStyle("vivid")}
              type="button"
            >
              Vivid
            </button>
          </div>

          {#if showBothEndsToggle}
            <button
              class="ends-toggle"
              class:active={isBothEnds}
              onclick={toggleBothEnds}
              type="button"
            >
              <i class="fas fa-{isBothEnds ? 'arrows-alt-h' : 'arrow-right'}" aria-hidden="true"></i>
              {isBothEnds ? "Both Ends" : "One End"}
            </button>
          {/if}
        </section>
      </div>
    {/if}
  </div>
</div>

<style>
  .futuristic-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 100%;
    padding: 12px;
    container-type: inline-size;
    container-name: settings-panel;
  }

  /* ===========================
     MODE SWITCHER - Animated Pill
     =========================== */
  .mode-switcher {
    width: 100%;
  }

  .switcher-track {
    position: relative;
    display: flex;
    gap: 4px;
    padding: 4px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.03) 0%,
      rgba(255, 255, 255, 0.01) 100%
    );
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    backdrop-filter: blur(8px);
  }

  .switcher-pill {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.4) 0%,
      rgba(168, 85, 247, 0.3) 50%,
      rgba(217, 70, 239, 0.25) 100%
    );
    border: 1px solid rgba(168, 85, 247, 0.5);
    border-radius: 12px;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow:
      0 0 20px rgba(168, 85, 247, 0.4),
      inset 0 1px 1px rgba(255, 255, 255, 0.15);
    pointer-events: none;
  }

  .switcher-pill.visual {
    transform: translateX(calc(100% + 4px));
  }

  .switcher-btn {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 10px 16px;
    background: transparent;
    border: none;
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.3s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .switcher-btn i {
    font-size: 0.85rem;
    transition: transform 0.3s ease;
  }

  .switcher-btn.active {
    color: rgba(255, 255, 255, 0.95);
  }

  .switcher-btn.active i {
    transform: scale(1.1);
  }

  @media (hover: hover) and (pointer: fine) {
    .switcher-btn:hover:not(.active) {
      color: rgba(255, 255, 255, 0.7);
    }
  }

  /* ===========================
     SETTINGS CONTENT
     =========================== */
  .settings-content {
    position: relative;
    min-height: 200px;
  }

  .settings-pane {
    display: flex;
    flex-direction: column;
    gap: 16px;
    animation: fadeSlideIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .group-header {
    display: flex;
    align-items: center;
  }

  .group-label {
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: rgba(255, 255, 255, 0.4);
  }

  /* ===========================
     PLAYBACK - STYLE TOGGLE
     =========================== */
  .style-toggle {
    display: flex;
    gap: 8px;
  }

  .style-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .style-btn i {
    font-size: 0.9rem;
  }

  .style-btn.active {
    background: linear-gradient(
      135deg,
      rgba(251, 191, 36, 0.2) 0%,
      rgba(245, 158, 11, 0.15) 100%
    );
    border-color: rgba(251, 191, 36, 0.5);
    color: rgba(253, 230, 138, 1);
    box-shadow: 0 0 16px rgba(251, 191, 36, 0.25);
  }

  @media (hover: hover) and (pointer: fine) {
    .style-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.85);
    }
  }

  .step-size-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: rgba(251, 191, 36, 0.08);
    border: 1px solid rgba(251, 191, 36, 0.2);
    border-radius: 10px;
    animation: fadeSlideIn 0.3s ease;
  }

  .step-label {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgba(253, 230, 138, 0.8);
    white-space: nowrap;
  }

  .step-chips {
    display: flex;
    gap: 6px;
    flex: 1;
  }

  .step-chip {
    flex: 1;
    min-height: 40px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .step-chip.active {
    background: rgba(251, 191, 36, 0.25);
    border-color: rgba(251, 191, 36, 0.5);
    color: rgba(253, 230, 138, 1);
  }

  /* ===========================
     PLAYBACK - BPM CONTROL
     =========================== */
  .bpm-control {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .bpm-adjuster {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }

  .bpm-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.04);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .bpm-btn:hover:not(:disabled) {
    background: rgba(139, 92, 246, 0.15);
    border-color: rgba(139, 92, 246, 0.4);
    color: rgba(196, 181, 253, 1);
    transform: scale(1.05);
  }

  .bpm-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .bpm-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-width: 90px;
    padding: 12px 24px;
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.2) 0%,
      rgba(168, 85, 247, 0.15) 100%
    );
    border: 1.5px solid rgba(139, 92, 246, 0.4);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow:
      0 0 24px rgba(139, 92, 246, 0.2),
      inset 0 1px 1px rgba(255, 255, 255, 0.1);
  }

  .bpm-display:hover {
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.25) 0%,
      rgba(168, 85, 247, 0.2) 100%
    );
    border-color: rgba(168, 85, 247, 0.5);
    transform: scale(1.02);
  }

  .bpm-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.95);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  .bpm-unit {
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: rgba(196, 181, 253, 0.8);
    margin-top: 4px;
  }

  .bpm-presets {
    display: flex;
    gap: 6px;
  }

  .preset-chip {
    flex: 1;
    min-height: 44px;
    padding: 10px 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .preset-chip.active {
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.25) 0%,
      rgba(168, 85, 247, 0.2) 100%
    );
    border-color: rgba(139, 92, 246, 0.5);
    color: rgba(255, 255, 255, 0.95);
    box-shadow: 0 0 16px rgba(139, 92, 246, 0.25);
  }

  @media (hover: hover) and (pointer: fine) {
    .preset-chip:hover:not(.active) {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.85);
    }
  }

  /* ===========================
     VISUAL - MOTION TOGGLES
     =========================== */
  .motion-toggles {
    display: flex;
    gap: 8px;
  }

  .motion-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.03);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .motion-btn.blue.active {
    background: rgba(59, 130, 246, 0.18);
    border-color: rgba(59, 130, 246, 0.4);
    color: rgba(147, 197, 253, 1);
  }

  .motion-btn.red.active {
    background: rgba(239, 68, 68, 0.18);
    border-color: rgba(239, 68, 68, 0.4);
    color: rgba(252, 165, 165, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    .motion-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.75);
    }
  }

  /* ===========================
     VISUAL - ELEMENT GRID
     =========================== */
  .element-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  @container settings-panel (min-width: 400px) {
    .element-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .element-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 60px;
    padding: 12px 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.25s ease;
  }

  .element-btn i {
    font-size: 1rem;
    transition: transform 0.2s ease;
  }

  .element-btn.active i {
    transform: scale(1.1);
  }

  /* Grid - Cyan (no glow) */
  .element-btn.grid-el.active {
    background: rgba(20, 184, 166, 0.15);
    border-color: rgba(20, 184, 166, 0.4);
    color: rgba(94, 234, 212, 1);
  }

  /* Props - Orange (no glow) */
  .element-btn.props-el.active {
    background: rgba(249, 115, 22, 0.15);
    border-color: rgba(249, 115, 22, 0.4);
    color: rgba(253, 186, 116, 1);
  }

  /* Beat # - Yellow (no glow) */
  .element-btn.beat-el.active {
    background: rgba(234, 179, 8, 0.15);
    border-color: rgba(234, 179, 8, 0.4);
    color: rgba(253, 224, 71, 1);
  }

  /* Glyph - Purple (no glow) */
  .element-btn.glyph-el.active {
    background: rgba(168, 85, 247, 0.15);
    border-color: rgba(168, 85, 247, 0.4);
    color: rgba(216, 180, 254, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    .element-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.75);
    }
  }

  /* ===========================
     VISUAL - TRAIL PRESETS
     =========================== */
  .trail-presets {
    display: flex;
    gap: 8px;
  }

  .trail-btn {
    flex: 1;
    min-height: 44px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  /* Off - Gray */
  .trail-btn.off.active {
    background: rgba(107, 114, 128, 0.15);
    border-color: rgba(107, 114, 128, 0.4);
    color: rgba(209, 213, 219, 1);
  }

  /* Subtle - Sky Blue */
  .trail-btn.subtle.active {
    background: rgba(56, 189, 248, 0.15);
    border-color: rgba(56, 189, 248, 0.4);
    color: rgba(186, 230, 253, 1);
  }

  /* Vivid - Amber/Fire */
  .trail-btn.vivid.active {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.4);
    color: rgba(253, 230, 138, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    .trail-btn:hover:not(.active) {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.85);
    }
  }

  /* ===========================
     VISUAL - ENDS TOGGLE
     =========================== */
  .ends-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
    padding: 8px 16px;
    margin-top: 4px;
    background: rgba(255, 255, 255, 0.03);
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    animation: fadeSlideIn 0.3s ease;
  }

  .ends-toggle.active {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%);
    border-color: rgba(139, 92, 246, 0.5);
    color: rgba(196, 181, 253, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    .ends-toggle:hover:not(.active) {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.15);
      color: rgba(255, 255, 255, 0.85);
    }
  }

  /* ===========================
     ACCESSIBILITY
     =========================== */
  @media (prefers-reduced-motion: reduce) {
    .switcher-pill,
    .settings-pane,
    .step-size-row,
    .ends-toggle {
      animation: none;
      transition: none;
    }
  }
</style>
