<script lang="ts">
	/**
	 * MessageBubble
	 *
	 * Single message bubble with enhanced visual polish and animations
	 */

	import type { Message } from "$lib/shared/messaging";
	import { formatTime } from "../../utils/format";

	interface Props {
		message: Message;
		isOwn: boolean;
		isNew?: boolean;
	}

	let { message, isOwn, isNew = false }: Props = $props();

	// Check if message was edited
	const wasEdited = $derived(message.editedAt !== undefined);
</script>

<div
	class="message-bubble"
	class:own={isOwn}
	class:deleted={message.isDeleted}
	class:is-new={isNew}
	role="article"
	aria-label="{isOwn ? 'You' : message.senderName} said: {message.content}"
>
	<div class="bubble">
		<p class="content">{message.content}</p>
		<div class="meta">
			<span class="time">{formatTime(message.createdAt)}</span>
			{#if wasEdited && !message.isDeleted}
				<span class="edited">(edited)</span>
			{/if}
			{#if isOwn && !message.isDeleted}
				<span class="status" aria-label="Sent">
					<i class="fas fa-check"></i>
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

	.meta {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
	}

	.own .meta {
		color: rgba(255, 255, 255, 0.7);
		justify-content: flex-end;
	}

	.edited {
		font-style: italic;
	}

	.status {
		font-size: 10px;
		opacity: 0.8;
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
