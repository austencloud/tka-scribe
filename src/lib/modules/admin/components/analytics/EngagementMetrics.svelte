<script lang="ts">
  import type { EngagementStat } from "./types";
  import { getBarWidth } from "./utils";

  interface Props {
    stats: EngagementStat[];
  }

  let { stats }: Props = $props();
</script>

<section class="section">
  <h3><i class="fas fa-heart"></i> Engagement Metrics</h3>
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
            style="width: {getBarWidth(stat.value, stat.total)}; background: {stat.color}"
          ></div>
        </div>
        <span class="engagement-percent">
          {((stat.value / stat.total) * 100).toFixed(1)}% of users
        </span>
      </div>
    {/each}
  </div>
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
</style>
