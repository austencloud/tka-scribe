<script lang="ts">
  /**
   * MessagesWidget - Direct messages from the community
   * Shows recent conversations with one-click access to threads
   */

  import { inboxState } from "$lib/shared/inbox/state/inbox-state.svelte";
  import { authState } from "$lib/shared/auth/state/authState.svelte";
  import RobustAvatar from "$lib/shared/components/avatar/RobustAvatar.svelte";
  import type { ConversationPreview } from "$lib/shared/messaging/domain/models/conversation-models";

  // Derived state from inbox
  const conversations = $derived(inboxState.conversations.slice(0, 4));
  const unreadCount = $derived(inboxState.unreadMessageCount);

  function openConversation(conversation: ConversationPreview) {
    // Direct navigation - opens straight to the thread
    inboxState.openToConversationById(conversation.id);
  }

  function openAllMessages() {
    inboxState.open("messages");
  }

  function formatTimeAgo(date: Date | string): string {
    const now = new Date();
    const then = date instanceof Date ? date : new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return then.toLocaleDateString();
  }
</script>

<div class="messages-widget">
  <div class="widget-header">
    <div class="header-left">
      <div class="header-icon">
        <i class="fas fa-envelope"></i>
      </div>
      <h3>Messages</h3>
    </div>
    {#if unreadCount > 0}
      <span class="unread-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
    {/if}
  </div>

  <div class="widget-content">
    {#if !authState.isAuthenticated}
      <div class="empty-state">
        <i class="fas fa-user-circle"></i>
        <p>Sign in to see messages</p>
      </div>
    {:else if conversations.length === 0}
      <div class="empty-state">
        <i class="fas fa-envelope-open"></i>
        <p>No messages yet</p>
        <span class="empty-hint">Start a conversation!</span>
      </div>
    {:else}
      <div class="conversation-list">
        {#each conversations as conversation}
          <button
            class="conversation-item"
            class:unread={conversation.unreadCount > 0}
            onclick={() => openConversation(conversation)}
          >
            <RobustAvatar
              src={conversation.otherParticipant.avatar}
              name={conversation.otherParticipant.displayName}
              size="sm"
              alt={conversation.otherParticipant.displayName}
            />
            <div class="conversation-content">
              <div class="conversation-header">
                <span class="conversation-name">{conversation.otherParticipant.displayName}</span>
                <span class="conversation-time">{formatTimeAgo(conversation.updatedAt)}</span>
              </div>
              <span class="conversation-preview">
                {conversation.lastMessage?.content || "No messages yet"}
              </span>
            </div>
            {#if conversation.unreadCount > 0}
              <span class="unread-dot"></span>
            {/if}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <button class="view-all-btn" onclick={openAllMessages}>
    <span>All Messages</span>
    <i class="fas fa-arrow-right"></i>
  </button>
</div>

<style>
  .messages-widget {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    padding: 16px;
    background: var(--theme-panel-bg, rgba(0, 0, 0, 0.6));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.12));
    border-radius: 20px;
    overflow: hidden;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  }

  .widget-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    flex-shrink: 0;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: color-mix(in srgb, var(--semantic-info, #8b5cf6) 25%, var(--theme-card-bg, rgba(0, 0, 0, 0.3)));
    border-radius: 10px;
    color: var(--semantic-info, #8b5cf6);
    font-size: 14px;
  }

  .widget-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
  }

  .unread-badge {
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    background: var(--semantic-error, #ef4444);
    border-radius: 10px;
    color: white;
    font-size: 0.6875rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .widget-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    text-align: center;
    padding: 16px;
    flex: 1;
  }

  .empty-state i {
    font-size: 24px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.3));
  }

  .empty-state p {
    margin: 0;
    font-size: 0.8125rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .empty-hint {
    font-size: 0.75rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
  }

  .conversation-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .conversation-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.2));
    border: 1px solid transparent;
    border-radius: 10px;
    cursor: pointer;
    transition: all 150ms ease;
    text-align: left;
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
    flex-shrink: 0;
  }

  .conversation-item:hover {
    background: var(--theme-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.1));
  }

  .conversation-item.unread {
    background: color-mix(in srgb, var(--semantic-info, #8b5cf6) 12%, var(--theme-card-bg, rgba(0, 0, 0, 0.2)));
    border-color: color-mix(in srgb, var(--semantic-info, #8b5cf6) 25%, transparent);
  }

  .conversation-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .conversation-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .conversation-name {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--theme-text, rgba(255, 255, 255, 0.95));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conversation-time {
    font-size: 0.6875rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
    flex-shrink: 0;
  }

  .conversation-preview {
    font-size: 0.75rem;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .unread-dot {
    width: 8px;
    height: 8px;
    background: var(--semantic-info, #8b5cf6);
    border-radius: 50%;
    flex-shrink: 0;
  }

  .view-all-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
    padding: 10px 16px;
    margin-top: 8px;
    background: var(--theme-card-bg, rgba(0, 0, 0, 0.3));
    border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
    border-radius: 10px;
    color: var(--theme-text, rgba(255, 255, 255, 0.9));
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 150ms ease;
    flex-shrink: 0;
  }

  .view-all-btn:hover {
    background: var(--theme-hover, rgba(255, 255, 255, 0.08));
    border-color: var(--theme-stroke, rgba(255, 255, 255, 0.15));
  }

  .view-all-btn i {
    font-size: 12px;
  }

  @media (max-width: 768px) {
    .messages-widget {
      padding: 14px;
      border-radius: 16px;
    }

    .header-icon {
      width: 32px;
      height: 32px;
      font-size: 13px;
    }

    .widget-header h3 {
      font-size: 0.9375rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .conversation-item,
    .view-all-btn {
      transition: none;
    }
  }
</style>
