<!--
  SettingsTogglePanel.svelte

  Toggle between Visual and Playback settings displayed inline.
  - Visual: Motion visibility, Elements, Trails
  - Playback: Mode (continuous/step), Step settings, BPM/Speed
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
  import BpmChips from "./BpmChips.svelte";
  import PlaybackModeToggle from "./PlaybackModeToggle.svelte";
  import StepModeSettings from "./StepModeSettings.svelte";
  import type {
    PlaybackMode,
    StepPlaybackStepSize,
  } from "../../state/animation-panel-state.svelte";

  type SettingsMode = "visual" | "playback";

  let {
    propType = null,
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
    bpm: number;
    playbackMode?: PlaybackMode;
    stepPlaybackStepSize?: StepPlaybackStepSize;
    isPlaying?: boolean;
    onBpmChange?: (bpm: number) => void;
    onPlaybackModeChange?: (mode: PlaybackMode) => void;
    onStepPlaybackStepSizeChange?: (stepSize: StepPlaybackStepSize) => void;
    onPlaybackToggle?: () => void;
  } = $props();

  // Active settings mode
  let activeMode = $state<SettingsMode>("visual");

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
    const isBilateral = propType != null && isBilateralProp(propType);
    return isBilateral && currentTrailStyle !== "off";
  });

  const isBothEnds = $derived(
    animationSettings.trail.trackingMode === TrackingMode.BOTH_ENDS
  );

  // Visibility getters
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

  // Toggle handlers
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

  // Trail style handlers
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
</script>

