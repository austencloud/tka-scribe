<!--
  AnimationControlsPanel.svelte

  2026 Bento Box Design - Unified controls panel
  - Speed controls and play/pause
  - Motion visibility buttons
  - Trail settings
  - Export actions

  Mobile: Compact layout with advanced controls in bottom sheet
  Desktop: All controls visible in side panel
-->
<script lang="ts">
  import BpmControl from "../controls/BpmControl.svelte";
  import SimpleTrailControls from "../trail/SimpleTrailControls.svelte";
  import MotionVisibilityButtons from "../trail/MotionVisibilityButtons.svelte";
  import ExportActionsPanel from "./ExportActionsPanel.svelte";
  import MobileToolViewToggle from "../inputs/MobileToolViewToggle.svelte";
  import AnimationBeatGrid from "$lib/shared/animation-engine/components/AnimationBeatGrid.svelte";
  import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
  import { createComponentLogger } from "$lib/shared/utils/debug-logger";

  type MobileToolView = "controls" | "beat-grid";

  const debug = createComponentLogger("AnimationControlsPanel");
  const DEFAULT_BPM = 60;

  // Mobile menu and sheet states
  let isMenuOpen = $state(false);
  let isBpmSheetOpen = $state(false);
  let isTrailSheetOpen = $state(false);

  let {
    speed = 1,
    isPlaying = false,
    blueMotionVisible = true,
    redMotionVisible = true,
    isSideBySideLayout = false,
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
  class:mobile={!isSideBySideLayout}
  class:desktop={isSideBySideLayout}
  bind:this={scrollContainerRef}
  use:preventBackNavAction={isSideBySideLayout}
  onscroll={onScroll}
>
  <!-- Mobile Compact Mode: Optimized for small screens like iPhone SE -->
  {#if !isSideBySideLayout}
    <div class="control-row mobile-toolbar">
      <!-- Left: View Toggle -->
      <MobileToolViewToggle
        activeView={mobileToolView}
        onToggle={onToggleToolView}
      />

      <!-- Center: Play button (using flex spacer approach) -->
      <div class="toolbar-spacer"></div>
      <button
        class="play-pause-btn"
        class:playing={isPlaying}
        onclick={onPlaybackToggle}
        aria-label={isPlaying ? "Pause animation" : "Play animation"}
        type="button"
      >
        <i class="fas {isPlaying ? 'fa-pause' : 'fa-play'}"></i>
      </button>
      <div class="toolbar-spacer"></div>

      <!-- Right: Menu button -->
      <div class="menu-container">
        <button
          class="menu-btn"
          onclick={() => { console.log('Menu clicked!'); isMenuOpen = !isMenuOpen; }}
          aria-label="Settings menu"
          aria-expanded={isMenuOpen}
          type="button"
        >
          <i class="fas fa-ellipsis-v"></i>
        </button>

        {#if isMenuOpen}
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            class="menu-backdrop"
            onclick={() => isMenuOpen = false}
            role="button"
            tabindex="-1"
          ></div>
          <div class="menu-dropdown">
            <!-- Visibility toggles -->
            <button
              class="menu-item"
              class:active={blueMotionVisible}
              onclick={() => { onToggleBlue(); }}
              type="button"
            >
              <span class="menu-icon blue-icon">●</span>
              <span class="menu-text">Blue Motion</span>
              <span class="menu-toggle">{blueMotionVisible ? '✓' : ''}</span>
            </button>
            <button
              class="menu-item"
              class:active={redMotionVisible}
              onclick={() => { onToggleRed(); }}
              type="button"
            >
              <span class="menu-icon red-icon">●</span>
              <span class="menu-text">Red Motion</span>
              <span class="menu-toggle">{redMotionVisible ? '✓' : ''}</span>
            </button>

            <div class="menu-divider"></div>

            <!-- Speed settings -->
            <button
              class="menu-item"
              onclick={() => { isMenuOpen = false; isBpmSheetOpen = true; }}
              type="button"
            >
              <span class="menu-icon"><i class="fas fa-tachometer-alt"></i></span>
              <span class="menu-text">Speed Settings</span>
              <span class="menu-value">{bpm} BPM</span>
            </button>

            <!-- Trail settings -->
            <button
              class="menu-item"
              onclick={() => { isMenuOpen = false; isTrailSheetOpen = true; }}
              type="button"
            >
              <span class="menu-icon"><i class="fas fa-paint-brush"></i></span>
              <span class="menu-text">Trail Effects</span>
              <span class="menu-chevron"><i class="fas fa-chevron-right"></i></span>
            </button>

            <div class="menu-divider"></div>

            <!-- Export -->
            <button
              class="menu-item export-item"
              onclick={() => { isMenuOpen = false; onExportGif(); }}
              disabled={isExporting}
              type="button"
            >
              <span class="menu-icon"><i class="fas fa-file-export"></i></span>
              <span class="menu-text">{isExporting ? 'Exporting...' : 'Export GIF'}</span>
            </button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Quick BPM Presets (always visible on mobile) -->
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

    <!-- Tool Area: Beat Grid only (controls in menu) -->
    {#if mobileToolView === "beat-grid"}
      <div class="beat-grid-area">
        <AnimationBeatGrid
          {sequenceData}
          {currentBeat}
          {isPlaying}
        />
      </div>
    {/if}

    <!-- BPM Sheet (focused, no scroll) -->
    <Drawer
      bind:isOpen={isBpmSheetOpen}
      placement="bottom"
      showHandle={true}
      closeOnBackdrop={true}
      ariaLabel="Speed settings"
    >
      <div class="focused-sheet">
        <div class="focused-sheet-header">
          <h3>Speed</h3>
          <button class="sheet-close" onclick={() => isBpmSheetOpen = false} type="button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="focused-sheet-content">
          <BpmControl
            bind:bpm
            min={15}
            max={180}
            step={1}
            onBpmChange={handleBpmChange}
          />
        </div>
      </div>
    </Drawer>

    <!-- Trail Sheet (focused, no scroll) -->
    <Drawer
      bind:isOpen={isTrailSheetOpen}
      placement="bottom"
      showHandle={true}
      closeOnBackdrop={true}
      ariaLabel="Trail settings"
    >
      <div class="focused-sheet">
        <div class="focused-sheet-header">
          <h3>Trail Effects</h3>
          <button class="sheet-close" onclick={() => isTrailSheetOpen = false} type="button">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="focused-sheet-content">
          <SimpleTrailControls />
        </div>
      </div>
    </Drawer>
  {/if}

  <!-- Desktop Mode: Side-by-side layout with all controls -->
  {#if isSideBySideLayout}
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

    <!-- BPM Control Row -->
    <div class="control-row bpm-row">
      <BpmControl
        bind:bpm
        min={15}
        max={180}
        step={1}
        onBpmChange={handleBpmChange}
      />
    </div>

    <!-- Trail Settings -->
    <SimpleTrailControls />
  {/if}

  <!-- Export (Desktop only - mobile has it in controls view) -->
  {#if isSideBySideLayout}
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

  /* Mobile Mode - Full-height with scrollable content */
  .controls-panel.mobile {
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    flex: 1 1 0;
    min-height: 0;
    max-height: none;
    padding: 10px;
    gap: 8px;
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

  /* Mobile toolbar - flexbox layout with spacers for centering */
  .mobile-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .toolbar-spacer {
    flex: 1;
  }

  /* Menu container */
  .menu-container {
    position: relative;
  }

  .menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.08);
    border: 1.5px solid rgba(255, 255, 255, 0.15);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    -webkit-tap-highlight-color: transparent;
    font-size: 16px;
  }

  .menu-btn:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.9);
  }

  .menu-btn:active {
    transform: scale(0.95);
  }

  .menu-backdrop {
    position: fixed;
    inset: 0;
    z-index: 99;
  }

  .menu-dropdown {
    position: absolute;
    right: 0;
    bottom: calc(100% + 8px);
    min-width: 200px;
    background: rgba(20, 20, 25, 0.98);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    z-index: 100;
    overflow: hidden;
    animation: menuSlideUp 0.2s ease;
    backdrop-filter: blur(16px);
  }

  @keyframes menuSlideUp {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .menu-item {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px 16px;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    text-align: left;
    gap: 12px;
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  .menu-item:active {
    background: rgba(255, 255, 255, 0.12);
  }

  .menu-item:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .menu-icon {
    width: 20px;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
  }

  .menu-icon.blue-icon {
    color: #3b82f6;
  }

  .menu-icon.red-icon {
    color: #ef4444;
  }

  .menu-text {
    flex: 1;
  }

  .menu-toggle {
    width: 20px;
    text-align: center;
    color: rgba(34, 197, 94, 0.9);
    font-weight: 600;
  }

  .menu-value {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    font-variant-numeric: tabular-nums;
  }

  .menu-chevron {
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.7rem;
  }

  .menu-item.active .menu-icon.blue-icon,
  .menu-item.active .menu-icon.red-icon {
    filter: brightness(1.2);
  }

  .menu-item.export-item {
    color: rgba(139, 92, 246, 0.9);
  }

  .menu-item.export-item .menu-icon {
    color: rgba(139, 92, 246, 0.7);
  }

  .menu-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 4px 0;
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

  /* ===========================
     FOCUSED SHEETS (Mobile)
     =========================== */

  .focused-sheet {
    padding: 8px 16px 24px;
  }

  .focused-sheet-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .focused-sheet-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .sheet-close {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .sheet-close:hover {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.9);
  }

  .focused-sheet-content {
    /* Content fills available space without scrolling */
  }
</style>
