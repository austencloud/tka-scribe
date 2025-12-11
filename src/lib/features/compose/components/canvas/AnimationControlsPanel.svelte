<!--
  AnimationControlsPanel.svelte

  2026 Bento Box Design - Unified controls panel
  - Speed controls and play/pause
  - Motion visibility buttons
  - Trail settings
  - Export actions

  Organizes all controls in a clean grid layout.
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import BpmChips from "../controls/BpmChips.svelte";
  import SimpleTrailControls from "../trail/SimpleTrailControls.svelte";
  import ExpandToggleButton from "../inputs/ExpandToggleButton.svelte";
  import ExportActionsPanel from "./ExportActionsPanel.svelte";
  import MobileToolViewToggle from "../inputs/MobileToolViewToggle.svelte";
  import AnimationBeatGrid from "$lib/shared/animation-engine/components/AnimationBeatGrid.svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import {
    animationSettings,
    TrailMode,
  } from "$lib/shared/animation-engine/state/animation-settings-state.svelte";

  type MobileToolView = "controls" | "beat-grid";

  const debug = createComponentLogger("AnimationControlsPanel");
  const DEFAULT_BPM = 60;
  const COMPACT_CONTROLS_HEIGHT = 800; // Use compact controls below this height

  let {
    speed = 1,
    isPlaying = false,
    blueMotionVisible = true,
    redMotionVisible = true,
    isSideBySideLayout = false,
    isExpanded = false,
    scrollContainerRef = $bindable(null),
    isExporting = false,
    exportProgress = null,
    // Mobile tool view props
    mobileToolView = "controls" as MobileToolView,
    sequenceData = null,
    currentBeat = 0,
    onSpeedChange = () => {},
    onPlaybackStart = () => {},
    onPlaybackToggle = () => {},
    onStepHalfBeatBackward = () => {},
    onStepHalfBeatForward = () => {},
    onStepFullBeatBackward = () => {},
    onStepFullBeatForward = () => {},
    onToggleBlue = () => {},
    onToggleRed = () => {},
    onToggleExpanded = () => {},
    onToggleToolView = () => {},
    onExportVideo = () => {},
    isCircular = false,
    loopCount = 1,
    onLoopCountChange = () => {},
    preventBackNavAction = () => {},
    onScroll = () => {},
  }: {
    speed?: number;
    isPlaying?: boolean;
    blueMotionVisible?: boolean;
    redMotionVisible?: boolean;
    isSideBySideLayout?: boolean;
    isExpanded?: boolean;
    scrollContainerRef?: HTMLDivElement | null;
    isExporting?: boolean;
    exportProgress?: { progress: number; stage: string } | null;
    // Mobile tool view props
    mobileToolView?: MobileToolView;
    sequenceData?: SequenceData | null;
    currentBeat?: number;
    onSpeedChange?: (newSpeed: number) => void;
    onPlaybackStart?: () => void;
    onPlaybackToggle?: () => void;
    onStepHalfBeatBackward?: () => void;
    onStepHalfBeatForward?: () => void;
    onStepFullBeatBackward?: () => void;
    onStepFullBeatForward?: () => void;
    onToggleBlue?: () => void;
    onToggleRed?: () => void;
    onToggleExpanded?: () => void;
    onToggleToolView?: () => void;
    onExportVideo?: () => void;
    isCircular?: boolean;
    loopCount?: number;
    onLoopCountChange?: (count: number) => void;
    preventBackNavAction?: (
      node: HTMLElement,
      isSideBySideLayout: boolean
    ) => any;
    onScroll?: (e: Event) => void;
  } = $props();

  debug.log("Received onExportVideo:", onExportVideo);

  // Convert speed multiplier to BPM for display
  let bpm = $state(Math.round(speed * DEFAULT_BPM));

  // Sync BPM when speed changes
  $effect(() => {
    bpm = Math.round(speed * DEFAULT_BPM);
  });

  // Handle BPM changes and convert back to speed multiplier
  function handleBpmChange(newBpm: number) {
    const newSpeed = newBpm / DEFAULT_BPM;
    onSpeedChange(newSpeed);
  }

  // Height detection for compact controls mode
  let viewportHeight = $state(0);

  onMount(() => {
    if (!browser) return;

    const checkHeight = () => {
      viewportHeight = window.innerHeight;
    };

    checkHeight();
    window.addEventListener("resize", checkHeight);
    return () => window.removeEventListener("resize", checkHeight);
  });

  // Use compact controls when viewport is too short (regardless of side-by-side)
  const useCompactControls = $derived(viewportHeight > 0 && viewportHeight < COMPACT_CONTROLS_HEIGHT);

  // Sheet state - unified settings sheet
  let isSettingsSheetOpen = $state(false);

  // Derive current trail preset for display
  const currentTrailPreset = $derived.by(() => {
    const trail = animationSettings.trail;
    if (!trail.enabled || trail.mode === TrailMode.OFF) return "Off";
    if (trail.lineWidth <= 2.5 && trail.maxOpacity <= 0.7) return "Subtle";
    return "Vivid";
  });

  // Get propType from sequence data for bilateral toggle
  // Priority: sequence.propType > first beat's blue motion propType > first beat's red motion propType
  const currentPropType = $derived.by(() => {
    if (sequenceData?.propType) return sequenceData.propType;
    const firstBeat = sequenceData?.beats?.[0];
    if (firstBeat?.motions?.blue?.propType) return firstBeat.motions.blue.propType;
    if (firstBeat?.motions?.red?.propType) return firstBeat.motions.red.propType;
    return null;
  });

