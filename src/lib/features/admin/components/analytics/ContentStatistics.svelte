<script lang="ts">
  import type { ContentStat, TopSequence } from "./types";

  interface Props {
    stats: ContentStat[];
    topSequences: TopSequence[];
    loading?: boolean;
  }

  let { stats, topSequences, loading = false }: Props = $props();
</script>

<section class="section">
  <h3><i class="fas fa-layer-group"></i> Content Statistics</h3>
  {#if loading}
    <div class="stats-list">
      {#each Array(4) as _}
        <div class="stat-row">
          <div class="stat-icon skeleton-icon"></div>
          <span class="skeleton-stat-label"></span>
          <span class="skeleton-stat-value"></span>
        </div>
      {/each}
    </div>
    <h4>Top Sequences</h4>
    <div class="top-sequences">
      {#each Array(5) as _, i}
        <div class="sequence-row">
          <span class="rank">#{i + 1}</span>
          <div class="sequence-info">
            <span class="skeleton-seq-name"></span>
            <span class="skeleton-seq-word"></span>
          </div>
          <span class="skeleton-seq-views"></span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="stats-list">
      {#each stats as stat}
        <div class="stat-row">
          <div class="stat-icon">
            <i class={stat.icon}></i>
          </div>
          <span class="stat-label">{stat.label}</span>
          <span class="stat-value">{stat.value.toLocaleString()}</span>
        </div>
      {/each}
    </div>

    <h4>Top Sequences</h4>
    <div class="top-sequences">
      {#each topSequences as seq, i}
        <div class="sequence-row">
          <span class="rank">#{i + 1}</span>
          <div class="sequence-info">
            <span class="sequence-name">{seq.name}</span>
            <span class="sequence-word">{seq.word}</span>
          </div>
          <span class="sequence-views">{seq.views} views</span>
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  .section h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.9);
  }

  .section h3 i {
    color: rgba(255, 255, 255, 0.5);
  }

  .section h4 {
    margin: 20px 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
  }

  .stats-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .stat-row:last-child {
    border-bottom: none;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.6);
    font-size: 14px;
  }

  .stat-label {
    flex: 1;
    color: rgba(255, 255, 255, 0.8);
  }

  .stat-value {
    font-weight: 600;
    font-size: 16px;
  }

  .top-sequences {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sequence-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }

  .rank {
    font-weight: 700;
    color: rgba(255, 255, 255, 0.4);
    width: 28px;
  }

  .sequence-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .sequence-name {
    font-weight: 500;
  }

  .sequence-word {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
    font-family: monospace;
  }

  .sequence-views {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Skeleton styles */
  .skeleton-icon {
    background: rgba(255, 255, 255, 0.1);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-stat-label {
    display: block;
    flex: 1;
    height: 14px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-stat-value {
    display: block;
    width: 52px;
    height: 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-seq-name {
    display: block;
    width: 120px;
    height: 14px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-seq-word {
    display: block;
    width: 80px;
    height: 12px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    margin-top: 4px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-seq-views {
    display: block;
    width: 60px;
    height: 13px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>
