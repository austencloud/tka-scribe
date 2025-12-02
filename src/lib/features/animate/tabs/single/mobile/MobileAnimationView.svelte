<!--
  MobileAnimationView.svelte

  Mobile-optimized layout for single animation mode.
  Displays: Header → Canvas → Controls → BeatGrid (4 rows minimum)
  
  Component composition:
  - MobileHeader: Sequence name and change button
  - MobileCanvasArea: Animation canvas with beat indicator
  - MobileControlsBar: BPM, play/pause, visibility, settings
  - MobileSequencePanel: BeatGrid display
-->
<script lang="ts">
  import MobileHeader from "./components/MobileHeader.svelte";
  import MobileCanvasArea from "./components/MobileCanvasArea.svelte";
  import MobileControlsBar from "./components/MobileControlsBar.svelte";
  import MobileSequencePanel from "./components/MobileSequencePanel.svelte";
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

  let {
    sequence,
    sequenceName = "",
    isPlaying = $bindable(false),
    animatingBeatNumber = $bindable<number | null>(null),
    speed,
    beats,
    startPosition,
    currentBeatNumber,
    onChangeSequence,
    onPlayToggle,
    onStop,
    onOpenAdvancedSettings,
  }: {
    sequence: SequenceData;
    sequenceName?: string;
    isPlaying: boolean;
    animatingBeatNumber: number | null;
    speed: number;
    beats: readonly BeatData[];
    startPosition: any;
    currentBeatNumber: number;
    onChangeSequence: () => void;
    onPlayToggle: (playing: boolean) => void;
    onStop: () => void;
    onOpenAdvancedSettings: () => void;
  } = $props();
</script>

<div class="mobile-layout">
  <!-- Compact Header with sequence name -->
  <MobileHeader {sequenceName} {onChangeSequence} />

  <!-- Animation Canvas - Balanced size -->
  <MobileCanvasArea
    {sequence}
    bind:isPlaying
    bind:animatingBeatNumber
    {speed}
    totalBeats={beats.length}
  />

  <!-- Consolidated Controls - Always visible, single compact row -->
  <MobileControlsBar
    bind:isPlaying
    {onPlayToggle}
    {onStop}
    {onOpenAdvancedSettings}
  />

  <!-- Sequence/BeatGrid - Always visible, compact -->
  <MobileSequencePanel {beats} {startPosition} {currentBeatNumber} />
</div>

<style>
  /* ============================================
     MOBILE LAYOUT CONTAINER
     Main container that provides container queries
     for child components
     ============================================ */
  .mobile-layout {
    container-type: size;
    container-name: mobile-layout;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: linear-gradient(
      180deg,
      rgba(15, 20, 30, 1) 0%,
      rgba(10, 15, 25, 1) 100%
    );
  }

  /* ============================================
     LANDSCAPE ORIENTATION on Mobile
     ============================================ */
  @media (orientation: landscape) and (max-width: 768px) {
    .mobile-layout {
      flex-direction: row;
    }
  }
</style>
