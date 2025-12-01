<!--
  MobileSequencePanel.svelte
  
  Sequence/BeatGrid panel for mobile animation view.
  Displays beats in a compact grid format.
-->
<script lang="ts">
  import BeatGrid from "$create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";
  import type { BeatData } from "$create/shared/domain/models/BeatData";

  let {
    beats,
    startPosition,
    currentBeatNumber,
  }: {
    beats: readonly BeatData[];
    startPosition: any;
    currentBeatNumber: number;
  } = $props();
</script>

<div class="mobile-sequence-panel">
  <BeatGrid {beats} {startPosition} selectedBeatNumber={currentBeatNumber} />
</div>

<style>
  .mobile-sequence-panel {
    flex-shrink: 0;
    background: rgba(0, 0, 0, 0.25);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  /* Container query responsive styles */
  @container mobile-layout (max-width: 360px) {
    .mobile-sequence-panel {
      height: clamp(120px, 20vh, 145px);
      padding: 4px;
    }
  }

  @container mobile-layout (max-height: 600px) {
    .mobile-sequence-panel {
      height: clamp(120px, 20vh, 150px);
    }
  }

  @container mobile-layout (max-height: 500px) {
    .mobile-sequence-panel {
      height: clamp(110px, 18vh, 135px);
    }
  }

  /* Landscape orientation */
  @media (orientation: landscape) and (max-width: 768px) {
    .mobile-sequence-panel {
      flex: 1;
      height: auto;
      max-width: clamp(180px, 28vw, 280px);
      border-top: none;
      border-left: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 48px;
    }
  }
</style>
