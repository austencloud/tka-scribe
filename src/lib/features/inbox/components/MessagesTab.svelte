<!--
  MessagesTab.svelte - Messages tab for Inbox module

  Manages conversation list, thread view, and compose views.
  Wraps existing inbox components for use in the module context.

  Note: Conversations are subscribed globally by InboxSubscriptionProvider.
  This tab just reads from inboxState - no direct subscription needed.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { inboxState } from "$lib/shared/inbox/state/inbox-state.svelte";
  import { userPreviewState } from "$lib/shared/debug/state/user-preview-state.svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import { toast } from "$lib/shared/toast/state/toast-state.svelte";
  import { conversationService } from "$lib/shared/messaging/services/implementations/ConversationService";
  import { messagingService } from "$lib/shared/messaging/services/implementations/MessagingService";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedbackService } from "$lib/shared/application/services/contracts/IHapticFeedbackService";
  import ConversationList from "$lib/shared/inbox/components/messages/ConversationList.svelte";
  import MessageThread from "$lib/shared/inbox/components/messages/MessageThread.svelte";
  import NewMessageSheet from "$lib/shared/inbox/components/messages/NewMessageSheet.svelte";

  // Haptic feedback service
  let hapticService: IHapticFeedbackService | undefined;

  // Get effective user ID (preview mode or actual)
  const currentUserId = $derived(
    userPreviewState.isActive && userPreviewState.data.profile
      ? userPreviewState.data.profile.uid
      : authState.user?.uid
  );

  onMount(() => {
    hapticService = resolve<IHapticFeedbackService>(TYPES.IHapticFeedbackService);
  });

  async function handleConversationSelect(conversationId: string) {
    try {
      const conversation =
        await conversationService.getConversation(conversationId);
      if (conversation) {
        inboxState.selectConversation(conversation);

        // Subscribe to messages
        inboxState.setLoadingMessages(true);
        messagingService.subscribeToMessages(conversationId, (messages) => {
          inboxState.setMessages(messages);
          inboxState.setLoadingMessages(false);
        });

        // Mark as read
        await messagingService.markAsRead(conversationId);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
      toast.error("Failed to load conversation");
    }
  }

  function handleNewMessage() {
    inboxState.startCompose();
  }

  function handleBack() {
    hapticService?.trigger("selection");
    inboxState.backToList();
  }

  function handleCancelCompose() {
    hapticService?.trigger("selection");
    inboxState.cancelCompose();
  }

  // Get other participant name for thread header
  const threadParticipantName = $derived(() => {
    if (!inboxState.selectedConversation) return "Conversation";
    const participantInfo = inboxState.selectedConversation.participantInfo;
    const otherKey = Object.keys(participantInfo || {}).find(
      (k) => k !== currentUserId
    );
    return otherKey ? participantInfo[otherKey]?.displayName : "Conversation";
  });
</script>

<div class="messages-tab">
  {#if inboxState.currentView === "list"}
    <ConversationList
      conversations={inboxState.conversations}
      isLoading={inboxState.isLoadingConversations}
      onSelect={handleConversationSelect}
      onNewMessage={handleNewMessage}
    />
  {:else if inboxState.currentView === "thread" && inboxState.selectedConversation}
    <div class="thread-view">
      <header class="thread-header">
        <button
          class="back-button"
          onclick={handleBack}
          aria-label="Back to conversations"
        >
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
        </button>
        <h2 class="thread-title">{threadParticipantName()}</h2>
      </header>
      <div class="thread-content">
        <MessageThread
          conversation={inboxState.selectedConversation}
          messages={inboxState.messages}
          isLoading={inboxState.isLoadingMessages}
        />
      </div>
    </div>
  {:else if inboxState.currentView === "compose"}
    <div class="compose-view">
      <header class="compose-header">
        <button
          class="back-button"
          onclick={handleCancelCompose}
          aria-label="Cancel new message"
        >
          <i class="fas fa-arrow-left" aria-hidden="true"></i>
        </button>
        <h2 class="compose-title">New Message</h2>
      </header>
      <div class="compose-content">
        <NewMessageSheet
          recipientId={inboxState.composeRecipientId}
          recipientName={inboxState.composeRecipientName}
          onConversationCreated={handleConversationSelect}
          onCancel={handleCancelCompose}
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .messages-tab {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .thread-view,
  .compose-view {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .thread-header,
  .compose-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    flex-shrink: 0;
  }

  .thread-title,
  .compose-title {
    flex: 1;
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .back-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--min-touch-target);
    height: var(--min-touch-target);
    padding: 0;
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    border-radius: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      transform 0.15s ease;
  }

  .back-button:hover {
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.08));
    color: var(--theme-text, #ffffff);
  }

  .back-button:active {
    transform: scale(0.95);
  }

  .back-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--theme-accent) 50%, transparent);
  }

  .thread-content,
  .compose-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .back-button {
      transition: none !important;
    }
  }
</style>
