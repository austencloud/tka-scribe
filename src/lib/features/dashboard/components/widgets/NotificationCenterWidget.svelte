<!--
  NotificationCenterWidget - Dashboard Notification Widget

  Displays recent notifications with quick access to all notifications.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import { createNotificationState } from "$lib/features/feedback/state/notification-state.svelte";
  import NotificationItem from "$lib/features/feedback/components/NotificationItem.svelte";
  import { navigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
  import type { UserNotification } from "$lib/features/feedback/domain/models/notification-models";

  const notificationState = createNotificationState();

  // Show only first 5 notifications
  const recentNotifications = $derived(notificationState.notifications.slice(0, 5));
  const hasMore = $derived(notificationState.notifications.length > 5);

  onMount(() => {
    if (authStore.isAuthenticated) {
      notificationState.init();
    }

    return () => {
      notificationState.cleanup();
    };
  });

  // Watch auth state changes
  $effect(() => {
    if (authStore.isAuthenticated) {
      notificationState.init();
    } else {
      notificationState.cleanup();
    }
  });

  function handleNotificationAction(notification: UserNotification) {
    // Navigate based on notification type
    if (notification.type.startsWith("feedback-")) {
      navigationState.navigateToModule("feedback", "my-feedback");
    } else if (notification.type.startsWith("sequence-")) {
      // Could navigate to specific sequence or discover module
      navigationState.navigateToModule("discover", "gallery");
    }
  }

  function viewAllNotifications() {
    // Navigate to a notifications view (settings for now, could be a dedicated view later)
    navigationState.navigateToModule("settings", "notifications");
  }
</script>

<div class="notification-center-widget">
  <div class="widget-header">
    <div class="header-left">
      <i class="fas fa-bell"></i>
      <h3>Notifications</h3>
    </div>
    {#if notificationState.unreadCount > 0}
      <span class="unread-badge">{notificationState.unreadCount}</span>
    {/if}
  </div>

  <div class="widget-content">
    {#if !authStore.isAuthenticated}
      <div class="empty-state">
        <i class="fas fa-bell-slash"></i>
        <p>Sign in to see notifications</p>
      </div>
    {:else if notificationState.isLoading}
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Loading notifications...</p>
      </div>
    {:else if recentNotifications.length === 0}
      <div class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No notifications yet</p>
        <span class="empty-hint">You'll be notified when there's activity</span>
      </div>
    {:else}
      <div class="notifications-list">
        {#each recentNotifications as notification (notification.id)}
          <NotificationItem {notification} onAction={handleNotificationAction} />
        {/each}
      </div>

      {#if hasMore}
        <button class="view-all-button" onclick={viewAllNotifications}>
          <span>View all notifications</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .notification-center-widget {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    overflow: hidden;
  }

  /* ============================================================================
     WIDGET HEADER
     ============================================================================ */
  .widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .widget-header i {
    font-size: 18px;
    color: rgba(239, 68, 68, 0.8);
  }

  .widget-header h3 {
    font-size: 16px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0;
  }

  .unread-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 8px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    font-size: 12px;
    font-weight: 700;
    border-radius: 12px;
  }

  /* ============================================================================
     WIDGET CONTENT
     ============================================================================ */
  .widget-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }

  /* ============================================================================
     NOTIFICATIONS LIST
     ============================================================================ */
  .notifications-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* ============================================================================
     EMPTY/LOADING STATES
     ============================================================================ */
  .empty-state,
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 32px 24px;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
  }

  .empty-state i,
  .loading-state i {
    font-size: 32px;
  }

  .empty-state p,
  .loading-state p {
    font-size: 14px;
    margin: 0;
  }

  .empty-hint {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.4);
  }

  /* ============================================================================
     VIEW ALL BUTTON
     ============================================================================ */
  .view-all-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    margin-top: 8px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .view-all-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.95);
  }

  .view-all-button i {
    font-size: 12px;
    transition: transform 0.2s ease;
  }

  .view-all-button:hover i {
    transform: translateX(4px);
  }

  /* ============================================================================
     SCROLLBAR
     ============================================================================ */
  .widget-content::-webkit-scrollbar {
    width: 6px;
  }

  .widget-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 3px;
  }

  .widget-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
    border-radius: 3px;
  }

  .widget-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .view-all-button,
    .view-all-button i {
      transition: none;
    }
  }
</style>