<div class="settings-toggle-panel">
  <!-- Mode Toggle -->
  <div class="mode-toggle-row">
    <button
      class="mode-btn"
      class:active={activeMode === "visual"}
      onclick={() => (activeMode = "visual")}
      type="button"
      aria-pressed={activeMode === "visual"}
    >
      <i class="fas fa-eye" aria-hidden="true"></i>
      <span>Visual</span>
    </button>
    <button
      class="mode-btn"
      class:active={activeMode === "playback"}
      onclick={() => (activeMode = "playback")}
      type="button"
      aria-pressed={activeMode === "playback"}
    >
      <i class="fas fa-sliders-h" aria-hidden="true"></i>
      <span>Playback</span>
    </button>
  </div>

  <!-- Settings Content -->
  <div class="settings-content">
    {#if activeMode === "visual"}
      <!-- Visual Settings -->
      <section class="settings-section">
        <h4 class="section-title">Motion</h4>
        <div class="button-row">
          <button
            class="chip-btn blue"
            class:active={getBlueMotion()}
            onclick={toggleBlueMotion}
            type="button"
          >
            Blue
          </button>
          <button
            class="chip-btn red"
            class:active={getRedMotion()}
            onclick={toggleRedMotion}
            type="button"
          >
            Red
          </button>
        </div>
      </section>

      <section class="settings-section">
        <h4 class="section-title">Elements</h4>
        <div class="button-grid">
          <button
            class="chip-btn grid-btn"
            class:active={getGridEnabled()}
            onclick={toggleGrid}
            type="button"
          >
            Grid
          </button>
          <button
            class="chip-btn props-btn"
            class:active={getProps()}
            onclick={toggleProps}
            type="button"
          >
            Props
          </button>
          <button
            class="chip-btn beat-btn"
            class:active={getBeatNumbers()}
            onclick={toggleBeatNumbers}
            type="button"
          >
            Beat #
          </button>
          <button
            class="chip-btn glyph-btn"
            class:active={getTkaGlyph()}
            onclick={toggleTkaGlyph}
            type="button"
            title="TKA Glyph includes turn numbers"
          >
            Glyph
          </button>
        </div>
      </section>

      <section class="settings-section">
        <h4 class="section-title">Trails</h4>
        <div class="button-row trails-row">
          <button
            class="chip-btn trail-off"
            class:active={currentTrailStyle === "off"}
            onclick={() => setTrailStyle("off")}
            type="button"
          >
            Off
          </button>
          <button
            class="chip-btn trail-subtle"
            class:active={currentTrailStyle === "subtle"}
            onclick={() => setTrailStyle("subtle")}
            type="button"
          >
            Subtle
          </button>
          <button
            class="chip-btn trail-vivid"
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
            {isBothEnds ? "Both Ends" : "One End"}
          </button>
        {/if}
      </section>
    {:else}
      <!-- Playback Settings -->
      <section class="settings-section">
        <h4 class="section-title">Playback Mode</h4>
        <PlaybackModeToggle
          {playbackMode}
          {isPlaying}
          onPlaybackModeChange={onPlaybackModeChange}
          onPlaybackToggle={onPlaybackToggle}
        />
      </section>

      {#if playbackMode === "step"}
        <section class="settings-section">
          <StepModeSettings
            {stepPlaybackStepSize}
            onStepPlaybackStepSizeChange={onStepPlaybackStepSizeChange}
          />
        </section>
      {/if}

      <section class="settings-section">
        <h4 class="section-title">Speed</h4>
        <BpmChips bind:bpm min={15} max={180} step={1} {onBpmChange} />
      </section>
    {/if}
  </div>
</div>

<style>
  .settings-toggle-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 100%;
  }

  /* Mode Toggle Row */
  .mode-toggle-row {
    display: flex;
    gap: 6px;
    width: 100%;
  }

  .mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: var(--touch-target-min, 44px);
    padding: 8px 12px;
    background: var(--theme-card-bg);
    border: 1.5px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 10px;
    color: var(--theme-text-dim, var(--theme-text-dim));
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  .mode-btn i {
    font-size: var(--font-size-compact);
    flex-shrink: 0;
  }

  .mode-btn span {
    white-space: nowrap;
  }

  .mode-btn.active {
    background: var(--semantic-warning-bg);
    border-color: var(--semantic-warning-border);
    color: var(--semantic-warning-text-vivid);
    box-shadow:
      0 0 12px var(--semantic-warning-glow),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .mode-btn.active i {
    color: var(--semantic-warning-text);
  }

  @media (hover: hover) and (pointer: fine) {
    .mode-btn:hover:not(.active) {
      background: var(--theme-card-hover-bg);
      border-color: var(--theme-stroke-strong);
      color: var(--theme-text);
    }
  }

  .mode-btn:active {
    transform: scale(0.98);
  }

  /* Settings Content */
  .settings-content {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-title {
    font-size: 0.7rem;
    font-weight: 700;
    color: var(--theme-text-dim, var(--theme-text-dim));
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  /* Button containers */
  .button-row {
    display: flex;
    gap: 8px;
  }

  .button-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  .trails-row {
    gap: 6px;
  }

  /* Chip Buttons */
  .chip-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-height: 40px;
    padding: 8px 12px;
    background: var(--theme-card-bg);
    border: 1.5px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 10px;
    color: var(--theme-text-dim, var(--theme-text-dim));
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  /* Blue motion active */
  .chip-btn.blue.active {
    background: var(--prop-blue-bg);
    border-color: var(--prop-blue-border);
    color: var(--prop-blue-text);
  }

  /* Red motion active */
  .chip-btn.red.active {
    background: var(--prop-red-bg);
    border-color: var(--prop-red-border);
    color: var(--prop-red-text);
  }

  /* Grid - cyan accent */
  .chip-btn.grid-btn.active {
    background: var(--semantic-info-bg);
    border-color: var(--semantic-info-border);
    color: var(--semantic-info-text);
  }

  /* Props - orange accent */
  .chip-btn.props-btn.active {
    background: rgba(249, 115, 22, 0.2);
    border-color: rgba(249, 115, 22, 0.5);
    color: rgba(253, 186, 116, 1);
  }

  /* Beat numbers - yellow accent */
  .chip-btn.beat-btn.active {
    background: var(--semantic-warning-bg);
    border-color: var(--semantic-warning-border);
    color: var(--semantic-warning-text);
  }

  /* Glyph - purple accent */
  .chip-btn.glyph-btn.active {
    background: var(--theme-accent-bg);
    border-color: var(--theme-accent-border);
    color: var(--theme-accent-text);
  }

  /* Trail Off - gray accent */
  .chip-btn.trail-off.active {
    background: rgba(107, 114, 128, 0.2);
    border-color: rgba(107, 114, 128, 0.5);
    color: rgba(209, 213, 219, 1);
  }

  /* Trail Subtle - sky blue accent */
  .chip-btn.trail-subtle.active {
    background: var(--semantic-info-bg);
    border-color: var(--semantic-info-border);
    color: var(--semantic-info-text);
  }

  /* Trail Vivid - amber accent */
  .chip-btn.trail-vivid.active {
    background: var(--semantic-warning-bg);
    border-color: var(--semantic-warning-border);
    color: var(--semantic-warning-text);
  }

  /* Both Ends Toggle */
  .ends-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 36px;
    padding: 6px 12px;
    margin-top: 4px;
    background: var(--theme-card-bg);
    border: 1.5px solid var(--theme-stroke, var(--theme-stroke));
    border-radius: 8px;
    color: var(--theme-text-dim, var(--theme-text-dim));
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .ends-toggle.active {
    background: var(--theme-accent-bg);
    border-color: var(--theme-accent-border);
    color: var(--theme-accent-text);
  }

  @media (hover: hover) and (pointer: fine) {
    .chip-btn:hover:not(.active),
    .ends-toggle:hover:not(.active) {
      background: var(--theme-card-hover-bg);
      border-color: var(--theme-stroke-strong);
      color: var(--theme-text);
    }
  }

  .chip-btn:active,
  .ends-toggle:active {
    transform: scale(0.97);
  }

  /* Responsive */
  @media (max-width: 400px) {
    .button-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
