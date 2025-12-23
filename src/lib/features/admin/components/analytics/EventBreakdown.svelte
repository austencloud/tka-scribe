<script lang="ts">
  import type { EventTypeBreakdown } from "../../services/contracts/IAnalyticsDataService";
  import { getEventIcon } from "./utils";

  interface Props {
    events: EventTypeBreakdown[];
    loading?: boolean;
  }

  let { events, loading = false }: Props = $props();

  function getTotalEvents(): number {
    return events.reduce((sum, e) => sum + e.count, 0);
  }
</script>

<section class="section">
  <h3><i class="fas fa-chart-pie"></i> Activity Breakdown</h3>
  {#if loading}
    <div class="event-breakdown">
      {#each Array(4) as _, i}
        <div class="event-row">
          <div class="event-header">
            <div class="event-icon skeleton-icon"></div>
            <span class="skeleton-label"></span>
            <span class="skeleton-count"></span>
          </div>
          <div class="event-bar">
            <div
              class="event-bar-fill skeleton-bar"
              style="width: {40 + i * 10}%"
            ></div>
          </div>
        </div>
      {/each}
      <div class="total-events skeleton-total"></div>
    </div>
  {:else if events.length > 0}
    <div class="event-breakdown">
      {#each events as event}
        {@const percentage =
          getTotalEvents() > 0 ? (event.count / getTotalEvents()) * 100 : 0}
        <div class="event-row">
          <div class="event-header">
            <div class="event-icon" style="color: {event.color}">
              <i class="fas {getEventIcon(event.eventType)}"></i>
            </div>
            <span class="event-label">{event.label}</span>
            <span class="event-count">{event.count.toLocaleString()}</span>
          </div>
          <div class="event-bar">
            <div
              class="event-bar-fill"
              style="width: {percentage}%; background: {event.color}"
            ></div>
          </div>
        </div>
      {/each}
      <div class="total-events">
        Total Events: {getTotalEvents().toLocaleString()}
      </div>
    </div>
  {:else}
    <div class="no-data-message">
      <i class="fas fa-info-circle"></i>
      <span
        >No activity events recorded yet. Events will appear as users interact
        with the app.</span
      >
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

  .event-breakdown {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .event-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .event-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .event-icon {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }

  .event-label {
    flex: 1;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
  }

  .event-count {
    font-weight: 600;
    font-size: 14px;
    color: white;
  }

  .event-bar {
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    overflow: hidden;
    margin-left: 38px;
  }

  .event-bar-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.5s ease;
  }

  .total-events {
    margin-top: 8px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    text-align: right;
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

  /* Skeleton styles */
  .skeleton-icon {
    background: rgba(255, 255, 255, 0.1);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-label {
    display: block;
    flex: 1;
    height: 14px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-count {
    display: block;
    width: 40px;
    height: 14px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-bar {
    background: rgba(255, 255, 255, 0.1) !important;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-total {
    width: 100px;
    height: 13px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    margin-left: auto;
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
