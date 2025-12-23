<script lang="ts">
  /**
   * AlertsWidget - Notifications/alerts feed
   * Shows achievements, likes, follows, feedback updates
   * Excludes system announcements (those go in the banner)
   */

  import { inboxState } from "$lib/shared/inbox/state/inbox-state.svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import type { UserNotification, FeedbackNotification } from "$lib/features/feedback/domain/models/notification-models";
  import type { Props } from "../Dashboard.svelte";

  let { dashboardState } = $props<{
    dashboardState: ReturnType<import("../../state/dashboard-state.svelte")["createDashboard"]>;
  }>();

  // Filter out system announcements - those go in the banner
  const alertNotifications = $derived(
    inboxState.notifications
      .filter(n => n.type !== "system-announcement")
      .slice(0, 5)
  );

  const unreadCount = $derived(
    inboxState.notifications.filter(n => !n.read && n.type !== "system-announcement").length
  );

  async function openNotification(notification: UserNotification) {
    // If it's a feedback notification, open the detail panel in dashboard
    if (notification.type.startsWith("feedback-")) {
      const feedbackNotif = notification as FeedbackNotification;
      await loadAndOpenFeedback(feedbackNotif.feedbackId);
      return;
    }

    // For other notifications, use existing behavior
    inboxState.openToNotification(notification.id);
  }

  async function loadAndOpenFeedback(feedbackId: string) {
    try {
      // Dynamically import feedback service to load the item
      const { myFeedbackService } = await import(
        "$lib/features/feedback/services/implementations/MyFeedbackService"
      );
      const userId = authState.effectiveUserId;
      if (!userId) return;

      const feedbackItem = await myFeedbackService.getMyFeedbackItem(userId, feedbackId);
      if (feedbackItem) {
        dashboardState.openFeedbackDetail(feedbackItem);
      }
    } catch (error) {
      console.error("[AlertsWidget] Failed to load feedback item:", error);
    }
  }

  function openAllAlerts() {
    inboxState.open("notifications");
  }

  function getNotificationIcon(type: UserNotification["type"]): string {
    switch (type) {
      case "feedback-resolved": return "fa-check-circle";
      case "feedback-in-progress": return "fa-spinner";
      case "feedback-needs-info": return "fa-question-circle";
      case "feedback-response": return "fa-comment";
      case "sequence-liked": return "fa-heart";
      case "user-followed": return "fa-user-plus";
      case "achievement-unlocked": return "fa-trophy";
      case "message-received": return "fa-envelope";
      case "admin-new-user-signup": return "fa-user-plus";
      default: return "fa-bell";
    }
  }

  function getNotificationColor(type: UserNotification["type"]): string {
    switch (type) {
      case "feedback-resolved": return "#10b981";
      case "feedback-in-progress": return "#f59e0b";
      case "feedback-needs-info": return "#8b5cf6";
      case "feedback-response": return "#3b82f6";
      case "sequence-liked": return "#ec4899";
      case "user-followed": return "#06b6d4";
      case "achievement-unlocked": return "#f59e0b";
      case "message-received": return "#8b5cf6";
      default: return "#6366f1";
    }
  }

  function formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const then = date instanceof Date ? date : new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return then.toLocaleDateString();
  }
</script>

<div class="alerts-widget">
  <div class="widget-header">
    <div class="header-left">
      <div class="header-icon">
        <i class="fas fa-bell"></i>
      </div>
      <h3>Alerts</h3>
    </div>
    {#if unreadCount > 0}
      <span class="unread-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
    {/if}
  </div>

  <div class="widget-content">
    {#if !authState.isAuthenticated}
      <div class="empty-state">
        <i class="fas fa-user-circle"></i>
        <p>Sign in to see alerts</p>
      </div>
    {:else if alertNotifications.length === 0}
      <div class="empty-state">
        <i class="fas fa-bell-slash"></i>
        <p>No alerts yet</p>
        <span class="empty-hint">We'll notify you here</span>
      </div>
    {:else}
      <div class="alerts-list">
        {#each alertNotifications as notification}
          <button
            class="alert-item"
            class:unread={!notification.read}
            onclick={() => openNotification(notification)}
          >
            <div
              class="alert-icon"
              style="--icon-color: {getNotificationColor(notification.type)}"
            >
              <i class="fas {getNotificationIcon(notification.type)}"></i>
            </div>
            <div class="alert-content">
              <span class="alert-message">{notification.message}</span>
              <span class="alert-time">{formatTimeAgo(notification.createdAt)}</span>
            </div>
            {#if !notification.read}
              <span class="unread-dot"></span>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <button class="view-all-btn" onclick={openAllAlerts}>
    <span>All Alerts</span>
    <i class="fas fa-arrow-right"></i>
  </button>
</div>

<style>
  .alerts-widget {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    padding: 16px;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.6));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 20px;
    overflow: hidden;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  }

  .widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: color-mix(in srgb, var(--semantic-info, #3b82f6) 25%, var(--theme-card-bg, rgba(0, 0, 0, 0.3)));
    border-radius: 10px;
    color: var(--semantic-info, #3b82f6);
    font-size: 14px;
  }

  .widget-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .unread-badge {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: var(--semantic-error, #ef4444);
    border-radius: 10px;
    color: white;
    font-size: 0.6875rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .widget-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-align: center;
    padding: 16px;
    flex: 1;
  }

  .empty-state i {
    font-size: 24px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
  }

  .empty-state p {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .empty-hint {
    font-size: 0.75rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .alerts-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .alert-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.2));
    border: 1px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    transition: all 150ms ease;
    text-align: left;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .alert-item:hover {
    background: var(--theme-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .alert-item.unread {
    background: color-mix(in srgb, var(--semantic-info, #3b82f6) 10%, var(--theme-card-bg, rgba(0, 0, 0, 0.2)));
    border-color: color-mix(in srgb, var(--semantic-info, #3b82f6) 20%, transparent);
  }

  .alert-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--icon-color, #3b82f6) 20%, var(--theme-card-bg, rgba(0, 0, 0, 0.3)));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--icon-color, #3b82f6);
    font-size: 13px;
  }

  .alert-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .alert-message {
    font-size: 0.75rem;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .alert-time {
    font-size: 0.6875rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .unread-dot {
    width: 8px;
    height: 8px;
    background: var(--semantic-info, #3b82f6);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .view-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
    padding: 10px 16px;
    margin-top: 8px;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.3));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease;
    flex-shrink: 0;
  }

  .view-all-btn:hover {
    background: var(--theme-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.15));
  }

  .view-all-btn i {
    font-size: 12px;
  }

  @media (max-width: 768px) {
    .alerts-widget {
      padding: 14px;
      border-radius: 16px;
    }

    .header-icon {
      width: 32px;
      height: 32px;
      font-size: 13px;
    }

    .widget-header h3 {
      font-size: 0.9375rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .alert-item,
    .view-all-btn {
      transition: none;
    }
  }
</style>
