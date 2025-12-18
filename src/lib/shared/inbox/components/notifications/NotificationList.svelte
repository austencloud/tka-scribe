<script lang="ts">
	/**
	 * NotificationList
	 *
	 * List of notifications with error handling and accessibility
	 */

	import type { UserNotification } from "$lib/features/feedback/domain/models/notification-models";
	import InboxNotificationItem from "./InboxNotificationItem.svelte";
	import NotificationSkeleton from "../skeletons/NotificationSkeleton.svelte";
	import EmptyNotifications from "../empty-states/EmptyNotifications.svelte";
	import NotificationFilter, {
		type FilterState,
	} from "./NotificationFilter.svelte";

	interface Props {
		notifications: UserNotification[];
		isLoading: boolean;
	}

	let { notifications, isLoading }: Props = $props();

	let filters = $state<FilterState>({
		readStatus: "all",
		type: "all",
		searchQuery: "",
	});

	// Filter notifications based on current filters
	const filteredNotifications = $derived.by(() => {
		let result = notifications;

		// Filter by type
		if (filters.type !== "all") {
			result = result.filter((n) => n.type === filters.type);
		}

		// Filter by search query
		if (filters.searchQuery.trim()) {
			const query = filters.searchQuery.toLowerCase();
			result = result.filter((n) =>
				n.message.toLowerCase().includes(query)
			);
		}

		return result;
	});
</script>

<div class="notification-list" role="region" aria-label="Notifications">
	<!-- Filter UI -->
	<NotificationFilter onFilterChange={(newFilters) => (filters = newFilters)} />

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
			{#if hasRead}
				<button
					class="action-btn delete-read"
					onclick={handleClearAllRead}
					disabled={isClearingRead}
					aria-label="Delete all read notifications"
				>
					{#if isClearingRead}
						<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
					{:else}
						<i class="fas fa-trash-alt" aria-hidden="true"></i>
					{/if}
					<span>Delete read</span>
				</button>
			{/if}
		</div>
	{/if}

	{#if isLoading}
		<NotificationSkeleton count={5} />
	{:else if filteredNotifications.length === 0}
		{#if notifications.length === 0}
			<EmptyNotifications />
		{:else}
			<div class="empty-state">
				<i class="fas fa-filter" aria-hidden="true"></i>
				<p>No notifications match your filters</p>
			</div>
		{/if}
	{:else}
		<div class="notifications" role="list" aria-label="Notification list">
			{#each filteredNotifications as notification, index (notification.id)}
				<div
					class="notification-wrapper"
					style="--stagger-index: {Math.min(index, 10)}"
					role="listitem"
				>
					<InboxNotificationItem
						{notification}
						onDismiss={() => handleDismiss(notification.id)}
						onMarkAsRead={() => handleMarkAsRead(notification.id)}
						onMarkAsUnread={() => handleMarkAsUnread(notification.id)}
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
		gap: 8px;
		min-height: var(--min-touch-target);
		padding: 12px 16px;
		background: transparent;
		border: none;
		border-radius: 12px;
		color: var(--theme-accent, #3b82f6);
		font-size: 14px;
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

	.action-btn.delete-read {
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
	}

	.action-btn.delete-read:hover:not(:disabled) {
		color: var(--semantic-error, #ef4444);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
		gap: 12px;
	}

	.empty-state i {
		font-size: 32px;
	}

	.empty-state p {
		margin: 0;
		font-size: var(--font-size-min, 14px);
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
