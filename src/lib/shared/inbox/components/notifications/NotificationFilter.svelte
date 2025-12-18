<script lang="ts">
	/**
	 * NotificationFilter - Filter controls for notification list
	 */

	import type { UserNotification } from "$lib/features/feedback/domain/models/notification-models";

	interface Props {
		onFilterChange: (filters: FilterState) => void;
	}

	let { onFilterChange }: Props = $props();

	export interface FilterState {
		readStatus: "all" | "unread" | "read";
		type: UserNotification["type"] | "all";
		searchQuery: string;
	}

	let filters = $state<FilterState>({
		readStatus: "all",
		type: "all",
		searchQuery: "",
	});

	// Notify parent when filters change
	$effect(() => {
		onFilterChange(filters);
	});

	const notificationTypes: Array<{
		value: UserNotification["type"] | "all";
		label: string;
	}> = [
		{ value: "all", label: "All Types" },
		{ value: "feedback-resolved", label: "Resolved" },
		{ value: "feedback-in-progress", label: "In Progress" },
		{ value: "feedback-needs-info", label: "Needs Info" },
		{ value: "feedback-response", label: "Response" },
		{ value: "sequence-liked", label: "Likes" },
		{ value: "user-followed", label: "Follows" },
		{ value: "achievement-unlocked", label: "Achievements" },
		{ value: "message-received", label: "Messages" },
		{ value: "system-announcement", label: "Announcements" },
	];
</script>

<div class="notification-filter">
	<!-- Search input -->
	<div class="search-box">
		<i class="fas fa-search" aria-hidden="true"></i>
		<input
			type="text"
			placeholder="Search notifications..."
			bind:value={filters.searchQuery}
			aria-label="Search notifications"
		/>
		{#if filters.searchQuery}
			<button
				class="clear-search"
				onclick={() => (filters.searchQuery = "")}
				aria-label="Clear search"
			>
				<i class="fas fa-times"></i>
			</button>
		{/if}
	</div>

	<!-- Filter controls -->
	<div class="filter-controls">
		<!-- Read status filter -->
		<select bind:value={filters.readStatus} aria-label="Filter by read status">
			<option value="all">All</option>
			<option value="unread">Unread</option>
			<option value="read">Read</option>
		</select>

		<!-- Type filter -->
		<select bind:value={filters.type} aria-label="Filter by notification type">
			{#each notificationTypes as { value, label }}
				<option {value}>{label}</option>
			{/each}
		</select>
	</div>
</div>

<style>
	.notification-filter {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 12px 16px;
		border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.06));
		background: var(--theme-panel-bg, rgba(0, 0, 0, 0.2));
	}

	.search-box {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-box i.fa-search {
		position: absolute;
		left: 12px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
		font-size: 14px;
		pointer-events: none;
	}

	.search-box input {
		flex: 1;
		padding: 10px 12px 10px 36px;
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
		border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
		border-radius: 8px;
		color: var(--theme-text, #ffffff);
		font-size: var(--font-size-min, 14px);
		transition: all 0.2s ease;
	}

	.search-box input::placeholder {
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
	}

	.search-box input:focus {
		outline: none;
		border-color: var(--theme-accent, #3b82f6);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-accent) 20%, transparent);
	}

	.clear-search {
		position: absolute;
		right: 8px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		border-radius: 4px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.5));
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.clear-search:hover {
		background: var(--theme-card-hover-bg, rgba(255, 255, 255, 0.1));
		color: var(--theme-text, #ffffff);
	}

	.filter-controls {
		display: flex;
		gap: 8px;
	}

	.filter-controls select {
		flex: 1;
		padding: 8px 12px;
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
		border: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
		border-radius: 8px;
		color: var(--theme-text, #ffffff);
		font-size: var(--font-size-min, 14px);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-controls select:hover {
		border-color: var(--theme-stroke, rgba(255, 255, 255, 0.2));
	}

	.filter-controls select:focus {
		outline: none;
		border-color: var(--theme-accent, #3b82f6);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-accent) 20%, transparent);
	}

	/* Responsive */
	@media (max-width: 640px) {
		.filter-controls {
			flex-direction: column;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.search-box input,
		.clear-search,
		.filter-controls select {
			transition: none !important;
		}
	}
</style>
