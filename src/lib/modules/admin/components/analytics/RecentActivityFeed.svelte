<script lang="ts">
  import type { RecentActivityEvent, EventTypeBreakdown } from "../../services/contracts";
  import { formatTimestamp, formatEventType, getEventIcon, formatModuleLabel } from "./utils";

  interface Props {
    activities: RecentActivityEvent[];
    eventBreakdown: EventTypeBreakdown[];
  }

  let { activities, eventBreakdown }: Props = $props();

  function getEventColor(eventType: string): string {
    return eventBreakdown.find(e => e.eventType === eventType)?.color ?? '#94a3b8';
  }
</script>

<section class="section">
  <h3><i class="fas fa-stream"></i> Recent Activity</h3>
  {#if activities.length > 0}
    <div class="activity-feed">
      {#each activities as activity}
        <div class="activity-item">
          <div class="activity-user-avatar">
            {#if activity.user?.photoURL}
              <img src={activity.user.photoURL} alt={activity.user.displayName} class="user-avatar" />
            {:else}
              <div class="user-avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>
            {/if}
          </div>

          <div class="activity-main">
            <div class="activity-header-row">
              <span class="activity-user-name">{activity.user?.displayName ?? "Unknown User"}</span>
              <span class="activity-time">{formatTimestamp(activity.timestamp)}</span>
            </div>
            <div class="activity-action-row">
              <div class="activity-icon-small" style="color: {getEventColor(activity.eventType)}">
                <i class="fas {getEventIcon(activity.eventType)}"></i>
              </div>
              <span class="activity-type">{formatEventType(activity.eventType)}</span>
              {#if activity.metadata?.["sequenceWord"]}
                <span class="activity-detail">"{activity.metadata["sequenceWord"]}"</span>
              {:else if activity.metadata?.["module"]}
                <span class="activity-detail">{formatModuleLabel(activity.metadata["module"] as string)}</span>
              {:else if activity.metadata?.["settingKey"]}
                <span class="activity-detail">{activity.metadata["settingKey"]}</span>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <div class="no-data-message">
      <i class="fas fa-info-circle"></i>
      <span>No recent activity recorded yet. Activity will appear as users interact with the app.</span>
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
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .user-avatar-placeholder {
    width: 40px;
    height: 40px;
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
</style>
