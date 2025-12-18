<script lang="ts">
  /**
   * NotificationsWidget - Preview of messages and notifications
   * Quick access to inbox from the dashboard
   */

  import { inboxState } from "$lib/shared/inbox/state/inbox-state.svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";

  // Derived state
  const unreadMessages = $derived(inboxState.unreadMessageCount);
  const unreadNotifications = $derived(inboxState.unreadNotificationCount);
  const totalUnread = $derived(inboxState.totalUnreadCount);
  const recentNotifications = $derived(inboxState.notifications.slice(0, 3));

  function openInbox(tab?: "messages" | "notifications") {
    inboxState.open(tab);
  }

  function formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const then = date instanceof Date ? date : new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  }
</script>

<div class="notifications-widget">
  <div class="widget-header">
    <div class="header-icon" class:has-unread={totalUnread > 0}>
      <i class="fas fa-bell"></i>
      {#if totalUnread > 0}
        <span class="badge">{totalUnread > 99 ? "99+" : totalUnread}</span>
      {/if}
    </div>
    <h3>Notifications</h3>
  </div>

  <div class="widget-content">
    {#if !authState.isAuthenticated}
      <div class="empty-state">
        <i class="fas fa-user-circle"></i>
        <p>Sign in to see notifications</p>
      </div>
    {:else if totalUnread === 0 && recentNotifications.length === 0}
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>You're all caught up!</p>
        <span class="empty-hint">No new notifications</span>
      </div>
    {:else}
      <div class="notification-list">
        <!-- Quick stats -->
        <div class="stats-row">
          <button class="stat-pill" class:has-items={unreadMessages > 0} onclick={() => openInbox("messages")}>
            <i class="fas fa-envelope"></i>
            <span>{unreadMessages} messages</span>
          </button>
          <button class="stat-pill" class:has-items={unreadNotifications > 0} onclick={() => openInbox("notifications")}>
            <i class="fas fa-bell"></i>
            <span>{unreadNotifications} alerts</span>
          </button>
        </div>

        <!-- Recent notifications preview -->
        {#if recentNotifications.length > 0}
          <div class="recent-list">
            {#each recentNotifications as notification}
              <button class="notification-item" class:unread={!notification.read} onclick={() => openInbox("notifications")}>
                <div class="notification-icon">
                  {#if notification.type === "message-received"}
                    <i class="fas fa-envelope"></i>
                  {:else if notification.type.startsWith("feedback-")}
                    <i class="fas fa-comment-dots"></i>
                  {:else if notification.type === "achievement-unlocked"}
                    <i class="fas fa-trophy"></i>
                  {:else if notification.type === "sequence-liked"}
                    <i class="fas fa-heart"></i>
                  {:else if notification.type === "user-followed"}
                    <i class="fas fa-user-plus"></i>
                  {:else}
                    <i class="fas fa-bell"></i>
                  {/if}
                </div>
                <div class="notification-content">
                  <span class="notification-title">{notification.message}</span>
                  <span class="notification-time">{formatTimeAgo(notification.createdAt)}</span>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <button class="view-all-btn" onclick={() => openInbox()}>
    <span>Open Inbox</span>
    <i class="fas fa-arrow-right"></i>
  </button>
</div>

<style>
  .notifications-widget {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    padding: 24px;
    background: color-mix(in srgb, var(--semantic-info, #3b82f6) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--semantic-info, #3b82f6) 22%, transparent);
    border-radius: 24px;
    overflow: hidden;
  }

  .widget-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
  }

  .header-icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: color-mix(in srgb, var(--semantic-info, #3b82f6) 15%, transparent);
    border-radius: 14px;
    color: var(--semantic-info, #3b82f6);
    font-size: 18px;
  }

  .header-icon.has-unread {
    animation: pulse-subtle 2s infinite;
  }

  @keyframes pulse-subtle {
    0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--semantic-info, #3b82f6) 40%, transparent); }
    50% { box-shadow: 0 0 0 4px color-mix(in srgb, var(--semantic-info, #3b82f6) 0%, transparent); }
  }

  .badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    background: var(--semantic-error, #ef4444);
    border-radius: 9px;
    color: white;
    font-size: 0.6875rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .widget-header h3 {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .widget-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 80px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    text-align: center;
    padding: 20px;
    flex: 1;
  }

  .empty-state i {
    font-size: 32px;
    color: color-mix(in srgb, var(--semantic-info, #3b82f6) 40%, transparent);
  }

  .empty-state p {
    margin: 0;
    font-size: 0.9375rem;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
  }

  .empty-hint {
    font-size: 0.8125rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  /* Stats row */
  .stats-row {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
    min-width: 0;
    width: 100%;
  }

  .stat-pill {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 12px;
    background: color-mix(in srgb, var(--semantic-info, #3b82f6) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--semantic-info, #3b82f6) 15%, transparent);
    border-radius: 10px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 150ms ease;
  }

  .stat-pill span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stat-pill.has-items {
    color: var(--semantic-info, #3b82f6);
    background: color-mix(in srgb, var(--semantic-info, #3b82f6) 12%, transparent);
  }

  .stat-pill:hover {
    background: color-mix(in srgb, var(--semantic-info, #3b82f6) 18%, transparent);
    transform: translateY(-1px);
  }

  .stat-pill i {
    font-size: 12px;
  }

  /* Recent notifications */
  .recent-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    width: 100%;
  }

  .notification-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: color-mix(in srgb, var(--semantic-info, #3b82f6) 6%, transparent);
    border: 1px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    transition: all 150ms ease;
    text-align: left;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
  }

  .notification-item:hover {
    background: color-mix(in srgb, var(--semantic-info, #3b82f6) 12%, transparent);
    border-color: color-mix(in srgb, var(--semantic-info, #3b82f6) 20%, transparent);
  }

  .notification-item.unread {
    background: color-mix(in srgb, var(--semantic-info, #3b82f6) 12%, transparent);
    border-color: color-mix(in srgb, var(--semantic-info, #3b82f6) 25%, transparent);
  }

  .notification-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: color-mix(in srgb, var(--semantic-info, #3b82f6) 15%, transparent);
    border-radius: 8px;
    color: var(--semantic-info, #3b82f6);
    font-size: 14px;
    flex-shrink: 0;
  }

  .notification-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .notification-title {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .notification-time {
    font-size: 0.6875rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .view-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: var(--min-touch-target);
    padding: 14px 20px;
    background: linear-gradient(
      135deg,
      var(--semantic-info, #3b82f6) 0%,
      color-mix(in srgb, var(--semantic-info, #3b82f6) 80%, black) 100%
    );
    border: none;
    border-radius: 14px;
    color: white;
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 150ms ease;
    margin-top: auto;
  }

  .view-all-btn:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
  }

  .view-all-btn i {
    font-size: 14px;
  }

  @media (max-width: 768px) {
    .notifications-widget {
      padding: 20px;
      border-radius: 20px;
    }

    .header-icon {
      width: 40px;
      height: 40px;
      font-size: 16px;
    }

    .widget-header h3 {
      font-size: 1rem;
    }

    .view-all-btn {
      min-height: 44px;
      padding: 12px 16px;
      font-size: 0.875rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .header-icon.has-unread {
      animation: none;
    }

    .stat-pill,
    .notification-item,
    .view-all-btn {
      transition: none;
    }

    .stat-pill:hover,
    .view-all-btn:hover {
      transform: none;
    }
  }
</style>
