<!--
  DesktopAnimationView.svelte

  Desktop layout for single animation mode when a sequence is loaded.
  Shows: Header → StatsBar → BeatGrid → Canvas → Controls
-->
<script lang="ts">
  import { AnimationControlsV2 } from "../../../components/v2";
  import BeatGrid from "$create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";
  import { SingleModeCanvas } from "../shared";
  import { AnimationHeader, StatsBar } from "../desktop";
  import type { BeatData } from "$create/shared/domain/models/BeatData";
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
  <AnimationHeader
    {sequenceName}
    {author}
    {onChangeSequence}
  />

  <StatsBar
    beats={sequenceStats?.beats ?? 0}
    duration={sequenceStats?.duration ?? "0"}
    bpm={Math.round(speed * 60)}
    difficulty={sequenceStats?.difficulty ?? "intermediate"}
  />

  <!-- Beat Grid -->
  <div class="beat-grid-wrapper">
    <BeatGrid
      {beats}
      {startPosition}
      selectedBeatNumber={currentBeatNumber}
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
  </div>

  <!-- Beat Indicator - Below Canvas -->
  {#if animatingBeatNumber !== null && isPlaying}
    <div class="beat-indicator">
      Beat {Math.floor(animatingBeatNumber) + 1} / {sequenceStats?.beats}
    </div>
  {/if}

  <div class="controls-area">
    <AnimationControlsV2
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

  /* Beat Grid Wrapper */
  .beat-grid-wrapper {
    flex-shrink: 0;
    height: 140px;
    min-height: 140px;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 8px;
  }

  /* Canvas Container */
  .canvas-container {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(
      135deg,
      rgba(15, 20, 30, 0.5) 0%,
      rgba(10, 15, 25, 0.5) 100%
    );
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
  }

  /* Controls Area */
  .controls-area {
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }
</style>
