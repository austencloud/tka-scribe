<!-- NotificationBell - Shows unread notification count with dropdown -->
<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { notificationService } from "../../services/implementations/NotificationService";
  import { NOTIFICATION_TYPE_CONFIG } from "../../domain/models/notification-models";
  import type { UserNotification } from "../../domain/models/notification-models";
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";

  // Local component state
  let showDropdown = $state(false);
  let notifications = $state<UserNotification[]>([]);
  let unreadCount = $state(0);
  let isLoading = $state(false);
  let unsubscribe: (() => void) | null = null;

  onMount(() => {
    const user = authStore.user;
    if (!user) return;

    isLoading = true;

    // Subscribe to real-time updates
    unsubscribe = notificationService.subscribeToNotifications(
      user.uid,
      (updated) => {
        notifications = updated;
        unreadCount = updated.filter((n) => !n.read).length;
        isLoading = false;
      }
    );
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  function formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
  }

  async function handleNotificationClick(feedbackId: string, notificationId: string) {
    const user = authStore.user;
    if (!user) return;

    // Mark as read
    await notificationService.markAsRead(user.uid, notificationId);

    // Optimistic update
    notifications = notifications.map((n) =>
      n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
    );
    unreadCount = notifications.filter((n) => !n.read).length;

    // Navigate to my-feedback tab
    handleModuleChange("feedback", "my-feedback");

    // Close dropdown
    showDropdown = false;
  }

  async function handleMarkAllAsRead() {
    const user = authStore.user;
    if (!user) return;

    await notificationService.markAllAsRead(user.uid);

    // Optimistic update
    notifications = notifications.map((n) => ({
      ...n,
      read: true,
      readAt: new Date(),
    }));
    unreadCount = 0;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(".notification-bell-wrapper")) {
      showDropdown = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="notification-bell-wrapper">
  <button
    class="notification-bell"
    class:has-unread={unreadCount > 0}
    onclick={() => showDropdown = !showDropdown}
    type="button"
    aria-label="Notifications"
  >
    <i class="fas fa-bell"></i>
    {#if unreadCount > 0}
      <span class="unread-badge">
        {unreadCount > 9 ? "9+" : unreadCount}
      </span>
    {/if}
  </button>

  {#if showDropdown}
    <div class="notification-dropdown">
      <header class="dropdown-header">
        <h3>Notifications</h3>
        {#if unreadCount > 0}
          <button
            class="mark-all-btn"
            onclick={() => handleMarkAllAsRead()}
            type="button"
          >
            Mark all read
          </button>
        {/if}
      </header>

      <div class="notification-list">
        {#if notifications.length === 0}
          <div class="empty-state">
            <i class="fas fa-bell-slash"></i>
            <p>No notifications yet</p>
          </div>
        {:else}
          {#each notifications as notification (notification.id)}
            {@const config = NOTIFICATION_TYPE_CONFIG[notification.type]}
            <button
              class="notification-item"
              class:unread={!notification.read}
              onclick={() => handleNotificationClick(notification.feedbackId, notification.id)}
              type="button"
            >
              <div class="notification-icon" style="--icon-color: {config.color}">
                <i class="fas {config.icon}"></i>
              </div>
              <div class="notification-content">
                <span class="notification-title">{notification.feedbackTitle}</span>
                <span class="notification-message">{notification.message}</span>
                <span class="notification-time">{formatDate(notification.createdAt)}</span>
              </div>
              {#if !notification.read}
                <div class="unread-dot"></div>
              {/if}
            </button>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .notification-bell-wrapper {
    position: relative;
  }

  .notification-bell {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
  }

  .notification-bell:hover {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
  }

  .notification-bell.has-unread {
    color: #f59e0b;
    animation: bellShake 0.5s ease;
  }

  @keyframes bellShake {
    0%, 100% { transform: rotate(0); }
    25% { transform: rotate(10deg); }
    75% { transform: rotate(-10deg); }
  }

  .unread-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    background: #ef4444;
    border-radius: 9px;
    font-size: 11px;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .notification-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 320px;
    max-height: 400px;
    background: #1a1a24;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    z-index: 100;
  }

  .dropdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .dropdown-header h3 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .mark-all-btn {
    padding: 4px 8px;
    background: none;
    border: none;
    font-size: 0.75rem;
    color: #3b82f6;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .mark-all-btn:hover {
    color: #60a5fa;
  }

  .notification-list {
    max-height: 340px;
    overflow-y: auto;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    color: rgba(255, 255, 255, 0.4);
    gap: 8px;
  }

  .empty-state i {
    font-size: 24px;
  }

  .empty-state p {
    margin: 0;
    font-size: 0.875rem;
  }

  .notification-item {
    display: flex;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: background 0.2s ease;
    position: relative;
  }

  .notification-item:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  .notification-item.unread {
    background: rgba(59, 130, 246, 0.05);
  }

  .notification-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: color-mix(in srgb, var(--icon-color) 15%, transparent);
    border-radius: 8px;
    color: var(--icon-color);
    font-size: 14px;
    flex-shrink: 0;
  }

  .notification-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .notification-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notification-message {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .notification-time {
    font-size: 0.6875rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .unread-dot {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    background: #3b82f6;
    border-radius: 50%;
  }

  /* Scrollbar */
  .notification-list::-webkit-scrollbar {
    width: 4px;
  }

  .notification-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .notification-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
</style>
