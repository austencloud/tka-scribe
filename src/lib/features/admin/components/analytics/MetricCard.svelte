<script lang="ts">
  import type { MetricCardData } from "./types";
  import { getChangeClass, formatChange } from "./utils";

  interface Props {
    metric: MetricCardData;
  }

  let { metric }: Props = $props();
</script>

<div class="metric-card" style="--accent-color: {metric.color}">
  <div class="metric-icon">
    <i class={metric.icon}></i>
  </div>
  <div class="metric-content">
    <span class="metric-value">{metric.value}</span>
    <span class="metric-label">{metric.label}</span>
    {#if metric.changeLabel === "all time"}
      <span class="metric-change neutral">
        {metric.changeLabel}
      </span>
    {:else}
      <span class="metric-change {getChangeClass(metric.change)}">
        <i class="fas fa-arrow-{metric.change >= 0 ? 'up' : 'down'}"></i>
        {formatChange(metric.change)} {metric.changeLabel}
      </span>
    {/if}
  </div>
</div>

<style>
  .metric-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    display: flex;
    gap: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .metric-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--accent-color) 20%, transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-color);
    font-size: 20px;
    flex-shrink: 0;
  }

  .metric-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .metric-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
  }

  .metric-label {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
  }

  .metric-change {
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .metric-change.positive {
    color: #10b981;
  }

  .metric-change.negative {
    color: #ef4444;
  }

  .metric-change.neutral {
    color: rgba(255, 255, 255, 0.4);
  }
</style>
