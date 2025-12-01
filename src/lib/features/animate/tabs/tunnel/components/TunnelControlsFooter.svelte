<!--
  TunnelControlsFooter.svelte

  Playback controls footer with play/pause, BPM control, and beat indicator.
-->
<script lang="ts">
  import BpmControl from "../../../components/controls/BpmControl.svelte";
  import PlayPauseButton from "../../../components/controls/PlayPauseButton.svelte";

  // Props
  let {
    isPlaying = $bindable(false),
    bpm = $bindable(60),
    onBpmChange,
    animatingBeatNumber,
    totalBeats,
  }: {
    isPlaying: boolean;
    bpm: number;
    onBpmChange?: (bpm: number) => void;
    animatingBeatNumber: number | null;
    totalBeats: number;
  } = $props();
</script>

<div class="controls-footer">
  <div class="playback-controls">
    <PlayPauseButton bind:isPlaying />
    <BpmControl bind:bpm {onBpmChange} />
  </div>
  <div class="beat-indicator">
    <span class="beat-label">Beat</span>
    <span class="beat-number">{animatingBeatNumber ?? "-"}</span>
    <span class="beat-total">/ {totalBeats}</span>
  </div>
</div>

<style>
  .controls-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: linear-gradient(
      135deg,
      rgba(20, 184, 166, 0.05) 0%,
      rgba(6, 182, 212, 0.03) 100%
    );
    border-top: 1px solid rgba(20, 184, 166, 0.1);
    flex-shrink: 0;
  }

  .playback-controls {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .beat-indicator {
    display: flex;
    align-items: baseline;
    gap: 6px;
    padding: 8px 14px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .beat-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .beat-number {
    font-size: 1.1rem;
    font-weight: 700;
    color: #14b8a6;
    font-family: "SF Mono", "Monaco", monospace;
  }

  .beat-total {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.4);
    font-family: "SF Mono", "Monaco", monospace;
  }

  @media (max-width: 600px) {
    .controls-footer {
      flex-direction: column;
      gap: 12px;
    }

    .playback-controls {
      width: 100%;
      justify-content: center;
    }
  }
</style>
