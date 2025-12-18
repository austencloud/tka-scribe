<script lang="ts">
  /**
   * InboxNotificationItem
   *
   * Simple notification card - Facebook/Instagram style
   */

  import { onMount } from "svelte";
  import type { UserNotification } from "$lib/features/feedback/domain/models/notification-models";
  import { formatRelativeTimeVerbose } from "../../utils/format";
  import { goto } from "$app/navigation";
  import { inboxState } from "../../state/inbox-state.svelte";
  import { handleModuleChange } from "$lib/shared/navigation-coordinator/navigation-coordinator.svelte";
  import { setNotificationTargetFeedback } from "$lib/features/feedback/state/notification-action-state.svelte";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";

  interface Props {
    notification: UserNotification;
    wasUnread?: boolean; // Track if it was unread when first rendered
  }

  let { notification, wasUnread = false }: Props = $props();

  // Track if this notification just became read (for animation)
  let justMarkedRead = $state(false);

  // Watch for read state changes to trigger animation
  $effect(() => {
    if (wasUnread && notification.read && !justMarkedRead) {
      justMarkedRead = true;
      // Reset after animation completes (1.8s total)
      setTimeout(() => {
        justMarkedRead = false;
      }, 1800);
    }
  });

  // Haptic feedback service
  let hapticService: IHapticFeedbackService | undefined;

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(
      TYPES.IHapticFeedbackService
    );
  });

  // Get icon based on notification type
  function getIcon(type: UserNotification["type"]): string {
    switch (type) {
      case "feedback-resolved":
        return "fa-check-circle";
      case "feedback-in-progress":
        return "fa-clock";
      case "feedback-needs-info":
        return "fa-question-circle";
      case "feedback-response":
        return "fa-comment";
      case "sequence-liked":
        return "fa-heart";
      case "user-followed":
        return "fa-user-plus";
      case "achievement-unlocked":
        return "fa-trophy";
      case "message-received":
        return "fa-envelope";
      case "admin-new-user-signup":
        return "fa-user-check";
      case "system-announcement":
        return "fa-bullhorn";
      default:
        return "fa-bell";
    }
  }

  // Get color based on notification type
  function getColor(type: UserNotification["type"]): string {
    switch (type) {
      case "feedback-resolved":
        return "var(--semantic-success, #22c55e)";
      case "feedback-in-progress":
        return "var(--semantic-warning, #f59e0b)";
      case "feedback-needs-info":
        return "var(--semantic-info, #3b82f6)";
      case "sequence-liked":
        return "#ef4444";
      case "user-followed":
        return "var(--theme-accent, #3b82f6)";
      case "achievement-unlocked":
        return "#f59e0b";
      case "message-received":
        return "#8b5cf6";
      default:
        return "var(--theme-text-dim, rgba(255, 255, 255, 0.6))";
    }
  }

  // Handle card click - navigate directly (Facebook/Instagram pattern)
  async function handleCardClick() {
    hapticService?.trigger("selection");

    // Deep-link to relevant content based on notification type
    const n = notification as unknown as Record<string, unknown>;

    switch (notification.type) {
      case "feedback-resolved":
      case "feedback-in-progress":
      case "feedback-needs-info":
      case "feedback-response":
        // Navigate to My Feedback tab via module change
        if (n["feedbackId"]) {
          setNotificationTargetFeedback(n["feedbackId"] as string);
          inboxState.close();
          await handleModuleChange("feedback", "my-feedback");
        }
        break;

      case "sequence-liked":
        // Navigate to the sequence
        if (n["sequenceId"]) {
          inboxState.close();
          goto(`/sequence/${n["sequenceId"]}`);
        }
        break;

      case "user-followed":
        // Navigate to the follower's profile
        if (n["fromUserId"]) {
          inboxState.close();
          goto(`/profile/${n["fromUserId"]}`);
        }
        break;

      case "message-received":
        // Switch to messages tab and open conversation
        if (n["conversationId"]) {
          inboxState.setTab("messages");
          // The ConversationList will be shown, user can click the conversation
        }
        break;

      case "achievement-unlocked":
        // Navigate to dashboard (achievements are shown via gamification panel)
        inboxState.close();
        await handleModuleChange("dashboard", "overview");
        break;

      case "admin-new-user-signup":
        // Navigate to the new user's profile
        if (n["newUserId"]) {
          inboxState.close();
          goto(`/profile/${n["newUserId"]}`);
        }
        break;

      case "system-announcement":
        // Navigate to action URL if provided
        if (n["actionUrl"]) {
          inboxState.close();
          goto(n["actionUrl"] as string);
        }
        break;

      default:
        // No specific navigation for other types
        break;
    }
  }

  function handleCardKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  }
