<script lang="ts">
	/**
	 * InboxDrawer
	 *
	 * Main container for the combined messages + notifications inbox.
	 * Uses the existing Drawer component with snap points.
	 */

	import { onMount } from "svelte";
	import Drawer from "$lib/shared/foundation/ui/Drawer.svelte";
	import { inboxState } from "../state/inbox-state.svelte";
	import { authState } from "$lib/shared/auth/state/authState.svelte";
	import { userPreviewState } from "$lib/shared/debug/state/user-preview-state.svelte";
	import { toast } from "../../toast/state/toast-state.svelte";
	import InboxTabs from "./InboxTabs.svelte";
	import ConversationList from "./messages/ConversationList.svelte";
	import MessageThread from "./messages/MessageThread.svelte";
	import NewMessageSheet from "./messages/NewMessageSheet.svelte";
	import NotificationList from "./notifications/NotificationList.svelte";
	import { conversationService } from "../../messaging/services/implementations/ConversationService";
	import { messagingService } from "../../messaging/services/implementations/MessagingService";

	// Responsive placement
	let isMobile = $state(false);
	let placement = $derived(isMobile ? "bottom" : "right") as "bottom" | "right";

	onMount(() => {
		const mediaQuery = window.matchMedia("(max-width: 768px)");
		isMobile = mediaQuery.matches;
		mediaQuery.addEventListener("change", (e) => {
			isMobile = e.matches;
		});
	});

	// Create a derived value that tracks preview mode (View As feature)
	const currentUserId = $derived(
		userPreviewState.isActive && userPreviewState.data.profile
			? userPreviewState.data.profile.uid
			: authState.user?.uid
	);

	function handleClose() {
		inboxState.close();
	}

	async function handleConversationSelect(conversationId: string) {
		try {
			const conversation = await conversationService.getConversation(conversationId);
			if (conversation) {
				inboxState.selectConversation(conversation);

				// Subscribe to messages
				inboxState.setLoadingMessages(true);
				messagingService.subscribeToMessages(conversationId, (messages) => {
					inboxState.setMessages(messages);
					inboxState.setLoadingMessages(false);
				});

				// Mark as read
				await messagingService.markAsRead(conversationId);
			}
		} catch (error) {
			console.error("Failed to load conversation:", error);
			toast.error("Failed to load conversation");
		}
	}

	function handleNewMessage() {
		inboxState.startCompose();
	}

	function handleBack() {
		inboxState.backToList();
	}

	// Custom escape handler - navigate back within drawer before closing
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Escape" && inboxState.isOpen) {
			event.preventDefault();
			event.stopPropagation();

			if (inboxState.currentView === "thread") {
				handleBack();
			} else if (inboxState.currentView === "compose") {
				inboxState.cancelCompose();
			} else {
				handleClose();
			}
		}
	}

	// Get other participant name for thread header
	const threadParticipantName = $derived(() => {
		if (!inboxState.selectedConversation) return "Conversation";
		const participantInfo = inboxState.selectedConversation.participantInfo;
		const otherKey = Object.keys(participantInfo || {}).find((k) => k !== currentUserId);
		return otherKey ? participantInfo[otherKey]?.displayName : "Conversation";
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<Drawer
	bind:isOpen={inboxState.isOpen}
	{placement}
	showHandle={isMobile}
	closeOnBackdrop={true}
	closeOnEscape={false}
	onclose={handleClose}
	class="inbox-drawer {isMobile && inboxState.currentView !== 'list' ? 'inbox-expanded' : ''}"
	ariaLabel="Inbox"
>
	<div
		class="inbox-container"
		class:expanded={isMobile && inboxState.currentView !== 'list'}
		role="dialog"
		aria-labelledby="inbox-title"
	>
		<!-- Header -->
		<header class="inbox-header">
			{#if inboxState.currentView === "list"}
				<h2 id="inbox-title">Inbox</h2>
				<button
					class="close-button"
					onclick={handleClose}
					aria-label="Close inbox"
				>
					<i class="fas fa-times" aria-hidden="true"></i>
				</button>
			{:else if inboxState.currentView === "thread"}
				<button
					class="back-button"
					onclick={handleBack}
					aria-label="Back to conversations"
				>
					<i class="fas fa-arrow-left" aria-hidden="true"></i>
				</button>
				<h2 id="inbox-title">{threadParticipantName()}</h2>
				<button
					class="close-button"
					onclick={handleClose}
					aria-label="Close inbox"
				>
					<i class="fas fa-times" aria-hidden="true"></i>
				</button>
			{:else if inboxState.currentView === "compose"}
				<button
					class="back-button"
					onclick={() => inboxState.cancelCompose()}
					aria-label="Cancel new message"
				>
					<i class="fas fa-arrow-left" aria-hidden="true"></i>
				</button>
				<h2 id="inbox-title">New Message</h2>
				<div class="spacer"></div>
			{/if}
		</header>

		<!-- Tabs (only show in list view) -->
		{#if inboxState.currentView === "list"}
			<InboxTabs />
		{/if}

		<!-- Content -->
		<main class="inbox-content" id="{inboxState.activeTab}-panel" role="tabpanel">
			{#if inboxState.currentView === "list"}
				{#if inboxState.activeTab === "messages"}
					<ConversationList
						conversations={inboxState.conversations}
						isLoading={inboxState.isLoadingConversations}
						onSelect={handleConversationSelect}
						onNewMessage={handleNewMessage}
					/>
				{:else}
					<NotificationList
						notifications={inboxState.notifications}
						isLoading={inboxState.isLoadingNotifications}
					/>
				{/if}
			{:else if inboxState.currentView === "thread" && inboxState.selectedConversation}
				<MessageThread
					conversation={inboxState.selectedConversation}
					messages={inboxState.messages}
					isLoading={inboxState.isLoadingMessages}
				/>
			{:else if inboxState.currentView === "compose"}
				<NewMessageSheet
					recipientId={inboxState.composeRecipientId}
					recipientName={inboxState.composeRecipientName}
					onConversationCreated={handleConversationSelect}
					onCancel={() => inboxState.cancelCompose()}
				/>
			{/if}
		</main>
	</div>
</Drawer>

<style>
	.inbox-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 400px;
	}

	.inbox-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 16px;
		border-bottom: 1px solid var(--theme-stroke, rgba(255, 255, 255, 0.1));
	}

	.inbox-header h2 {
		flex: 1;
		margin: 0;
		font-size: 18px;
		font-weight: 600;
		color: var(--theme-text, #ffffff);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.back-button,
	.close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: 8px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
		cursor: pointer;
		transition:
			background 0.2s ease,
			color 0.2s ease,
			transform 0.15s ease;
	}

	.back-button:hover,
	.close-button:hover {
		background: var(--theme-card-bg, rgba(255, 255, 255, 0.04));
		color: var(--theme-text, #ffffff);
	}

	.back-button:active,
	.close-button:active {
		transform: scale(0.95);
	}

	.back-button:focus-visible,
	.close-button:focus-visible {
		outline: none;
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--theme-accent) 50%, transparent);
	}

	.spacer {
		width: 32px;
	}

	.inbox-content {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
	}

	:global(.drawer-content.inbox-drawer) {
		--sheet-width: min(480px, 95vw);
		width: var(--sheet-width) !important;
	}

	@media (max-width: 768px) {
		:global(.drawer-content.inbox-drawer) {
			--sheet-width: 100%;
			width: 100% !important;
		}

		.inbox-container {
			max-height: 85vh;
		}

		/* When expanded (thread/compose view), fill the viewport */
		:global(.drawer-content.inbox-drawer.inbox-expanded) {
			height: 100vh !important;
			height: 100dvh !important; /* Dynamic viewport height for mobile browsers */
			max-height: none !important;
			border-radius: 0 !important;
		}

		.inbox-container.expanded {
			max-height: none;
			height: 100%;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.back-button,
		.close-button {
			transition: none !important;
		}
	}
</style>
