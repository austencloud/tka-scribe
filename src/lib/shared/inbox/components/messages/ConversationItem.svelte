<script lang="ts">
  /**
   * ConversationItem
   *
   * Single conversation row in the list with enhanced visual polish
   */

  import { onMount } from "svelte";
  import type { ConversationPreview } from "$lib/shared/messaging/domain/models/conversation-models";
  import RobustAvatar from "$lib/shared/components/avatar/RobustAvatar.svelte";
  import { formatRelativeTime, truncateText } from "../../utils/format";
  import { resolve } from "$lib/shared/inversify/di";
  import { TYPES } from "$lib/shared/inversify/types";
  import type { IHapticFeedback } from "$lib/shared/application/services/contracts/IHapticFeedback";

  interface Props {
    conversation: ConversationPreview;
    onclick: () => void;
  }

  let { conversation, onclick }: Props = $props();

  // Haptic feedback service
  let hapticService: IHapticFeedback | undefined;

  onMount(() => {
    hapticService = resolve<IHapticFeedback>(
      TYPES.IHapticFeedback
    );
  });

  function handleClick() {
    hapticService?.trigger("selection");
    onclick();
  }
</script>

<button
  class="conversation-item"
  class:unread={conversation.unreadCount > 0}
  onclick={handleClick}
  aria-label="Conversation with {conversation.otherParticipant
    .displayName}{conversation.unreadCount > 0
    ? `, ${conversation.unreadCount} unread`
    : ''}"
>
  <!-- Unread accent bar -->
  {#if conversation.unreadCount > 0}
    <div class="unread-accent"></div>
  {/if}

  <!-- Avatar -->
  <div class="avatar-wrapper">
    <RobustAvatar
      src={conversation.otherParticipant.avatar}
      name={conversation.otherParticipant.displayName}
      alt="Avatar for {conversation.otherParticipant.displayName}"
      customSize={44}
    />
    {#if conversation.unreadCount > 0}
      <span class="online-dot" aria-hidden="true"></span>
    {/if}
  </div>

  <!-- Content -->
  <div class="content">
    <div class="header">
      <span class="name">{conversation.otherParticipant.displayName}</span>
      <span class="time">{formatRelativeTime(conversation.updatedAt)}</span>
    </div>
    {#if conversation.lastMessage}
      <p class="preview">
        {truncateText(conversation.lastMessage.content, 60)}
      </p>
    {:else}
      <p class="preview empty">No messages yet</p>
    {/if}
  </div>

  <!-- Unread badge -->
  {#if conversation.unreadCount > 0}
    <span
      class="unread-badge"
      aria-label="{conversation.unreadCount} unread messages"
    >
      {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
    </span>
  {/if}
</button>

<style>
  .conversation-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 12px 16px;
    background: transparent;
    border: none;
    border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
    text-align: left;
    cursor: pointer;
    transition:
      background 0.2s ease,
      transform 0.15s ease;
  }

  .conversation-item:hover {
    background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
  }

  .conversation-item:active {
    transform: scale(0.99);
  }

  .conversation-item:focus-visible {
    outline: none;
    background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.06));
    box-shadow: inset 0 0 0 2px
      color-mix(in srgb, var(--theme-accent) 50%, transparent);
  }

  .conversation-item.unread {
    background: color-mix(in srgb, var(--theme-accent) 5%, transparent);
  }

  /* Unread accent bar */
  .unread-accent {
    position: absolute;
    left: 0;
    top: 8px;
    bottom: 8px;
    width: 3px;
    background: var(--theme-accent, #3b82f6);
    border-radius: 0 2px 2px 0;
    animation: accentPulse 2s ease-in-out infinite;
  }

  @keyframes accentPulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.6;
    }
  }

  /* Avatar wrapper for positioning online dot */
  .avatar-wrapper {
    position: relative;
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .conversation-item:hover .avatar-wrapper {
    transform: scale(1.05);
  }

  .online-dot {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 10px;
    height: 10px;
    background: var(--theme-accent, #3b82f6);
    border: 2px solid var(--theme-panel-bg, #1a1a1a);
    border-radius: 50%;
    z-index: 1;
  }

  /* Content */
  .content {
    flex: 1;
    min-width: 0;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 2px;
  }

  .name {
    font-size: 15px;
    font-weight: 600;
    color: var(--theme-text, #ffffff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .unread .name {
    font-weight: 700;
  }

  .time {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
  }

  .unread .time {
    color: var(--theme-accent, #3b82f6);
    font-weight: 500;
  }

  .preview {
    margin: 0;
    font-size: 13px;
    color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .preview.empty {
    font-style: italic;
    opacity: 0.7;
  }

  .unread .preview {
    color: var(--theme-text, #ffffff);
    font-weight: 500;
  }

  /* Unread badge */
  .unread-badge {
    flex-shrink: 0;
    min-width: 22px;
    height: 22px;
    padding: 0 6px;
    background: var(--theme-accent, #3b82f6);
    border-radius: 11px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    line-height: 22px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .conversation-item,
    .avatar-wrapper,
    .unread-accent {
      transition: none !important;
      animation: none !important;
    }
  }
</style>
