<!--
  TunnelStatsBar.svelte

  Stats bar showing beat count, speed, visibility, and playback status.
-->
<script lang="ts">
  // Props
  let {
    totalBeats,
    speed,
    primaryVisible,
    secondaryVisible,
    isPlaying,
  }: {
    totalBeats: number;
    speed: number;
    primaryVisible: boolean;
    secondaryVisible: boolean;
    isPlaying: boolean;
  } = $props();

  const visibleCount = $derived((primaryVisible ? 1 : 0) + (secondaryVisible ? 1 : 0));
</script>

<div class="stats-bar">
  <div class="stat-item">
    <i class="fas fa-music"></i>
    <span class="stat-value">{totalBeats}</span>
    <span class="stat-label">Beats</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <i class="fas fa-tachometer-alt"></i>
    <span class="stat-value">{speed.toFixed(1)}x</span>
    <span class="stat-label">Speed</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <i class="fas fa-eye"></i>
    <span class="stat-value">{visibleCount}/2</span>
    <span class="stat-label">Visible</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item playback-status" class:playing={isPlaying}>
    <i class="fas fa-{isPlaying ? 'pause' : 'play'}"></i>
    <span class="stat-value">{isPlaying ? 'Playing' : 'Paused'}</span>
  </div>
</div>

<style>
  .stats-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 10px 16px;
    background: rgba(255, 255, 255, 0.02);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
  }

  .stat-item i {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .stat-value {
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .stat-label {
    color: rgba(255, 255, 255, 0.4);
  }

  .stat-divider {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
  }

  .playback-status {
    padding: 4px 10px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    transition: all 0.2s ease;
  }

  .playback-status.playing {
    background: rgba(34, 197, 94, 0.15);
  }

  .playback-status.playing i,
  .playback-status.playing .stat-value {
    color: #4ade80;
  }

  @media (max-width: 600px) {
    .stats-bar {
      flex-wrap: wrap;
      gap: 12px;
    }

    .stat-divider {
      display: none;
    }
  }
</style>
