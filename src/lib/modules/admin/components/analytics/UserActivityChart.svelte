<script lang="ts">
  import type { TimeSeriesPoint } from "./types";

  interface Props {
    data: TimeSeriesPoint[];
  }

  let { data }: Props = $props();
</script>

<section class="section">
  <h3><i class="fas fa-chart-line"></i> User Activity</h3>
  {#if data.length > 0}
    <div class="activity-chart">
      <div class="chart-container">
        {#each data as point}
          {@const maxValue = Math.max(...data.map((p) => p.value))}
          {@const height = (point.value / maxValue) * 100}
          <div
            class="bar"
            style="height: {height}%"
            title="{point.date}: {point.value} active users"
          ></div>
        {/each}
      </div>
      <div class="chart-labels">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  {:else}
    <div class="no-data-message">
      <i class="fas fa-info-circle"></i>
      <span>Historical activity tracking requires Firebase indexes or Cloud Functions. Current "Active Today" count is shown above.</span>
    </div>
  {/if}
</section>

<style>
  .section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
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

  .activity-chart {
    height: 200px;
    display: flex;
    flex-direction: column;
  }

  .chart-container {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 2px;
    padding: 0 4px;
  }

  .chart-container .bar {
    flex: 1;
    background: linear-gradient(to top, #3b82f6, #60a5fa);
    border-radius: 2px 2px 0 0;
    min-height: 4px;
    transition: height 0.3s ease;
    cursor: pointer;
  }

  .chart-container .bar:hover {
    background: linear-gradient(to top, #2563eb, #3b82f6);
  }

  .chart-labels {
    display: flex;
    justify-content: space-between;
    padding: 8px 4px 0;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }

  .no-data-message {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
  }

  .no-data-message i {
    font-size: 20px;
    color: rgba(255, 255, 255, 0.3);
  }
</style>
