<!--
  NotificationItem - Single Notification Card

  Displays a notification with icon, message, and action button.
-->
<script lang="ts">
  import type { UserNotification } from "../domain/models/notification-models";
  import { NOTIFICATION_TYPE_CONFIG } from "../domain/models/notification-models";
  import { notificationService } from "../services/implementations/NotificationService";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";

  let {
    notification,
    onAction,
  } = $props<{
    notification: UserNotification;
    onAction?: (notification: UserNotification) => void;
  }>();

  const config = $derived(NOTIFICATION_TYPE_CONFIG[notification.type]);

  // Format timestamp
  const timeAgo = $derived(() => {
    const now = Date.now();
    const then = notification.createdAt.getTime();
    const diff = now - then;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "Just now";
    if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
    if (diff < day) return `${Math.floor(diff / hour)}h ago`;
    if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;

    // Format as date
    return notification.createdAt.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  });

  async function handleClick() {
    // Mark as read
    const user = authStore.user;
    if (user && !notification.read) {
      await notificationService.markAsRead(user.uid, notification.id);
    }

    // Trigger action
    onAction?.(notification);
  }
</script>

<button
  class="notification-item"
  class:unread={!notification.read}
  onclick={handleClick}
  aria-label="View notification: {notification.message}"
>
  <div class="notification-icon" style="background: {config.color};">
    <i class="fas {config.icon}"></i>
  </div>

  <div class="notification-content">
    <div class="notification-header">
      <span class="notification-label">{config.label}</span>
      <span class="notification-time">{timeAgo()}</span>
    </div>
    <p class="notification-message">{notification.message}</p>
    {#if notification.fromUserName}
      <span class="notification-from">from {notification.fromUserName}</span>
    {/if}
  </div>

  {#if !notification.read}
    <div class="unread-indicator"></div>
  {/if}
</button>

<style>
  .notification-item {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    position: relative;
  }

  .notification-item:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .notification-item.unread {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(99, 102, 241, 0.3);
  }

  /* ============================================================================
     NOTIFICATION ICON
     ============================================================================ */
  .notification-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 16px;
    flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  /* ============================================================================
     NOTIFICATION CONTENT
     ============================================================================ */
  .notification-content {
    flex: 1;
    min-width: 0;
  }

  .notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
  }

  .notification-label {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .notification-time {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
  }

  .notification-message {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .notification-from {
    display: block;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 4px;
  }

  /* ============================================================================
     UNREAD INDICATOR
     ============================================================================ */
  .unread-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    flex-shrink: 0;
    margin-top: 4px;
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.5);
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  .notification-item:focus-visible {
    outline: 2px solid rgba(99, 102, 241, 0.7);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .notification-item {
      transition: none;
    }
  }
</style>
