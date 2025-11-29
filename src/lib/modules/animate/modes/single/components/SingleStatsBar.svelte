<!--
  SingleStatsBar.svelte

  Stats bar showing beat count, duration, BPM, and difficulty level.
-->
<script lang="ts">
  // Props
  let {
    beats,
    duration,
    bpm,
    difficulty,
  }: {
    beats: number;
    duration: string;
    bpm: number;
    difficulty: string;
  } = $props();
</script>

<div class="stats-bar">
  <div class="stat-item">
    <i class="fas fa-layer-group"></i>
    <span class="stat-value">{beats}</span>
    <span class="stat-label">Beats</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <i class="fas fa-clock"></i>
    <span class="stat-value">{duration}s</span>
    <span class="stat-label">Duration</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <i class="fas fa-gauge"></i>
    <span class="stat-value">{bpm}</span>
    <span class="stat-label">BPM</span>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <i class="fas fa-signal"></i>
    <span class="stat-value capitalize">{difficulty}</span>
    <span class="stat-label">Level</span>
  </div>
</div>

<style>
  .stats-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 0.85rem 1.25rem;
    background: rgba(0, 0, 0, 0.15);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    flex-shrink: 0;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .stat-item i {
    font-size: 0.9rem;
    opacity: 0.5;
  }

  .stat-value {
    font-size: 1rem;
    font-weight: 600;
  }

  .stat-label {
    font-size: 0.8rem;
    opacity: 0.5;
  }

  .stat-divider {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
  }

  .capitalize {
    text-transform: capitalize;
  }

  @media (max-width: 768px) {
    .stats-bar {
      gap: 1rem;
      flex-wrap: wrap;
    }

    .stat-divider {
      display: none;
    }
  }
</style>