</script>

<div
  class="controls-panel"
  class:mobile-compact={!isExpanded && !isSideBySideLayout}
  class:mobile-expanded={isExpanded && !isSideBySideLayout}
  class:desktop={isSideBySideLayout}
  bind:this={scrollContainerRef}
  use:preventBackNavAction={isSideBySideLayout}
  onscroll={onScroll}
>
  <!-- Compact Mode: View Toggle (left) + Play (center) + Expand Toggle (right) -->
  {#if !isSideBySideLayout && !isExpanded}
    <div class="control-row compact-row">
      <!-- Left: View Toggle -->
      <MobileToolViewToggle
        activeView={mobileToolView}
        onToggle={onToggleToolView}
      />

      <!-- Center: Play button -->
      <button
        class="play-pause-btn center-play"
        class:playing={isPlaying}
        onclick={onPlaybackToggle}
        aria-label={isPlaying ? "Pause animation" : "Play animation"}
        type="button"
      >
        <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"></i>
      </button>

      <!-- Right: Expand Toggle -->
      <ExpandToggleButton {isExpanded} onToggle={onToggleExpanded} />
    </div>

    <!-- Tool Area: Beat Grid or Quick Presets based on view -->
    {#if mobileToolView === "beat-grid"}
      <div class="beat-grid-area">
        <AnimationBeatGrid
          {sequenceData}
          {currentBeat}
          {isPlaying}
        />
      </div>
    {:else}
      <div class="control-row quick-presets-row">
        <div class="quick-presets">
          {#each [30, 60, 90, 120] as presetBpm}
            <button
              class="quick-preset-btn"
              class:active={bpm === presetBpm}
              onclick={() => handleBpmChange(presetBpm)}
              type="button"
              aria-label="Set BPM to {presetBpm}"
            >
              {presetBpm}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  {/if}

  <!-- Expanded Mode: Playback controls centered -->
  {#if isSideBySideLayout || isExpanded}
    <div class="control-row playback-row">
      <!-- Center transport controls -->
      <div class="transport-controls">
        <!-- Full Beat Back -->
        <button
          class="step-btn step-full"
          onclick={onStepFullBeatBackward}
          disabled={isPlaying}
          type="button"
          aria-label="Previous full beat"
        >
          <i class="fas fa-angles-left" aria-hidden="true"></i>
        </button>

        <!-- Half Beat Back -->
        <button
          class="step-btn step-half"
          onclick={onStepHalfBeatBackward}
          disabled={isPlaying}
          type="button"
          aria-label="Previous half beat"
        >
          <i class="fas fa-chevron-left" aria-hidden="true"></i>
        </button>

        <!-- Play/Pause -->
        <button
          class="play-pause-btn large"
          class:playing={isPlaying}
          onclick={onPlaybackToggle}
          aria-label={isPlaying ? "Pause animation" : "Play animation"}
          type="button"
        >
          <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"></i>
        </button>

        <!-- Half Beat Forward -->
        <button
          class="step-btn step-half"
          onclick={onStepHalfBeatForward}
          disabled={isPlaying}
          type="button"
          aria-label="Next half beat"
        >
          <i class="fas fa-chevron-right" aria-hidden="true"></i>
        </button>

        <!-- Full Beat Forward -->
        <button
          class="step-btn step-full"
          onclick={onStepFullBeatForward}
          disabled={isPlaying}
          type="button"
          aria-label="Next full beat"
        >
          <i class="fas fa-angles-right" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  {/if}

  <!-- BPM & Visibility/Trails -->
  {#if isSideBySideLayout || isExpanded}
    {#if useCompactControls}
      <!-- Compact mode: Single settings button opens unified sheet -->
      <div class="control-row compact-row-settings">
        <button
          class="settings-sheet-btn"
          onclick={() => (isSettingsSheetOpen = true)}
          type="button"
          aria-label="Open playback settings"
        >
          <i class="fas fa-sliders-h" aria-hidden="true"></i>
          <span class="settings-btn-label">Settings</span>
          <span class="settings-summary">{bpm} BPM · {currentTrailPreset}</span>
        </button>
      </div>
    {:else}
      <!-- Full controls: Enough vertical space -->
      <div class="control-row bpm-row">
        <BpmChips
          bind:bpm
          min={15}
          max={180}
          step={1}
          onBpmChange={handleBpmChange}
        />
      </div>
      <!-- Visibility & Trails Row: [Blue Eye] [Trails] [Red Eye] -->
      <div class="control-row trails-row">
        <button
          class="vis-btn blue-vis-btn"
          class:active={blueMotionVisible}
          onclick={onToggleBlue}
          type="button"
          aria-label={blueMotionVisible ? "Hide blue motion" : "Show blue motion"}
        >
          <i class="fas {blueMotionVisible ? 'fa-eye' : 'fa-eye-slash'}" aria-hidden="true"></i>
        </button>

        <SimpleTrailControls propType={currentPropType} />

        <button
          class="vis-btn red-vis-btn"
          class:active={redMotionVisible}
          onclick={onToggleRed}
          type="button"
          aria-label={redMotionVisible ? "Hide red motion" : "Show red motion"}
        >
          <i class="fas {redMotionVisible ? 'fa-eye' : 'fa-eye-slash'}" aria-hidden="true"></i>
        </button>
      </div>
    {/if}
  {/if}

  <!-- Export -->
  {#if isSideBySideLayout || isExpanded}
    <ExportActionsPanel {onExportVideo} {isExporting} {exportProgress} {isCircular} {loopCount} {onLoopCountChange} />
  {/if}
</div>

<!-- Unified Settings Sheet - Right side panel -->
<Drawer
  bind:isOpen={isSettingsSheetOpen}
  placement="right"
  closeOnBackdrop={true}
  closeOnEscape={true}
  ariaLabel="Playback Settings"
  showHandle={true}
  class="settings-sheet"
>
    <div class="sheet-content">
    <header class="sheet-header">
      <h3 class="sheet-title">Playback Settings</h3>
      <button
        class="sheet-close-btn"
        onclick={() => (isSettingsSheetOpen = false)}
        aria-label="Close"
        type="button"
      >
        <i class="fas fa-times"></i>
      </button>
    </header>
    <div class="sheet-body">
      <!-- Motion Visibility -->
      <section class="settings-section">
        <h4 class="settings-section-title">Motion Visibility</h4>
        <div class="visibility-toggles">
          <button
            class="visibility-toggle blue"
            class:active={blueMotionVisible}
            onclick={onToggleBlue}
            type="button"
          >
            <i class="fas {blueMotionVisible ? 'fa-eye' : 'fa-eye-slash'}" aria-hidden="true"></i>
            <span>Blue</span>
          </button>
          <button
            class="visibility-toggle red"
            class:active={redMotionVisible}
            onclick={onToggleRed}
            type="button"
          >
            <i class="fas {redMotionVisible ? 'fa-eye' : 'fa-eye-slash'}" aria-hidden="true"></i>
            <span>Red</span>
          </button>
        </div>
      </section>

      <!-- Speed -->
      <section class="settings-section">
        <h4 class="settings-section-title">Speed</h4>
        <BpmChips
          bind:bpm
          min={15}
          max={180}
          step={1}
          onBpmChange={handleBpmChange}
        />
      </section>

      <!-- Trails -->
      <section class="settings-section">
        <h4 class="settings-section-title">Trails</h4>
        <SimpleTrailControls propType={currentPropType} />
      </section>
    </div>
  </div>
</Drawer>

<style>
  /* ===========================
     2026 BENTO BOX DESIGN
     Controls Panel Container
     =========================== */

  .controls-panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    flex: 0 0 auto;
    gap: 10px;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 12px;
    background: linear-gradient(
      145deg,
      rgba(15, 15, 20, 0.95) 0%,
      rgba(10, 10, 15, 0.98) 100%
    );
    border: 1.5px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    backdrop-filter: blur(16px);
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    -webkit-overflow-scrolling: touch;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Mobile Compact Mode - No scrolling, only primary row visible */
  .controls-panel.mobile-compact {
    overflow-y: hidden !important;
    overflow-x: hidden;
    flex: 0 0 auto;
    max-height: none;
    padding: 10px;
    gap: 0;
  }

  /* Mobile Expanded Mode - Scrollable with all controls visible */
  .controls-panel.mobile-expanded {
    overflow-y: auto !important;
    overflow-x: hidden;
    overscroll-behavior: contain;
    flex: 1 1 0;
    min-height: 0;
    max-height: none;
    padding: 12px;
    gap: 10px;
  }

  /* Desktop Mode - Fixed, no scrolling */
  .controls-panel.desktop {
    overflow-y: hidden !important;
    overflow-x: hidden;
    flex: 0 0 auto;
    padding: 14px;
    gap: 12px;
  }

  /* Custom scrollbar */
  .controls-panel::-webkit-scrollbar {
    width: 6px;
  }

  .controls-panel::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .controls-panel::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }

  .controls-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* ===========================
     CONTROL ROWS
     =========================== */

  .control-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Compact mode row - new layout: toggle (left), play (center), expand (right) */
  .compact-row {
    flex-wrap: nowrap;
    justify-content: space-between;
    position: relative;
  }

  .compact-row .center-play {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  /* Quick presets row (when in controls view) */
  .quick-presets-row {
    justify-content: center;
  }

  /* Beat grid area (when in beat-grid view) */
  .beat-grid-area {
    min-height: 100px;
    max-height: 160px;
    overflow: hidden;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.2);
  }

  /* Expanded mode rows */
  .playback-row {
    justify-content: center;
    gap: 12px;
  }

  /* Transport controls - centered group */
  .transport-controls {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Step buttons */
  .step-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
  }

  /* Full beat step buttons - slightly more prominent */
  .step-btn.step-full {
    width: 40px;
    height: 40px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
  }

  @media (hover: hover) and (pointer: fine) {
    .step-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
      color: rgba(255, 255, 255, 0.9);
      transform: scale(1.05);
    }
  }

  .step-btn:active:not(:disabled) {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.15);
  }

  .step-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .bpm-row {
    width: 100%;
  }

  .trails-row {
    width: 100%;
    justify-content: space-between;
    gap: 8px;
  }

  .trails-row :global(.trail-controls) {
    flex: 1;
    min-width: 0;
  }

  /* Compact mode: Settings button row */
  .compact-row-settings {
    width: 100%;
  }

  .settings-sheet-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
  }

  .settings-sheet-btn i {
    font-size: 1rem;
    color: rgba(139, 92, 246, 0.8);
  }

  .settings-sheet-btn .settings-btn-label {
    flex: 0 0 auto;
  }

  .settings-sheet-btn .settings-summary {
    flex: 1;
    text-align: right;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 500;
  }

  @media (hover: hover) and (pointer: fine) {
    .settings-sheet-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.18);
    }
  }

  .settings-sheet-btn:active {
    transform: scale(0.98);
  }

  /* Sheet Styles */
  :global(.settings-sheet) {
    --sheet-width: min(320px, 85vw);
  }

  /* Position settings sheet to not overlap bottom navigation */
  :global(.drawer-content.settings-sheet) {
    /* Leave space for bottom navigation (64px + safe area) */
    bottom: calc(64px + env(safe-area-inset-bottom, 0px)) !important;
    /* Limit height to available space */
    max-height: calc(100dvh - 64px - env(safe-area-inset-bottom, 0px)) !important;
    /* Rounded bottom corners since it's not touching bottom of screen */
    border-radius: 16px 0 0 16px !important;
  }

  .sheet-content {
    display: flex;
    flex-direction: column;
    padding: 20px;
    padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
    min-width: 280px;
    height: 100%;
  }

  .sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    margin-bottom: 20px;
  }

  .sheet-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .sheet-close-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .sheet-close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .sheet-body {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* Settings sections */
  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .settings-section-title {
    font-size: 0.7rem;
    font-weight: 700;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0;
  }

  /* Visibility toggles in sheet */
  .visibility-toggles {
    display: flex;
    gap: 8px;
  }

  .visibility-toggle {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 48px;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.04);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .visibility-toggle.blue.active {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%);
    border-color: rgba(59, 130, 246, 0.4);
    color: rgba(191, 219, 254, 1);
  }

  .visibility-toggle.red.active {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%);
    border-color: rgba(239, 68, 68, 0.4);
    color: rgba(254, 202, 202, 1);
  }

  .visibility-toggle:active {
    transform: scale(0.97);
  }

  /* Visibility Buttons */
  .vis-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 52px;
    min-width: 52px;
    width: 52px;
    padding: 0;
    background: rgba(255, 255, 255, 0.04);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.4);
    font-size: 17px;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.03);
    flex-shrink: 0;
  }

  @media (hover: hover) and (pointer: fine) {
    .vis-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(255, 255, 255, 0.18);
      color: rgba(255, 255, 255, 0.6);
      transform: translateY(-1px);
    }
  }

  .vis-btn:active {
    transform: scale(0.97);
  }

  .vis-btn.active.blue-vis-btn {
    background: linear-gradient(
      135deg,
      rgba(59, 130, 246, 0.25) 0%,
      rgba(37, 99, 235, 0.2) 100%
    );
    border-color: rgba(59, 130, 246, 0.5);
    color: rgba(191, 219, 254, 1);
    box-shadow:
      0 2px 12px rgba(59, 130, 246, 0.2),
      0 0 16px rgba(59, 130, 246, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .vis-btn.active.red-vis-btn {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.25) 0%,
      rgba(220, 38, 38, 0.2) 100%
    );
    border-color: rgba(239, 68, 68, 0.5);
    color: rgba(254, 202, 202, 1);
    box-shadow:
      0 2px 12px rgba(239, 68, 68, 0.2),
      0 0 16px rgba(239, 68, 68, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* Play/Pause Button */
  .play-pause-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    flex-shrink: 0;
    background: linear-gradient(
      135deg,
      rgba(34, 197, 94, 0.25) 0%,
      rgba(22, 163, 74, 0.2) 100%
    );
    border: 1.5px solid rgba(34, 197, 94, 0.4);
    border-radius: 50%;
    color: rgba(134, 239, 172, 1);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow:
      0 2px 8px rgba(34, 197, 94, 0.15),
      0 0 16px rgba(34, 197, 94, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    -webkit-tap-highlight-color: transparent;
    font-size: 16px;
  }

  .play-pause-btn.playing {
    background: linear-gradient(
      135deg,
      rgba(239, 68, 68, 0.25) 0%,
      rgba(220, 38, 38, 0.2) 100%
    );
    border-color: rgba(239, 68, 68, 0.4);
    color: rgba(254, 202, 202, 1);
    box-shadow:
      0 2px 8px rgba(239, 68, 68, 0.15),
      0 0 16px rgba(239, 68, 68, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  @media (hover: hover) and (pointer: fine) {
    .play-pause-btn:hover {
      transform: scale(1.05);
      background: linear-gradient(
        135deg,
        rgba(34, 197, 94, 0.35) 0%,
        rgba(22, 163, 74, 0.3) 100%
      );
      border-color: rgba(34, 197, 94, 0.6);
      box-shadow:
        0 4px 14px rgba(34, 197, 94, 0.25),
        0 0 20px rgba(34, 197, 94, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }

    .play-pause-btn.playing:hover {
      background: linear-gradient(
        135deg,
        rgba(239, 68, 68, 0.35) 0%,
        rgba(220, 38, 38, 0.3) 100%
      );
      border-color: rgba(239, 68, 68, 0.6);
      box-shadow:
        0 4px 14px rgba(239, 68, 68, 0.25),
        0 0 20px rgba(239, 68, 68, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.12);
    }
  }

  .play-pause-btn:active {
    transform: scale(0.96);
  }

  /* Larger play button in expanded mode */
  .play-pause-btn.large {
    width: 52px;
    height: 52px;
    font-size: 18px;
  }

  /* Expand toggle in expanded mode */
  .playback-row > :global(.expand-toggle-btn) {
    flex: 0 0 auto;
    width: 52px;
    min-width: 52px;
    margin-left: auto;
  }

  /* Quick BPM Presets (Mobile Compact) */
  .quick-presets {
    display: flex;
    gap: 6px;
    flex: 1;
    min-width: 0;
  }

  .quick-preset-btn {
    flex: 1;
    min-width: 0;
    min-height: 52px;
    padding: 10px 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1.5px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.7);
    font-size: clamp(0.75rem, 2.5vw, 0.85rem);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    font-variant-numeric: tabular-nums;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  @media (hover: hover) and (pointer: fine) {
    .quick-preset-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.18);
      color: rgba(255, 255, 255, 0.85);
      transform: translateY(-1px);
      box-shadow:
        0 2px 8px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
    }
  }

  .quick-preset-btn:active {
    transform: scale(0.97);
  }

  .quick-preset-btn.active {
    background: linear-gradient(
      135deg,
      rgba(139, 92, 246, 0.3) 0%,
      rgba(124, 58, 237, 0.25) 100%
    );
    border-color: rgba(139, 92, 246, 0.5);
    color: rgba(255, 255, 255, 1);
    box-shadow:
      0 0 20px rgba(139, 92, 246, 0.25),
      0 2px 8px rgba(139, 92, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  /* ===========================
     RESPONSIVE
     =========================== */

  @media (max-width: 480px) {
    .controls-panel {
      padding: 10px;
      gap: 10px;
    }

    .control-row {
      gap: 8px;
    }
  }

  /* Landscape mobile - compact layout */
  @media (max-height: 500px) and (orientation: landscape) {
    .controls-panel {
      padding: 10px;
      gap: 8px;
    }
  }
</style>
