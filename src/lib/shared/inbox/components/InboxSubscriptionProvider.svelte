<!--
  InboxSubscriptionProvider.svelte

  Invisible component that sets up inbox subscriptions globally.
  Should be mounted at the app root level when user is authenticated.

  Subscribes to:
  - Conversations (for unread message counts)
  - Notifications (for unread notification counts)

  This enables badge counts to appear on navigation elements
  without requiring the user to visit the Inbox module first.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { inboxState } from "../state/inbox-state.svelte";
  import { conversationService } from "$lib/shared/messaging/services/implementations/ConversationService";
  import { notificationService } from "$lib/features/feedback/services/implementations/NotificationService";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import { userPreviewState } from "$lib/shared/debug/state/user-preview-state.svelte";
  import { loadFeatureModule } from "$lib/shared/inversify/container";

  let unsubscribeMessages: (() => void) | null = null;
  let unsubscribeNotifications: (() => void) | null = null;
  let messagingModuleLoaded = $state(false);

  onMount(async () => {
    // Load messaging module on mount
    await loadFeatureModule("messaging");
    messagingModuleLoaded = true;
  });

  // Track effective user ID (supports preview/impersonation mode)
  const currentUserId = $derived(
    userPreviewState.isActive && userPreviewState.data.profile
      ? userPreviewState.data.profile.uid
      : authState.user?.uid
  );

  // Set up subscriptions when user is authenticated
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

    // Subscribe to conversations for unread message counts
    unsubscribeMessages = conversationService.subscribeToConversations(
      (conversations) => {
        inboxState.setConversations(conversations);
      }
    );

    // Subscribe to notifications for unread notification counts
    unsubscribeNotifications = notificationService.subscribeToNotifications(
      userId,
      (notifications) => {
        inboxState.setNotifications(notifications);
      }
    );

    return cleanup;
  });
</script>

<!-- This component renders nothing - it just sets up subscriptions -->
