<script lang="ts">
  /**
   * MessageThread
   *
   * Full conversation message view with composer
   * Uses preview mode state for View As feature support
   */

  import type { Conversation, Message } from "$lib/shared/messaging";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import { userPreviewState } from "$lib/shared/debug/state/user-preview-state.svelte";
  import MessageBubble from "./MessageBubble.svelte";
  import MessageComposer from "./MessageComposer.svelte";

  interface Props {
    conversation: Conversation;
    messages: Message[];
    isLoading: boolean;
  }

  let { conversation, messages, isLoading }: Props = $props();

  let messagesContainer: HTMLDivElement | undefined = $state();

  // Get effective user ID (preview mode or actual)
  const currentUserId = $derived(
    userPreviewState.isActive && userPreviewState.data.profile
      ? userPreviewState.data.profile.uid
      : authState.user?.uid
  );

  // Auto-scroll to bottom when new messages arrive
  $effect(() => {
    if (messages.length > 0 && messagesContainer) {
      // Slight delay to ensure DOM update
      requestAnimationFrame(() => {
        messagesContainer?.scrollTo({
          top: messagesContainer.scrollHeight,
          behavior: "smooth",
        });
      });
    }
  });

  // Get other participant info (use currentUserId for preview mode support)
  const otherParticipantId = $derived(
    conversation.participants.find((p: string) => p !== currentUserId) || ""
  );
  const otherParticipant = $derived(
    conversation.participantInfo[otherParticipantId]
  );
</script>

<div class="message-thread">
  <!-- Messages container -->
  <div class="messages-container" bind:this={messagesContainer}>
    {#if isLoading}
      <div class="loading-state">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Loading messages...</span>
      </div>
    {:else if messages.length === 0}
      <div class="empty-state">
        <i class="fas fa-comments"></i>
        <h3>Start the conversation</h3>
        <p>Send a message to {otherParticipant?.displayName || "this user"}</p>
      </div>
    {:else}
      <div class="messages">
        {#each messages as message (message.id)}
          <MessageBubble {message} isOwn={message.senderId === currentUserId} />
        {/each}
      </div>
    {/if}
  </div>

  <!-- Composer -->
  <MessageComposer conversationId={conversation.id} />
</div>

<style>
  .message-thread {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .loading-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    height: 100%;
    min-height: 200px;
    text-align: center;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
  }

  .loading-state i,
  .empty-state i {
    font-size: 32px;
    opacity: 0.5;
  }

  .empty-state h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
  }

  .empty-state p {
    margin: 0;
    font-size: 14px;
  }

  .messages {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
</style>
