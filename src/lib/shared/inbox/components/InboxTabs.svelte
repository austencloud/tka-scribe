<script lang="ts">
	/**
	 * InboxTabs
	 *
	 * Tab switcher with animated underline indicator
	 */

	import { inboxState, type InboxTab } from "../state/inbox-state.svelte";

	interface Props {
		class?: string;
	}

	let { class: className = "" }: Props = $props();

	const tabs: { id: InboxTab; label: string; icon: string }[] = [
		{ id: "messages", label: "Messages", icon: "fa-comments" },
		{ id: "notifications", label: "Notifications", icon: "fa-bell" }
	];

	function handleTabClick(tab: InboxTab) {
		inboxState.setTab(tab);
	}

	// Track active tab index for indicator position
	const activeIndex = $derived(tabs.findIndex((t) => t.id === inboxState.activeTab));
</script>

<div class="inbox-tabs {className}" role="tablist" aria-label="Inbox tabs">
	<!-- Sliding indicator -->
	<div
		class="tab-indicator"
		style="--active-index: {activeIndex}; --tab-count: {tabs.length}"
	></div>

	{#each tabs as tab, index}
		{@const unreadCount =
			tab.id === "messages"
				? inboxState.unreadMessageCount
				: inboxState.unreadNotificationCount}
		<button
			class="tab"
			class:active={inboxState.activeTab === tab.id}
			onclick={() => handleTabClick(tab.id)}
			role="tab"
			aria-selected={inboxState.activeTab === tab.id}
			aria-controls="{tab.id}-panel"
			tabindex={inboxState.activeTab === tab.id ? 0 : -1}
		>
			<i class="fas {tab.icon}" aria-hidden="true"></i>
			<span>{tab.label}</span>
			{#if unreadCount > 0}
				<span class="badge" aria-label="{unreadCount} unread">
					{unreadCount > 99 ? "99+" : unreadCount}
				</span>
			{/if}
		</button>
	{/each}
</div>

<style>
	.inbox-tabs {
		position: relative;
		display: flex;
		gap: 4px;
		padding: 8px;
		background: var(--theme-panel-bg, rgba(0, 0, 0, 0.2));
		border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
	}

	/* Sliding indicator */
	.tab-indicator {
		position: absolute;
		left: 8px;
		bottom: 8px;
		height: calc(100% - 16px);
		width: calc((100% - 16px - 4px) / var(--tab-count));
		background: var(--theme-accent, #3b82f6);
		border-radius: 8px;
		transform: translateX(calc(var(--active-index) * (100% + 4px)));
		transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 0;
	}

	.tab {
		position: relative;
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 10px 16px;
		background: transparent;
		border: none;
		border-radius: 8px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition:
			color 0.2s ease,
			transform 0.15s ease;
		z-index: 1;
	}

	.tab:hover:not(.active) {
		color: var(--theme-text, #ffffff);
	}

	.tab:active {
		transform: scale(0.98);
	}

	.tab:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--theme-accent) 50%, transparent);
	}

	.tab.active {
		color: white;
	}

	.tab i {
		font-size: 14px;
		transition: transform 0.2s ease;
	}

	.tab:hover i {
		transform: scale(1.1);
	}

	/* Badge */
	.badge {
		min-width: 18px;
		height: 18px;
		padding: 0 5px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 9px;
		font-size: 11px;
		font-weight: 600;
		line-height: 18px;
		text-align: center;
		transition: background 0.2s ease;
	}

	.tab.active .badge {
		background: rgba(255, 255, 255, 0.3);
	}

	.tab:not(.active) .badge {
		background: var(--theme-accent, #3b82f6);
		color: white;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.tab-indicator,
		.tab,
		.tab i,
		.badge {
			transition: none !important;
		}
	}
</style>
