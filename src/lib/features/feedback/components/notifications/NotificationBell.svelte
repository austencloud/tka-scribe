<!-- NotificationBell - Shows unread notification count with dropdown -->
<script lang="ts">
  import { onDestroy } from "svelte";
  import { notificationService } from "../../services/implementations/NotificationService";
  import { NOTIFICATION_TYPE_CONFIG } from "../../domain/models/notification-models";
  import type {
    UserNotification,
    FeedbackNotification,
  } from "../../domain/models/notification-models";
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import { authStore } from "$lib/shared/auth/stores/authStore.svelte";
  import { testPreviewState } from "$lib/shared/debug/state/test-preview-state.svelte";

  // Local component state
  let showDropdown = $state(false);
  let notifications = $state<UserNotification[]>([]);
  let unreadCount = $state(0);
  let isLoading = $state(false);
  let unsubscribe: (() => void) | null = null;
  let activePopup = $state<UserNotification | null>(null);

  // Type guard for feedback notifications
  function isFeedbackNotification(
    n: UserNotification
  ): n is FeedbackNotification {
    return "feedbackId" in n && "feedbackTitle" in n;
  }

  // Get display title for any notification type
  function getNotificationTitle(n: UserNotification): string {
    if (isFeedbackNotification(n)) return n.feedbackTitle;
    if ("sequenceTitle" in n) return n.sequenceTitle;
    if ("achievementName" in n) return n.achievementName || "Achievement";
    if ("title" in n) return n.title;
    return "Notification";
  }

  // Get action ID for notification click
  function getNotificationActionId(n: UserNotification): string | null {
    if (isFeedbackNotification(n)) return n.feedbackId;
    if ("sequenceId" in n) return n.sequenceId;
    return null;
  }

  $effect(() => {
    const isPreview = testPreviewState.isActive;
    const user = authStore.user;

    // If preview is active, use preview data and ensure no live subscription
    if (isPreview) {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      notifications = testPreviewState.notifications as unknown as UserNotification[];
      unreadCount = notifications.filter((n) => !n.read).length;
      isLoading = testPreviewState.isLoading;
      activePopup = notifications.find(
        (n) => n.type === "feedback-resolved" && !n.read
      ) as UserNotification | null;
      return;
    }

    // Normal path: ensure subscription exists
    if (!user) return;
    if (unsubscribe) return; // already subscribed

    isLoading = true;
    unsubscribe = notificationService.subscribeToNotifications(
      user.uid,
      (updated) => {
        notifications = updated;
        unreadCount = updated.filter((n) => !n.read).length;
        isLoading = false;

        const candidate = updated.find(
          (n) => n.type === "feedback-resolved" && !n.read
        );
        if (candidate && candidate.id !== activePopup?.id) {
          activePopup = candidate;
        }
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

  // Mark notification as read without navigation (dismiss)
  async function handleDismiss(notificationId: string) {
    const isPreview = testPreviewState.isActive;

    if (!isPreview) {
      const user = authStore.user;
      if (user) {
        await notificationService.markAsRead(user.uid, notificationId);
      }

      // Optimistic update
      notifications = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
      );
      unreadCount = notifications.filter((n) => !n.read).length;
      if (activePopup?.id === notificationId) {
        activePopup = null;
      }
    }
  }

  // Navigate to context-specific location based on notification type
  async function navigateToNotificationContext(notification: UserNotification) {
    const { type } = notification;

    try {
      switch (type) {
        case "feedback-resolved":
        case "feedback-in-progress":
          // Navigate to my-feedback tab, focus on that item
          await handleModuleChange("feedback", "my-feedback");
          // TODO: Scroll to/highlight notification.feedbackId
          break;

        case "feedback-needs-info":
        case "feedback-response":
          // Navigate to my-feedback, open reply UI
          await handleModuleChange("feedback", "my-feedback");
          // TODO: Open feedback item + focus reply form
          break;

        case "sequence-liked":
          // Open sequence in gallery viewer
          await handleModuleChange("discover", "gallery");
          // TODO: Load notification.sequenceId in viewer
          break;

        case "user-followed":
          // Navigate to creator profile
          await handleModuleChange("discover", "creators");
          // TODO: Load notification.fromUserId profile
          break;

        case "admin-new-user-signup":
          // Navigate to admin user view
          // TODO: Implement admin user management navigation
          break;

        case "system-announcement":
          // Use custom link from notification if available
          if ("actionUrl" in notification && notification.actionUrl) {
            window.location.href = notification.actionUrl;
          }
          break;

        default:
          console.warn(`No action defined for notification type: ${type}`);
      }
    } catch (error) {
      console.error("Error navigating to notification context:", error);
    }
  }

  // Handle notification action button click
  async function handleNotificationAction(notification: UserNotification) {
    const isPreview = testPreviewState.isActive;

    if (!isPreview) {
      const user = authStore.user;
      if (user) {
        await notificationService.markAsRead(user.uid, notification.id);
      }

      // Optimistic update
      notifications = notifications.map((n) =>
        n.id === notification.id ? { ...n, read: true, readAt: new Date() } : n
      );
      unreadCount = notifications.filter((n) => !n.read).length;
      if (activePopup?.id === notification.id) {
        activePopup = null;
      }
    }

    // Navigate to context
    await navigateToNotificationContext(notification);

    // Close dropdown
    showDropdown = false;
  }

  async function handleNotificationClick(
    actionId: string | null,
    notificationId: string,
    options: { navigate?: boolean } = { navigate: true }
  ) {
    const isPreview = testPreviewState.isActive;

    if (!isPreview) {
      const user = authStore.user;
      if (user) {
        await notificationService.markAsRead(user.uid, notificationId);
      }

      // Optimistic update
      notifications = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true, readAt: new Date() } : n
      );
      unreadCount = notifications.filter((n) => !n.read).length;
      if (activePopup?.id === notificationId) {
        activePopup = null;
      }
    }

    if (options.navigate) {
      // Navigate to my-feedback tab
      handleModuleChange("feedback", "my-feedback");
      // Close dropdown
      showDropdown = false;
    }
  }

  async function handlePopupAction(action: "view" | "dismiss" | "later") {
    const current = activePopup;
    if (!current) return;

    if (action === "view") {
      await handleNotificationClick(getNotificationActionId(current), current.id, {
        navigate: true,
      });
      activePopup = null;
      return;
    }

    if (action === "dismiss") {
      await handleNotificationClick(getNotificationActionId(current), current.id, {
        navigate: false,
      });
      activePopup = null;
      return;
    }

    // action === "later": keep unread, hide popup
    activePopup = null;
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
    onclick={() => (showDropdown = !showDropdown)}
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
            <div class="notification-item" class:unread={!notification.read}>
              <button
                class="notification-card"
                onclick={() => handleDismiss(notification.id)}
                type="button"
                title="Click to dismiss"
              >
                <div
                  class="notification-icon"
                  style="--icon-color: {config.color}"
                >
                  <i class="fas {config.icon}"></i>
                </div>
                <div class="notification-content">
                  <span class="notification-title"
                    >{getNotificationTitle(notification)}</span
                  >
                  <span class="notification-message">{notification.message}</span>
                  <span class="notification-time"
                    >{formatDate(notification.createdAt)}</span
                  >
                </div>
                {#if !notification.read}
                  <div class="unread-dot"></div>
                {/if}
              </button>
              <button
                class="notification-action"
                onclick={() => handleNotificationAction(notification)}
                type="button"
                title={config.actionLabel}
              >
                {config.actionLabel}
              </button>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}

  {#if activePopup}
    <div class="notification-popup-backdrop">
      <div class="notification-popup">
        <div class="popup-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="popup-content">
          <p class="popup-label">Feedback resolved</p>
          <h4>{getNotificationTitle(activePopup)}</h4>
          <p class="popup-message">{activePopup.message}</p>
        </div>
        <div class="popup-actions">
          <button class="ghost" type="button" onclick={() => handlePopupAction("later")}>
            Later
          </button>
          <button class="secondary" type="button" onclick={() => handlePopupAction("dismiss")}>
            Dismiss
          </button>
          <button class="primary" type="button" onclick={() => handlePopupAction("view")}>
            View
          </button>
        </div>
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
    width: 52px;
    height: 52px;
    min-width: 52px;
    min-height: 52px;
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
    0%,
    100% {
      transform: rotate(0);
    }
    25% {
      transform: rotate(10deg);
    }
    75% {
      transform: rotate(-10deg);
    }
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
    flex-direction: column;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .notification-item.unread {
    background: rgba(59, 130, 246, 0.05);
  }

  .notification-card {
    display: flex;
    gap: 12px;
    width: 100%;
    padding: 0;
    background: none;
    border: none;
    text-align: left;
    cursor: pointer;
    transition: opacity 0.2s ease;
    position: relative;
  }

  .notification-card:hover {
    opacity: 0.8;
  }

  .notification-action {
    align-self: flex-end;
    padding: 6px 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .notification-action:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }

  .notification-action:active {
    transform: translateY(0);
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

  /* Popup styles */
  .notification-popup-backdrop {
    position: fixed;
    inset: 0;
    background: hsla(0, 0%, 0%, 0.45);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1300;
    padding: 16px;
  }

  .notification-popup {
    width: min(420px, 100%);
    background: hsl(230 15% 6%);
    border: 1px solid hsl(0 0% 100% / 0.06);
    border-radius: 16px;
    box-shadow: 0 18px 48px hsl(0 0% 0% / 0.45);
    padding: 20px;
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 12px;
  }

  .popup-icon {
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #10b981 0%, #16a34a 100%);
    display: grid;
    place-items: center;
    color: white;
    font-size: 20px;
  }

  .popup-content h4 {
    margin: 4px 0;
    font-size: 16px;
    color: white;
  }

  .popup-content .popup-label {
    margin: 0;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: hsl(155 68% 60%);
  }

  .popup-message {
    margin: 4px 0 0;
    color: hsl(0 0% 90%);
    font-size: 14px;
  }

  .popup-actions {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  .popup-actions button {
    border: none;
    border-radius: 10px;
    padding: 10px 14px;
    font-weight: 600;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.15s ease;
  }

  .popup-actions .ghost {
    background: transparent;
    color: hsl(0 0% 80%);
  }

  .popup-actions .secondary {
    background: hsl(230 15% 12%);
    color: hsl(0 0% 95%);
    border: 1px solid hsl(0 0% 100% / 0.08);
  }

  .popup-actions .primary {
    background: linear-gradient(135deg, #10b981 0%, #16a34a 100%);
    color: white;
  }

  .popup-actions button:hover {
    transform: translateY(-1px);
  }

  .popup-actions button:active {
    transform: translateY(0);
  }
</style>
