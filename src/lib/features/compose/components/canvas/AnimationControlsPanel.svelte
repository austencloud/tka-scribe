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
  import BpmControl from "../controls/BpmControl.svelte";
  import SimpleTrailControls from "../trail/SimpleTrailControls.svelte";
  import MotionVisibilityButtons from "../trail/MotionVisibilityButtons.svelte";
  import ExpandToggleButton from "../inputs/ExpandToggleButton.svelte";
  import ExportActionsPanel from "./ExportActionsPanel.svelte";
  import MobileToolViewToggle from "../inputs/MobileToolViewToggle.svelte";
  import AnimationBeatGrid from "$lib/shared/animation-engine/components/AnimationBeatGrid.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";

  type MobileToolView = "controls" | "beat-grid";

  const debug = createComponentLogger("AnimationControlsPanel");
  const DEFAULT_BPM = 60;

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
    onToggleBlue = () => {},
    onToggleRed = () => {},
    onToggleExpanded = () => {},
    onToggleToolView = () => {},
    onExportGif = () => {},
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
    onToggleBlue?: () => void;
    onToggleRed?: () => void;
    onToggleExpanded?: () => void;
    onToggleToolView?: () => void;
    onExportGif?: () => void;
    preventBackNavAction?: (
      node: HTMLElement,
      isSideBySideLayout: boolean
    ) => any;
    onScroll?: (e: Event) => void;
  } = $props();

  debug.log("Received onExportGif:", onExportGif);

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

  <!-- Expanded Mode: Separate rows for better hierarchy -->
  {#if isSideBySideLayout || isExpanded}
    <!-- Row 1: Play/Pause Button (Centered) -->
    <div class="control-row playback-row">
      <button
        class="play-pause-btn large"
        class:playing={isPlaying}
        onclick={onPlaybackToggle}
        aria-label={isPlaying ? "Pause animation" : "Play animation"}
        type="button"
      >
        <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"></i>
      </button>

      <!-- Expand/Collapse Toggle (Mobile Expanded only) -->
      {#if !isSideBySideLayout}
        <ExpandToggleButton {isExpanded} onToggle={onToggleExpanded} />
      {/if}
    </div>

    <!-- Row 2: Motion Visibility Controls -->
    <div class="control-row visibility-row">
      <MotionVisibilityButtons
        {blueMotionVisible}
        {redMotionVisible}
        {onToggleBlue}
        {onToggleRed}
      />
    </div>
  {/if}

  <!-- BPM Control Row (Hidden in compact mode on mobile) -->
  {#if isSideBySideLayout || isExpanded}
    <div class="control-row bpm-row">
      <BpmControl
        bind:bpm
        min={15}
        max={180}
        step={1}
        onBpmChange={handleBpmChange}
      />
    </div>
  {/if}

  <!-- Trail Settings (Hidden in compact mode on mobile) -->
  {#if isSideBySideLayout || isExpanded}
    <SimpleTrailControls />
  {/if}

  <!-- Export (Hidden in compact mode on mobile) -->
  {#if isSideBySideLayout || isExpanded}
    <ExportActionsPanel {onExportGif} {isExporting} {exportProgress} />
  {/if}
</div>

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

  .visibility-row {
    justify-content: center;
  }

  .bpm-row {
    width: 100%;
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

  /* Visibility row styling */
  .visibility-row {
    display: flex;
    gap: 8px;
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
