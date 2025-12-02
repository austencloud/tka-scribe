<!--
  TunnelSequencePanel.svelte

  A sequence panel showing the BeatGrid with header controls.
  Used for both primary and secondary sequences in tunnel mode.
-->
<script lang="ts">
  import BeatGrid from "$lib/features/create/shared/workspace-panel/sequence-display/components/BeatGrid.svelte";
  import SequencePanelHeader from "../../shared/components/SequencePanelHeader.svelte";
  import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
  import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";
  import type { NormalizedSequenceData } from "../../../services/contracts/ISequenceNormalizationService";

  type PanelVariant = "primary" | "secondary";

  let {
    variant,
    sequenceName,
    colors,
    beats,
    startPosition,
    selectedBeatNumber,
    isLoading = false,
    visible = $bindable(true),
    blueVisible = $bindable(true),
    redVisible = $bindable(true),
    onMirror,
    onRotate,
    onColorSwap,
    onReverse,
  }: {
    variant: PanelVariant;
    sequenceName: string;
    colors: { color: string; label: string }[];
    beats: readonly BeatData[];
    startPosition: NormalizedSequenceData["startPosition"];
    selectedBeatNumber: number | null;
    isLoading?: boolean;
    visible: boolean;
    blueVisible: boolean;
    redVisible: boolean;
    onMirror: () => void;
    onRotate: () => void;
    onColorSwap: () => void;
    onReverse: () => void;
  } = $props();
</script>

<div class="sequence-panel {variant}-panel">
  <SequencePanelHeader
    {sequenceName}
    {colors}
    bind:visible
    bind:blueVisible
    bind:redVisible
    {onMirror}
    {onRotate}
    {onColorSwap}
    {onReverse}
  />
  <div class="panel-content">
    {#if !isLoading}
      <BeatGrid {beats} {startPosition} {selectedBeatNumber} />
    {:else}
      <div class="loading-beats">
        <div class="spinner"></div>
        <p>Loading beats...</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .sequence-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    overflow: hidden;
    min-width: 0;
  }

  .primary-panel {
    border-color: rgba(59, 130, 246, 0.2);
  }

  .secondary-panel {
    border-color: rgba(34, 197, 94, 0.2);
  }

  .panel-content {
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  .loading-beats {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #14b8a6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-beats p {
    margin: 0;
    font-size: 0.8rem;
  }

  @media (max-width: 1024px) {
    .sequence-panel {
      min-height: 280px;
    }
  }
</style>
