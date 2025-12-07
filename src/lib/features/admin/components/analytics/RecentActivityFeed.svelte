<script lang="ts">
  import type {
    RecentActivityEvent,
    EventTypeBreakdown,
  } from "../../services/contracts/IAnalyticsDataService";
  import {
    formatTimestamp,
    formatEventType,
    getEventIcon,
    formatModuleLabel,
  } from "./utils";

  interface Props {
    activities: RecentActivityEvent[];
    eventBreakdown: EventTypeBreakdown[];
    loading?: boolean;
  }

  let { activities, eventBreakdown, loading = false }: Props = $props();

  function getEventColor(eventType: string): string {
    return (
      eventBreakdown.find((e) => e.eventType === eventType)?.color ?? "#94a3b8"
    );
  }
</script>

<section class="section">
  <h3><i class="fas fa-stream"></i> Recent Activity</h3>
  {#if loading}
    <div class="activity-feed">
      {#each Array(5) as _}
        <div class="activity-item">
          <div class="activity-user-avatar">
            <div class="user-avatar-placeholder skeleton-avatar"></div>
          </div>
          <div class="activity-main">
            <div class="activity-header-row">
              <span class="skeleton-name"></span>
              <span class="skeleton-time"></span>
            </div>
            <div class="activity-action-row">
              <div class="skeleton-action-icon"></div>
              <span class="skeleton-action"></span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else if activities.length > 0}
    <div class="activity-feed">
      {#each activities as activity}
        <div class="activity-item">
          <div class="activity-user-avatar">
            {#if activity.user?.photoURL}
              <img
                src={activity.user.photoURL}
                alt={activity.user.displayName}
                class="user-avatar"
              />
            {:else}
              <div class="user-avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>
            {/if}
          </div>

          <div class="activity-main">
            <div class="activity-header-row">
              <span class="activity-user-name"
                >{activity.user?.displayName ?? "Unknown User"}</span
              >
              <span class="activity-time"
                >{formatTimestamp(activity.timestamp)}</span
              >
            </div>
            <div class="activity-action-row">
              <div
                class="activity-icon-small"
                style="color: {getEventColor(activity.eventType)}"
              >
                <i class="fas {getEventIcon(activity.eventType)}"></i>
              </div>
              <span class="activity-type"
                >{formatEventType(activity.eventType)}</span
              >
              {#if activity.metadata?.["sequenceWord"]}
                <span class="activity-detail"
                  >"{activity.metadata["sequenceWord"]}"</span
                >
              {:else if activity.metadata?.["module"]}
                <span class="activity-detail"
                  >{formatModuleLabel(
                    activity.metadata["module"] as string
                  )}</span
                >
              {:else if activity.metadata?.["settingKey"]}
                <span class="activity-detail"
                  >{activity.metadata["settingKey"]}</span
                >
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="no-data-message">
      <i class="fas fa-info-circle"></i>
      <span
        >No recent activity recorded yet. Activity will appear as users interact
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

  .activity-feed {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 500px;
    overflow-y: auto;
  }

  .activity-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 10px;
    transition: background 0.2s;
  }

  .activity-item:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .activity-user-avatar {
    flex-shrink: 0;
  }

  .user-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .user-avatar-placeholder {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.4);
    font-size: 16px;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .activity-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .activity-header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .activity-user-name {
    font-size: 14px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .activity-action-row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .activity-icon-small {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
  }

  .activity-type {
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.7);
  }

  .activity-detail {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .activity-time {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
    white-space: nowrap;
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

  @media (max-width: 768px) {
    .activity-feed {
      max-height: 300px;
    }
  }

  /* Skeleton styles */
  .skeleton-avatar {
    background: rgba(255, 255, 255, 0.1);
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-name {
    display: block;
    width: 100px;
    height: 14px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-time {
    display: block;
    width: 52px;
    height: 12px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 3px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-action-icon {
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  .skeleton-action {
    display: block;
    width: 120px;
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
