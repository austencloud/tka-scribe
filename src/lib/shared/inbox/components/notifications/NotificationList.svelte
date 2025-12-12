<script lang="ts">
	/**
	 * NotificationList
	 *
	 * List of notifications with error handling and accessibility
	 */

	import type { UserNotification } from "$lib/features/feedback/domain/models/notification-models";
	import { notificationService } from "$lib/features/feedback/services/implementations/NotificationService";
	import { authState } from "$lib/shared/auth/state/authState.svelte";
	import { userPreviewState } from "$lib/shared/debug/state/user-preview-state.svelte";
	import { toast } from "../../../toast/state/toast-state.svelte";
	import InboxNotificationItem from "./InboxNotificationItem.svelte";

	interface Props {
		notifications: UserNotification[];
		isLoading: boolean;
	}

	let { notifications, isLoading }: Props = $props();

	let isClearingAll = $state(false);
	let isMarkingAllRead = $state(false);

	// Get effective user ID (preview mode or actual)
	function getEffectiveUserId(): string | null {
		if (userPreviewState.isActive && userPreviewState.data.profile) {
			return userPreviewState.data.profile.uid;
		}
		return authState.user?.uid ?? null;
	}

	async function handleMarkAllRead() {
		const userId = getEffectiveUserId();
		if (!userId || isMarkingAllRead) return;

		isMarkingAllRead = true;
		try {
			await notificationService.markAllAsRead(userId);
			toast.success("All notifications marked as read");
		} catch (error) {
			console.error("Failed to mark all as read:", error);
			toast.error("Failed to mark notifications as read");
		} finally {
			isMarkingAllRead = false;
		}
	}

	async function handleClearAll() {
		const userId = getEffectiveUserId();
		if (!userId || isClearingAll) return;

		isClearingAll = true;
		try {
			await notificationService.deleteAllNotifications(userId);
			toast.success("All notifications cleared");
		} catch (error) {
			console.error("Failed to clear notifications:", error);
			toast.error("Failed to clear notifications");
		} finally {
			isClearingAll = false;
		}
	}

	async function handleDismiss(notificationId: string) {
		const userId = getEffectiveUserId();
		if (!userId) return;

		try {
			await notificationService.deleteNotification(userId, notificationId);
		} catch (error) {
			console.error("Failed to dismiss notification:", error);
			toast.error("Failed to dismiss notification");
		}
	}

	async function handleMarkAsRead(notificationId: string) {
		const userId = getEffectiveUserId();
		if (!userId) return;

		try {
			await notificationService.markAsRead(userId, notificationId);
		} catch (error) {
			console.error("Failed to mark as read:", error);
			toast.error("Failed to mark notification as read");
		}
	}

	// Check if there are any unread notifications
	const hasUnread = $derived(notifications.some((n) => !n.read));
</script>

<div class="notification-list" role="region" aria-label="Notifications">
	<!-- Header actions -->
	{#if notifications.length > 0}
		<div class="header-actions">
			{#if hasUnread}
				<button
					class="action-btn"
					onclick={handleMarkAllRead}
					disabled={isMarkingAllRead}
					aria-label="Mark all notifications as read"
				>
					{#if isMarkingAllRead}
						<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
					{:else}
						<i class="fas fa-check-double" aria-hidden="true"></i>
					{/if}
					<span>Mark all read</span>
				</button>
			{/if}
			<button
				class="action-btn clear-all"
				onclick={handleClearAll}
				disabled={isClearingAll}
				aria-label="Clear all notifications"
			>
				{#if isClearingAll}
					<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
				{:else}
					<i class="fas fa-trash-alt" aria-hidden="true"></i>
				{/if}
				<span>Clear all</span>
			</button>
		</div>
	{/if}

	{#if isLoading}
		<div class="loading-state" role="status" aria-live="polite">
			<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
			<span>Loading notifications...</span>
		</div>
	{:else if notifications.length === 0}
		<div class="empty-state">
			<i class="fas fa-bell-slash" aria-hidden="true"></i>
			<h3>No notifications</h3>
			<p>You're all caught up!</p>
		</div>
	{:else}
		<div class="notifications" role="list" aria-label="Notification list">
			{#each notifications as notification, index (notification.id)}
				<div
					class="notification-wrapper"
					style="--stagger-index: {Math.min(index, 10)}"
					role="listitem"
				>
					<InboxNotificationItem
						{notification}
						onDismiss={() => handleDismiss(notification.id)}
						onMarkAsRead={() => handleMarkAsRead(notification.id)}
					/>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.notification-list {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.header-actions {
		display: flex;
		justify-content: flex-end;
		gap: 8px;
		padding: 8px 16px;
		border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		background: transparent;
		border: none;
		border-radius: 6px;
		color: var(--theme-accent, #3b82f6);
		font-size: 13px;
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			opacity 0.2s ease;
	}

	.action-btn:hover:not(:disabled) {
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
	}

	.action-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.action-btn:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-accent) 50%, transparent);
	}

	.action-btn.clear-all {
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
	}

	.action-btn.clear-all:hover:not(:disabled) {
		color: var(--semantic-error, #ef4444);
	}

	.loading-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 48px 24px;
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

	.notifications {
		flex: 1;
		overflow-y: auto;
	}

	.notification-wrapper {
		animation: slideInStagger 0.3s ease-out backwards;
		animation-delay: calc(var(--stagger-index) * 30ms);
	}

	@keyframes slideInStagger {
		from {
			opacity: 0;
			transform: translateX(-8px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.action-btn,
		.notification-wrapper {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
