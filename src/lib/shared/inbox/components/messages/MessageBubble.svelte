<script lang="ts">
	/**
	 * MessageBubble
	 *
	 * Single message bubble with read receipts, animations, and rich attachments
	 */

	import type { Message } from "$lib/shared/messaging/domain/models/message-models";
	import { formatTime } from "../../utils/format";
	import FeedbackMessageCard from "./FeedbackMessageCard.svelte";

	interface Props {
		message: Message;
		isOwn: boolean;
		isNew?: boolean;
		otherParticipantId?: string;
	}

	let { message, isOwn, isNew = false, otherParticipantId }: Props = $props();

	// Check if message was edited
	const wasEdited = $derived(message.editedAt !== undefined);

	// Check for feedback attachment
	const feedbackAttachment = $derived(
		message.attachments?.find((a) => a.type === "feedback")
	);

	// Read receipt status for own messages
	const readStatus = $derived.by(() => {
		if (!isOwn) return null;

		// Check if the other participant has read this message
		if (otherParticipantId && message.readBy?.includes(otherParticipantId)) {
			return "read";
		}

		// Message is sent (we have an ID)
		return "sent";
	});
</script>

<div
	class="message-bubble"
	class:own={isOwn}
	class:deleted={message.isDeleted}
	class:is-new={isNew}
	class:has-attachment={feedbackAttachment}
	role="article"
	aria-label="{isOwn ? 'You' : message.senderName} said: {message.content}"
>
	<div class="bubble">
		{#if feedbackAttachment}
			<FeedbackMessageCard attachment={feedbackAttachment} {isOwn} />
			{#if message.content && message.content !== "[Feedback submitted]"}
				<p class="content attachment-content">{message.content}</p>
			{/if}
		{:else}
			<p class="content">{message.content}</p>
		{/if}
		<div class="meta">
			<time class="time" datetime={message.createdAt.toISOString()}>{formatTime(message.createdAt)}</time>
			{#if wasEdited && !message.isDeleted}
				<span class="edited">(edited)</span>
			{/if}
			{#if isOwn && !message.isDeleted && readStatus}
				<span
					class="read-receipt"
					class:read={readStatus === "read"}
					aria-label={readStatus === "read" ? "Read" : "Sent"}
				>
					{#if readStatus === "read"}
						<i class="fas fa-check-double"></i>
					{:else}
						<i class="fas fa-check"></i>
					{/if}
				</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.message-bubble {
		display: flex;
		max-width: 80%;
		animation: slideIn 0.25s ease-out;
		transform-origin: bottom left;
	}

	.message-bubble.own {
		margin-left: auto;
		transform-origin: bottom right;
	}

	.message-bubble.is-new {
		animation: slideInNew 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes slideInNew {
		from {
			opacity: 0;
			transform: translateY(16px) scale(0.9);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.bubble {
		padding: 10px 14px;
		border-radius: 18px;
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
		transition: transform 0.15s ease;
	}

	.bubble:hover {
		transform: scale(1.01);
	}

	.own .bubble {
		background: var(--theme-accent, #3b82f6);
		color: white;
		border-bottom-right-radius: 6px;
	}

	.message-bubble:not(.own) .bubble {
		border-bottom-left-radius: 6px;
	}

	.deleted .bubble {
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
		font-style: italic;
		opacity: 0.7;
	}

	.content {
		margin: 0 0 4px;
		font-size: 14px;
		line-height: 1.4;
		word-break: break-word;
		color: var(--theme-text, #ffffff);
	}

	.own .content {
		color: white;
	}

	.attachment-content {
		margin-top: 8px;
		padding-top: 8px;
		border-top: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
	}

	.has-attachment .bubble {
		max-width: 300px;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
	}

	.own .meta {
		color: rgba(255, 255, 255, 0.7);
		justify-content: flex-end;
	}

	.edited {
		font-style: italic;
	}

	/* Read receipts */
	.read-receipt {
		font-size: 12px;
		opacity: 0.7;
		transition: color 0.2s ease;
	}

	.read-receipt.read {
		color: #60a5fa;
		opacity: 1;
	}

	.own .read-receipt.read {
		color: #93c5fd;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.message-bubble,
		.bubble {
			animation: none !important;
			transition: none !important;
		}
	}
</style>