</script>

<div
  class="notification-item"
  class:unread={!notification.read}
  class:just-marked-read={justMarkedRead}
  onclick={handleCardClick}
  onkeydown={handleCardKeydown}
  role="button"
  tabindex="0"
  aria-label="{notification.message}{!notification.read ? ' (unread)' : ''}"
>
  <!-- Unread indicator (animates out when marked as read) -->
  {#if !notification.read || justMarkedRead}
    <span
      class="unread-dot"
      class:fading-out={justMarkedRead}
      aria-hidden="true"
    ></span>
  {/if}

  <!-- Icon -->
  <div class="icon" style="--icon-color: {getColor(notification.type)}">
    <i class="fas {getIcon(notification.type)}"></i>
  </div>

  <!-- Content -->
  <div class="content">
    <p class="message">{notification.message}</p>
    <span class="time">{formatRelativeTimeVerbose(notification.createdAt)}</span>
  </div>

  <!-- Chevron indicator -->
  <div class="chevron">
    <i class="fas fa-chevron-right" aria-hidden="true"></i>
  </div>
</div>

<style>
  .notification-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    min-height: 64px;
    padding: 16px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    text-align: left;
    cursor: pointer;
    transition:
      background 0.2s ease,
      transform 0.2s ease;
  }

  .notification-item:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
  }

  .notification-item:active {
    transform: scale(0.995);
  }

  .notification-item:focus-visible {
    outline: none;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.06));
    box-shadow: inset 0 0 0 2px
      color-mix(in srgb, var(--theme-accent) 50%, transparent);
  }

  .notification-item.unread {
    background: color-mix(in srgb, var(--theme-accent) 5%, transparent);
  }

  /* Animation when notification is marked as read */
  .notification-item.just-marked-read {
    animation: markAsRead 1.8s ease-out;
  }

  @keyframes markAsRead {
    0% {
      background: color-mix(in srgb, var(--theme-accent) 25%, transparent);
      transform: scale(1.03);
    }
    40% {
      background: color-mix(in srgb, var(--theme-accent) 20%, transparent);
      transform: scale(1.02);
    }
    70% {
      background: color-mix(in srgb, var(--theme-accent) 8%, transparent);
      transform: scale(1.01);
    }
    100% {
      background: transparent;
      transform: scale(1);
    }
  }

  /* Unread dot indicator */
  .unread-dot {
    position: absolute;
    left: 6px;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    background: var(--theme-accent, #3b82f6);
    border-radius: 50%;
    /* No pulsing animation - static dot */
  }

  .unread-dot.fading-out {
    animation: dotFadeOut 0.8s ease-out forwards;
  }

  @keyframes dotFadeOut {
    0% {
      opacity: 1;
      transform: translateY(-50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(-50%) scale(0);
    }
  }

  /* Icon */
  .icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--icon-color) 15%, transparent);
    border-radius: 50%;
    font-size: 14px;
    color: var(--icon-color);
    transition: transform 0.2s ease;
  }

  .notification-item:hover .icon {
    transform: scale(1.1);
  }

  /* Content */
  .content {
    flex: 1;
    min-width: 0;
  }

  .message {
    margin: 0 0 4px;
    font-size: var(--font-size-min, 14px);
    line-height: 1.4;
    color: var(--theme-text, #ffffff);
    transition: font-weight 0.3s ease;
  }

  .unread .message {
    font-weight: 500;
  }

  .just-marked-read .message {
    animation: messageUnbold 0.8s ease-out forwards;
  }

  @keyframes messageUnbold {
    0% {
      font-weight: 500;
    }
    100% {
      font-weight: 400;
    }
  }

  .time {
    font-size: var(--font-size-compact, 12px);
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  /* Chevron indicator */
  .chevron {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
    font-size: 12px;
    transition: all 0.2s ease;
  }

  .notification-item:hover .chevron {
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
    transform: translateX(2px);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .notification-item,
    .icon,
    .chevron,
    .unread-dot,
    .message {
      transition: none !important;
      animation: none !important;
    }

    .notification-item.just-marked-read {
      animation: none !important;
    }

    .unread-dot.fading-out {
      display: none;
    }

    .just-marked-read .message {
      animation: none !important;
      font-weight: 400;
    }
  }
</style>
