<!--
  AnimationControlsPanel - Orchestrates playback, BPM, visibility, and export controls.

  Responsive modes:
  - Mobile compact: CompactMobileRow + tool area (beat grid or BPM presets)
  - Mobile expanded: All controls visible, scrollable
  - Desktop: Fixed layout with full controls
-->
<script lang="ts">
  import { browser } from "$app/environment";
  import { onMount } from "svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";
  import {
    animationSettings,
    TrailMode,
  } from "$lib/shared/animation-engine/state/animation-settings-state.svelte";

  // Subcomponents
  import CompactMobileRow from "../controls/CompactMobileRow.svelte";
  import QuickBpmPresets from "../controls/QuickBpmPresets.svelte";
  import TransportControls from "../controls/TransportControls.svelte";
  import PlaybackStyleRow from "../controls/PlaybackStyleRow.svelte";
  import StepModeSettings from "../controls/StepModeSettings.svelte";
  import BpmChips from "../controls/BpmChips.svelte";
  import SettingsButtonRow from "../controls/SettingsButtonRow.svelte";
  import VisibilitySettingsSheet from "../controls/VisibilitySettingsSheet.svelte";
  import ExportActionsPanel from "./ExportActionsPanel.svelte";
  import AnimationSettingsSheet from "../controls/AnimationSettingsSheet.svelte";
  import AnimationBeatGrid from "$lib/shared/animation-engine/components/AnimationBeatGrid.svelte";

  type MobileToolView = "controls" | "beat-grid";

  const debug = createComponentLogger("AnimationControlsPanel");
  const DEFAULT_BPM = 60;
  const COMPACT_CONTROLS_HEIGHT = 800;
  const COMPACT_CONTROLS_WIDTH = 380;

  let {
    speed = 1,
    isPlaying = false,
    blueMotionVisible = true,
    redMotionVisible = true,
    playbackMode = "continuous",
    stepPlaybackPauseMs = 300,
    stepPlaybackStepSize = 1,
    isSideBySideLayout = false,
    isExpanded = false,
    scrollContainerRef = $bindable(null),
    isSettingsOpen = $bindable(false),
    isExporting = false,
    exportProgress = null,
    mobileToolView = "controls" as MobileToolView,
    sequenceData = null,
    currentBeat = 0,
    onSpeedChange = () => {},
    onPlaybackStart = () => {},
    onPlaybackToggle = () => {},
    onPlaybackModeChange = () => {},
    onStepPlaybackPauseMsChange = () => {},
    onStepPlaybackStepSizeChange = () => {},
    onStepHalfBeatBackward = () => {},
    onStepHalfBeatForward = () => {},
    onStepFullBeatBackward = () => {},
    onStepFullBeatForward = () => {},
    onToggleBlue = () => {},
    onToggleRed = () => {},
    onToggleExpanded = () => {},
    onToggleToolView = () => {},
    onExportVideo = () => {},
    onCancelExport = () => {},
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
    playbackMode?: import("../../state/animation-panel-state.svelte").PlaybackMode;
    stepPlaybackPauseMs?: number;
    stepPlaybackStepSize?: import("../../state/animation-panel-state.svelte").StepPlaybackStepSize;
    isSideBySideLayout?: boolean;
    isExpanded?: boolean;
    scrollContainerRef?: HTMLDivElement | null;
    isSettingsOpen?: boolean;
    isExporting?: boolean;
    exportProgress?: { progress: number; stage: string } | null;
    mobileToolView?: MobileToolView;
    sequenceData?: SequenceData | null;
    currentBeat?: number;
    onSpeedChange?: (newSpeed: number) => void;
    onPlaybackStart?: () => void;
    onPlaybackToggle?: () => void;
    onPlaybackModeChange?: (
      mode: import("../../state/animation-panel-state.svelte").PlaybackMode
    ) => void;
    onStepPlaybackPauseMsChange?: (pauseMs: number) => void;
    onStepPlaybackStepSizeChange?: (
      stepSize: import("../../state/animation-panel-state.svelte").StepPlaybackStepSize
    ) => void;
    onStepHalfBeatBackward?: () => void;
    onStepHalfBeatForward?: () => void;
    onStepFullBeatBackward?: () => void;
    onStepFullBeatForward?: () => void;
    onToggleBlue?: () => void;
    onToggleRed?: () => void;
    onToggleExpanded?: () => void;
    onToggleToolView?: () => void;
    onExportVideo?: () => void;
    onCancelExport?: () => void;
    isCircular?: boolean;
    loopCount?: number;
    onLoopCountChange?: (count: number) => void;
    preventBackNavAction?: (
      node: HTMLElement,
      isSideBySideLayout: boolean
    ) => any;
    onScroll?: (e: Event) => void;
  } = $props();

  // BPM state
  // svelte-ignore state_referenced_locally - intentional: $effect below syncs prop changes
  let bpm = $state(Math.round(speed * DEFAULT_BPM));
  $effect(() => {
    bpm = Math.round(speed * DEFAULT_BPM);
  });

  function handleBpmChange(newBpm: number) {
    const newSpeed = newBpm / DEFAULT_BPM;
    onSpeedChange(newSpeed);
  }

  // Viewport detection
  let viewportHeight = $state(0);
  let viewportWidth = $state(0);

  onMount(() => {
    if (!browser) return;
    const checkViewport = () => {
      viewportHeight = window.innerHeight;
      viewportWidth = window.innerWidth;
    };
    checkViewport();
    window.addEventListener("resize", checkViewport);
    return () => window.removeEventListener("resize", checkViewport);
  });

  const useCompactControls = $derived(
    (viewportHeight > 0 && viewportHeight < COMPACT_CONTROLS_HEIGHT) ||
      (viewportWidth > 0 && viewportWidth < COMPACT_CONTROLS_WIDTH)
  );

  // Settings sheet state - sync with bindable prop
  let isSettingsSheetOpen = $state(false);
  let isVisibilitySheetOpen = $state(false);

  // Sync internal state with bindable prop for parent to track
  $effect(() => {
    isSettingsOpen = isSettingsSheetOpen || isVisibilitySheetOpen;
  });

  // Derive trail preset for settings button summary
  const currentTrailPreset = $derived.by(() => {
    const trail = animationSettings.trail;
    if (!trail.enabled || trail.mode === TrailMode.OFF) return "Off";
    if (trail.lineWidth <= 2.5 && trail.maxOpacity <= 0.7) return "Subtle";
    return "Vivid";
  });

  // Derive playback mode label for settings summary
  const playbackModeLabel = $derived(
    playbackMode === "step" ? "Step" : "Continuous"
  );

  // Get propType for trail controls
  const currentPropType = $derived.by(() => {
    const firstBeat = sequenceData?.beats?.[0];
    if (firstBeat?.motions?.blue?.propType)
      return firstBeat.motions.blue.propType;
    if (firstBeat?.motions?.red?.propType)
      return firstBeat.motions.red.propType;
    if (sequenceData?.propType) return sequenceData.propType;
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
  <!-- Mobile Compact Mode -->
  {#if !isSideBySideLayout && !isExpanded}
    <CompactMobileRow
      {mobileToolView}
      {isPlaying}
      {isExpanded}
      {onToggleToolView}
      {onPlaybackToggle}
      {onToggleExpanded}
    />

    <!-- Tool Area: Beat Grid or Quick Presets -->
    {#if mobileToolView === "beat-grid"}
      <div class="beat-grid-area">
        <AnimationBeatGrid {sequenceData} {currentBeat} {isPlaying} />
      </div>
    {:else}
      <div class="control-row quick-presets-row">
        <QuickBpmPresets {bpm} onBpmChange={handleBpmChange} />
      </div>
    {/if}
  {/if}

  <!-- Expanded/Desktop Mode: Playback Row (just transport controls) -->
  {#if isSideBySideLayout || isExpanded}
    <div class="control-row playback-row">
      <TransportControls
        {isPlaying}
        {onPlaybackToggle}
        {onStepHalfBeatBackward}
        {onStepHalfBeatForward}
        {onStepFullBeatBackward}
        {onStepFullBeatForward}
      />
    </div>

    <!-- Playback Style Row (Continuous vs Step-by-Step) - always visible when expanded -->
    {#if !useCompactControls}
      <div class="control-row style-row">
        <PlaybackStyleRow
          {playbackMode}
          {isPlaying}
          {onPlaybackModeChange}
          {onPlaybackToggle}
        />
      </div>

      <!-- Step Mode Settings (shown when step mode active) -->
      {#if playbackMode === "step"}
        <div class="control-row step-settings-container">
          <StepModeSettings
            {stepPlaybackStepSize}
            {onStepPlaybackStepSizeChange}
          />
        </div>
      {/if}
    {/if}
  {/if}

  <!-- BPM & Settings Buttons -->
  {#if isSideBySideLayout || isExpanded}
    {#if useCompactControls}
      <!-- Compact: Single settings button for all settings -->
      <div class="control-row compact-row-settings">
        <button
          class="settings-sheet-btn"
          onclick={() => (isSettingsSheetOpen = true)}
          type="button"
          aria-label="Open playback settings"
        >
          <i class="fas fa-sliders-h" aria-hidden="true"></i>
          <span class="settings-btn-label">Settings</span>
          <span class="settings-summary">{playbackModeLabel} · {bpm} BPM</span>
        </button>
      </div>
    {:else}
      <!-- Full controls: BPM inline, Trails/Visibility as sheet buttons -->
      <div class="control-row bpm-row">
        <BpmChips
          bind:bpm
          min={15}
          max={180}
          step={1}
          onBpmChange={handleBpmChange}
        />
      </div>

      <div class="control-row settings-row">
        <SettingsButtonRow
          onOpenVisibility={() => (isVisibilitySheetOpen = true)}
        />
      </div>
    {/if}
  {/if}

  <!-- Export -->
  {#if isSideBySideLayout || isExpanded}
    <ExportActionsPanel
      {onExportVideo}
      {onCancelExport}
      {isExporting}
      {exportProgress}
      {isCircular}
      {loopCount}
      {onLoopCountChange}
    />
  {/if}
</div>

<!-- Settings Sheet (Compact mobile - all settings) -->
<AnimationSettingsSheet
  bind:isOpen={isSettingsSheetOpen}
  bind:bpm
  {blueMotionVisible}
  {redMotionVisible}
  {currentPropType}
  {playbackMode}
  {stepPlaybackPauseMs}
  {stepPlaybackStepSize}
  {isPlaying}
  onBpmChange={handleBpmChange}
  {onToggleBlue}
  {onToggleRed}
  {onPlaybackModeChange}
  {onStepPlaybackPauseMsChange}
  {onStepPlaybackStepSizeChange}
  {onPlaybackToggle}
/>

<!-- Visual Settings Sheet (visibility + trails) -->
<VisibilitySettingsSheet bind:isOpen={isVisibilitySheetOpen} propType={currentPropType} />

<style>
  /* Controls Panel Container */
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
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.08));
    border-radius: 16px;
    backdrop-filter: blur(16px);
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    -webkit-overflow-scrolling: touch;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .controls-panel.mobile-compact {
    overflow-y: hidden !important;
    overflow-x: hidden;
    flex: 0 0 auto;
    max-height: none;
    padding: 10px;
    gap: 0;
  }

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

  .controls-panel.desktop {
    overflow-y: hidden !important;
    overflow-x: hidden;
    flex: 0 0 auto;
    padding: 14px;
    gap: 12px;
  }

  /* Scrollbar */
  .controls-panel::-webkit-scrollbar {
    width: 6px;
  }
  .controls-panel::-webkit-scrollbar-track {
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.2));
    border-radius: 3px;
  }
  .controls-panel::-webkit-scrollbar-thumb {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.15));
    border-radius: 3px;
  }
  .controls-panel::-webkit-scrollbar-thumb:hover {
    background: var(--theme-stroke-strong, rgba(255, 255, 255, 0.25));
  }

  /* Control Rows */
  .control-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .quick-presets-row {
    justify-content: center;
  }

  .beat-grid-area {
    min-height: 100px;
    max-height: 160px;
    overflow: hidden;
    border-radius: 12px;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.2));
  }

  .playback-row {
    justify-content: center;
    gap: 12px;
  }

  .step-settings-container {
    width: 100%;
  }

  .step-settings-container :global(.step-settings-row) {
    width: 100%;
  }

  .bpm-row {
    width: 100%;
  }

  .settings-row {
    width: 100%;
  }

  /* Compact Settings Button */
  .compact-row-settings {
    width: 100%;
  }

  .settings-sheet-btn {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: var(--min-touch-target);
    padding: 10px 14px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1.5px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 12px;
    color: var(--theme-text, rgba(255, 255, 255, 0.8));
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 var(--theme-card-bg, rgba(255, 255, 255, 0.03));
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
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    font-weight: 500;
  }

  @media (hover: hover) and (pointer: fine) {
    .settings-sheet-btn:hover {
      background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
      border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.18));
    }
  }

  .settings-sheet-btn:active {
    transform: scale(0.98);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .controls-panel {
      padding: 10px;
      gap: 10px;
    }
    .control-row {
      gap: 8px;
    }
  }

  @media (max-height: 500px) and (orientation: landscape) {
    .controls-panel {
      padding: 10px;
      gap: 8px;
    }
  }
</style>
