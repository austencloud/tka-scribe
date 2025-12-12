<script lang="ts">
	/**
	 * InboxNotificationItem
	 *
	 * Single notification row with enhanced accessibility and microinteractions
	 */

	import type { UserNotification } from "$lib/features/feedback/domain/models/notification-models";
	import { formatRelativeTimeVerbose } from "../../utils/format";
	import { goto } from "$app/navigation";
	import { inboxState } from "../../state/inbox-state.svelte";

	interface Props {
		notification: UserNotification;
		onDismiss: () => void;
		onMarkAsRead: () => void;
	}

	let { notification, onDismiss, onMarkAsRead }: Props = $props();

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

	function handleClick() {
		if (!notification.read) {
			onMarkAsRead();
		}

		// Deep-link to relevant content based on notification type
		const n = notification as Record<string, unknown>;

		switch (notification.type) {
			case "feedback-resolved":
			case "feedback-in-progress":
			case "feedback-needs-info":
			case "feedback-response":
				// Navigate to My Feedback tab
				if (n["feedbackId"]) {
					inboxState.close();
					goto(`/feedback?item=${n["feedbackId"]}`);
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
				// Navigate to achievements
				inboxState.close();
				goto("/collect?tab=achievements");
				break;

			default:
				// No specific navigation for other types
				break;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleClick();
		}
	}

	function handleDismissClick(e: MouseEvent) {
		e.stopPropagation();
		onDismiss();
	}

	function handleDismissKeydown(e: KeyboardEvent) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			e.stopPropagation();
			onDismiss();
		}
	}
</script>

<div
	class="notification-item"
	class:unread={!notification.read}
	onclick={handleClick}
	onkeydown={handleKeydown}
	role="button"
	tabindex="0"
	aria-label="{notification.message}{!notification.read ? ' (unread)' : ''}"
>
	<!-- Unread indicator -->
	{#if !notification.read}
		<span class="unread-dot" aria-hidden="true"></span>
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

	<!-- Dismiss button -->
	<button
		class="dismiss-btn"
		onclick={handleDismissClick}
		onkeydown={handleDismissKeydown}
		aria-label="Dismiss notification"
		tabindex="0"
	>
		<i class="fas fa-times"></i>
	</button>
</div>

<style>
	.notification-item {
		position: relative;
		display: flex;
		align-items: flex-start;
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

	.notification-item:hover {
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
	}

	.notification-item:active {
		transform: scale(0.995);
	}

	.notification-item:focus-visible {
		outline: none;
		background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.06));
		box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--theme-accent) 50%, transparent);
	}

	.notification-item.unread {
		background: color-mix(in srgb, var(--theme-accent) 5%, transparent);
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
		animation: dotPulse 2s ease-in-out infinite;
	}

	@keyframes dotPulse {
		0%,
		100% {
			opacity: 1;
			transform: translateY(-50%) scale(1);
		}
		50% {
			opacity: 0.7;
			transform: translateY(-50%) scale(1.2);
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
		font-size: 14px;
		line-height: 1.4;
		color: var(--theme-text, #ffffff);
	}

	.unread .message {
		font-weight: 500;
	}

	.time {
		font-size: 12px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
	}

	/* Dismiss button */
	.dismiss-btn {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: 6px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.4));
		cursor: pointer;
		opacity: 0;
		transition: all 0.2s ease;
	}

	.notification-item:hover .dismiss-btn,
	.notification-item:focus-within .dismiss-btn {
		opacity: 1;
	}

	.dismiss-btn:hover {
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.08));
		color: var(--semantic-error, #ef4444);
	}

	.dismiss-btn:focus-visible {
		opacity: 1;
		outline: none;
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-accent) 50%, transparent);
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.notification-item,
		.icon,
		.dismiss-btn,
		.unread-dot {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
