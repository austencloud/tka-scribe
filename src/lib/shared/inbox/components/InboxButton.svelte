<script lang="ts">
  /**
   * InboxButton
   *
   * Button with badge that opens the combined inbox drawer.
   * Shows total unread count (messages + notifications).
   * Supports collapsed (icon only) and expanded (icon + label) modes.
   * Reactive to preview mode changes (View As feature).
   */

  import { onMount } from "svelte";
  import { inboxState } from "../state/inbox-state.svelte";
  import { conversationService } from "$lib/shared/messaging/services/implementations/ConversationService";
  import { notificationService } from "$lib/features/feedback/services/implementations/NotificationService";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import { userPreviewState } from "$lib/shared/debug/state/user-preview-state.svelte";
  import { loadFeatureModule } from "$lib/shared/inversify/container";

  let { isCollapsed = true } = $props<{ isCollapsed?: boolean }>();

  let unsubscribeMessages: (() => void) | null = null;
  let unsubscribeNotifications: (() => void) | null = null;
  let messagingModuleLoaded = $state(false);

  onMount(async () => {
    // Load messaging module on mount
    await loadFeatureModule("messaging");
    messagingModuleLoaded = true;
  });

  // Create a derived value that tracks preview mode (View As feature)
  const currentUserId = $derived(
    userPreviewState.isActive && userPreviewState.data.profile
      ? userPreviewState.data.profile.uid
      : authState.user?.uid
  );

  // Reactive subscription that updates when user changes (including preview mode)
  $effect(() => {
    const userId = currentUserId;
    const isReady = messagingModuleLoaded;

    const cleanup = () => {
      unsubscribeMessages?.();
      unsubscribeNotifications?.();
      unsubscribeMessages = null;
      unsubscribeNotifications = null;
    };

    if (!isReady || !userId) {
      return cleanup;
    }

    // Subscribe to conversations
    unsubscribeMessages = conversationService.subscribeToConversations(
      (conversations) => {
        inboxState.setConversations(conversations);
      }
    );

    // Subscribe to notifications
    unsubscribeNotifications = notificationService.subscribeToNotifications(
      userId,
      (notifications) => {
        inboxState.setNotifications(notifications);
      }
    );

    return cleanup;
  });

  function handleClick() {
    inboxState.open();
  }

  // Format badge count
  function formatCount(count: number): string {
    if (count > 99) return "99+";
    return count.toString();
  }
</script>

<button
  class="inbox-button"
  class:collapsed={isCollapsed}
  class:has-unread={inboxState.totalUnreadCount > 0}
  onclick={handleClick}
  aria-label="Open inbox{inboxState.totalUnreadCount > 0
    ? `, ${inboxState.totalUnreadCount} unread`
    : ''}"
  aria-haspopup="dialog"
>
  <div class="button-icon">
    <i class="fas fa-inbox" aria-hidden="true"></i>
    {#if inboxState.totalUnreadCount > 0}
      <span class="badge" aria-hidden="true">
        {formatCount(inboxState.totalUnreadCount)}
      </span>
    {/if}
  </div>
  {#if !isCollapsed}
    <span class="button-label">Inbox</span>
  {/if}
</button>

<style>
  .inbox-button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.03));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    border-radius: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease,
      transform 0.15s ease,
      box-shadow 0.2s ease;
    font-size: 14px;
    font-weight: 500;
  }

  .inbox-button:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke-strong, rgba(255, 255, 255, 0.12));
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .inbox-button:active {
    transform: scale(0.98);
  }

  .inbox-button.has-unread {
    border-color: color-mix(in srgb, var(--theme-accent) 30%, transparent);
  }

  .inbox-button.has-unread:hover {
    border-color: color-mix(in srgb, var(--theme-accent) 50%, transparent);
    box-shadow: 0 0 12px
      color-mix(in srgb, var(--theme-accent) 20%, transparent);
  }

  .inbox-button.collapsed {
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    padding: 0;
    justify-content: center;
    border-radius: 12px;
  }

  .button-icon {
    position: relative;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    border-radius: 8px;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.05));
    transition:
      background 0.2s ease,
      transform 0.2s ease;
  }

  .inbox-button.collapsed .button-icon {
    width: 100%;
    height: 100%;
    background: transparent;
    border-radius: 12px;
  }

  .inbox-button:hover .button-icon {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
    transform: scale(1.05);
  }

  .inbox-button.collapsed:hover .button-icon {
    background: transparent;
  }

  .button-label {
    flex: 1;
    text-align: left;
    font-weight: 500;
  }

  .badge {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: var(--semantic-error, #ef4444);
    border-radius: 10px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    line-height: 20px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    animation: badgePop 0.3s ease;
  }

  @keyframes badgePop {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
    }
  }

  .inbox-button:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px color-mix(in srgb, var(--theme-accent) 70%, transparent),
      inset 0 0 0 1px color-mix(in srgb, var(--theme-accent) 30%, transparent);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .inbox-button,
    .button-icon,
    .badge {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
