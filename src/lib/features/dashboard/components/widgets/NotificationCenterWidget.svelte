<!--
  NotificationCenterWidget - Dashboard Notification Widget

  Displays recent notifications with quick access to all notifications.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import { createNotificationState } from "$lib/features/feedback/state/notification-state.svelte";
  import NotificationItem from "$lib/features/feedback/components/NotificationItem.svelte";
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import { setNotificationTargetFeedback } from "$lib/features/feedback/state/notification-action-state.svelte";
  import type { UserNotification, FeedbackNotification, AdminNotification } from "$lib/features/feedback/domain/models/notification-models";
  import { discoverNavigationState } from "$lib/features/discover/shared/state/discover-navigation-state.svelte";

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
      // For feedback notifications, set the target feedback ID so MyFeedbackTab can open it
      const feedbackNotif = notification as FeedbackNotification;
      setNotificationTargetFeedback(feedbackNotif.feedbackId);
      handleModuleChange("feedback", "my-feedback");
    } else if (notification.type.startsWith("sequence-")) {
      // Could navigate to specific sequence or discover module
      handleModuleChange("discover", "gallery");
    } else if (notification.type === "admin-new-user-signup") {
      // Navigate to the new user's profile
      const adminNotif = notification as AdminNotification;
      discoverNavigationState.viewCreatorProfile(
        adminNotif.newUserId,
        adminNotif.newUserDisplayName
      );
      handleModuleChange("discover", "creators");
    }
  }

  function handleNotificationDismiss(notificationId: string) {
    // Optimistic update - notification already marked as read in NotificationItem
    // Just need to update our local state if needed
  }

  async function handleMarkAllAsRead() {
    const user = authStore.user;
    if (!user) return;

    // Call service to mark all as read
    const { notificationService } = await import(
      "$lib/features/feedback/services/implementations/NotificationService"
    );
    await notificationService.markAllAsRead(user.uid);
  }

  function viewAllNotifications() {
    // Navigate to a notifications view (settings for now, could be a dedicated view later)
    handleModuleChange("settings", "notifications");
  }
</script>

<div class="notification-center-widget">
  <div class="widget-header">
    <div class="header-left">
      <i class="fas fa-bell"></i>
      <h3>Notifications</h3>
    </div>
    <div class="header-right">
      {#if notificationState.unreadCount > 0}
        <button
          class="mark-all-btn"
          onclick={() => handleMarkAllAsRead()}
          type="button"
          title="Mark all notifications as read"
        >
          Mark all read
        </button>
      {/if}
      {#if notificationState.unreadCount > 0}
        <span class="unread-badge">{notificationState.unreadCount}</span>
      {/if}
    </div>
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
          <NotificationItem
            {notification}
            onAction={handleNotificationAction}
            onDismiss={handleNotificationDismiss}
          />
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
    background: rgba(255, 255, 255, 0.01);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: var(--radius-2026-md);
    overflow: hidden;
    transition: border-color var(--duration-normal) var(--ease-out);
  }

  .notification-center-widget:hover {
    border-color: rgba(255, 255, 255, 0.1);
  }

  /* ============================================================================
     WIDGET HEADER
     ============================================================================ */
  .widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    gap: 12px;
    transition: border-color var(--duration-normal) var(--ease-out);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-right {
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

  .mark-all-btn {
    padding: 4px 8px;
    background: transparent;
    border: none;
    font-size: 0.75rem;
    color: #3b82f6;
    cursor: pointer;
    transition: color var(--duration-fast) var(--ease-out);
    border-radius: 4px;
  }

  .mark-all-btn:hover {
    color: #60a5fa;
  }

  .mark-all-btn:active {
    opacity: 0.8;
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
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
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
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: var(--radius-2026-md);
    color: rgba(255, 255, 255, 0.7);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--duration-normal) var(--ease-out);
  }

  .view-all-button:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
  }

  .view-all-button:active {
    transform: translateY(0);
  }

  .view-all-button i {
    font-size: 12px;
    transition: transform var(--duration-normal) var(--ease-out);
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
    background: transparent;
    border-radius: 3px;
  }

  .widget-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    transition: background var(--duration-fast) var(--ease-out);
  }

  .widget-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* ============================================================================
     ACCESSIBILITY
     ============================================================================ */
  @media (prefers-reduced-motion: reduce) {
    .notification-center-widget,
    .widget-header,
    .mark-all-btn,
    .view-all-button,
    .view-all-button i {
      transition: none;
    }
  }
</style>
