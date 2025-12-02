<!--
  DesktopAnimationView.svelte

  Desktop layout for single animation mode when a sequence is loaded.
  Shows: Header → StatsBar → [BeatGrid (left) | Canvas (right)] → Controls
  BeatGrid and Canvas are side-by-side for optimal desktop viewing.
-->
<script lang="ts">
  import AnimationControlsModern from "../../../components/canvas/AnimationControlsModern.svelte";
  import BeatGrid from "$lib/features/create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";
  import SingleModeCanvas from "../shared/SingleModeCanvas.svelte";
  import AnimationHeader from "./AnimationHeader.svelte";
  import StatsBar from "./StatsBar.svelte";
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  let {
    sequence,
    sequenceName = "",
    author,
    isPlaying = $bindable(false),
    animatingBeatNumber = $bindable<number | null>(null),
    speed,
    beats,
    startPosition,
    currentBeatNumber,
    sequenceStats,
    onChangeSequence,
    onStop,
    onOpenTrailPanel,
    onOpenAdvancedSettings,
  }: {
    sequence: SequenceData;
    sequenceName?: string;
    author?: string;
    isPlaying: boolean;
    animatingBeatNumber: number | null;
    speed: number;
    beats: readonly BeatData[];
    startPosition: any;
    currentBeatNumber: number;
    sequenceStats: {
      beats: number;
      duration: string;
      difficulty: string;
    } | null;
    onChangeSequence: () => void;
    onStop: () => void;
    onOpenTrailPanel: () => void;
    onOpenAdvancedSettings: () => void;
  } = $props();
</script>

<div class="animation-view">
  <AnimationHeader {sequenceName} {author} {onChangeSequence} />

  <!-- Main Content Area: Beat Grid (left) + Canvas (right) side-by-side -->
  <div class="main-content">
    <!-- Beat Grid -->
    <div class="beat-grid-wrapper">
      <BeatGrid
        {beats}
        {startPosition}
        selectedBeatNumber={currentBeatNumber}
        isSideBySideLayout={true}
      />
    </div>

    <!-- Canvas Container -->
    <div class="canvas-container">
      <SingleModeCanvas
        {sequence}
        bind:isPlaying
        bind:animatingBeatNumber
        {speed}
      />

      <!-- Beat Indicator - Inside Canvas Container -->
      {#if animatingBeatNumber !== null && isPlaying}
        <div class="beat-indicator">
          Beat {Math.floor(animatingBeatNumber) + 1} / {sequenceStats?.beats}
        </div>
      {/if}
    </div>
  </div>

  <div class="controls-area">
    <AnimationControlsModern
      mode="fullscreen"
      bind:isPlaying
      showExport={true}
      onPlayToggle={(playing) => {
        isPlaying = playing;
        if (!playing) onStop();
      }}
      {onOpenTrailPanel}
      {onOpenAdvancedSettings}
    />
  </div>
</div>

<style>
  .animation-view {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  /* Main Content Area - Side by Side Layout */
  .main-content {
    flex: 1;
    display: flex;
    flex-direction: row;
    gap: 12px;
    padding: 8px;
    min-height: 0;
    overflow: hidden;
  }

  /* Beat Grid Wrapper - Left Side (50%) */
  .beat-grid-wrapper {
    flex: 1;
    min-width: 200px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Canvas Container - Right Side (50%) */
  .canvas-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      rgba(15, 20, 30, 0.5) 0%,
      rgba(10, 15, 25, 0.5) 100%
    );
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    min-width: 0;
  }

  .beat-indicator {
    display: flex;
    justify-content: center;
    padding: 0.5rem 1rem;
    background: rgba(0, 0, 0, 0.4);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.85rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }

  /* Controls Area */
  .controls-area {
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
</style>
