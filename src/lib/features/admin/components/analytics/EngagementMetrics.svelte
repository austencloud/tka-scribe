<script lang="ts">
  import type { EngagementStat } from "./types";
  import { getBarWidth } from "./utils";

  interface Props {
    stats: EngagementStat[];
    loading?: boolean;
  }

  let { stats, loading = false }: Props = $props();
</script>

<section class="section">
  <h3><i class="fas fa-heart"></i> Engagement Metrics</h3>
  {#if loading}
    <div class="engagement-list">
      {#each Array(4) as _, i}
        <div class="engagement-row">
          <div class="engagement-header">
            <div class="engagement-icon skeleton-icon"></div>
            <span class="skeleton-eng-label"></span>
            <span class="skeleton-eng-value"></span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill skeleton-bar"
              style="width: {30 + i * 15}%"
            ></div>
          </div>
          <span class="skeleton-eng-percent"></span>
        </div>
      {/each}
    </div>
  {:else}
    <div class="engagement-list">
      {#each stats as stat}
        <div class="engagement-row">
          <div class="engagement-header">
            <div class="engagement-icon" style="color: {stat.color}">
              <i class={stat.icon}></i>
            </div>
            <span class="engagement-label">{stat.label}</span>
            <span class="engagement-value">
              {stat.value.toLocaleString()}
            </span>
          </div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              style="width: {getBarWidth(
                stat.value,
                stat.total
              )}; background: {stat.color}"
            ></div>
          </div>
          <span class="engagement-percent">
            {((stat.value / stat.total) * 100).toFixed(1)}% of users
          </span>
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

  .engagement-list {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .engagement-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .engagement-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .engagement-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
  }

  .engagement-label {
    flex: 1;
    color: rgba(255, 255, 255, 0.8);
  }

  .engagement-value {
    font-weight: 600;
    font-size: 16px;
  }

  .progress-bar {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.5s ease;
  }

  .engagement-percent {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  /* Skeleton styles */
  .skeleton-icon {
    background: rgba(255, 255, 255, 0.1);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-eng-label {
    display: block;
    flex: 1;
    height: 14px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-eng-value {
    display: block;
    width: 52px;
    height: 16px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-bar {
    background: rgba(255, 255, 255, 0.1) !important;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-eng-percent {
    display: block;
    width: 80px;
    height: 12px;
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
