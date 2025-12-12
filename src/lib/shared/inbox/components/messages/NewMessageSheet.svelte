<script lang="ts">
	/**
	 * NewMessageSheet
	 *
	 * User search and selection for starting a new conversation.
	 * Uses the shared UserSearchInput component for autocomplete.
	 */

	import { conversationService } from "$lib/shared/messaging/services/implementations/ConversationService";
	import UserSearchInput from "$lib/shared/user-search/UserSearchInput.svelte";
	import { authState } from "$lib/shared/auth/state/authState.svelte";

	interface Props {
		recipientId?: string | null;
		recipientName?: string | null;
		onConversationCreated: (conversationId: string) => void;
		onCancel: () => void;
	}

	let { recipientId, recipientName, onConversationCreated, onCancel }: Props = $props();

	let isCreating = $state(false);
	let selectedUserId = $state("");
	let selectedUserDisplay = $state("");

	// Exclude current user from search results (can't message yourself)
	let currentUserId = $derived(authState.user?.uid ?? "");
	let excludeUserIds = $derived(currentUserId ? [currentUserId] : []);

	// If recipient is pre-selected, create conversation immediately
	$effect(() => {
		if (recipientId) {
			createConversation(recipientId);
		}
	});

	async function createConversation(userId: string) {
		if (isCreating) return;

		isCreating = true;
		try {
			const result = await conversationService.getOrCreateConversation(userId);
			onConversationCreated(result.conversation.id);
		} catch (error) {
			console.error("Failed to create conversation:", error);
			// TODO: Show error toast
			isCreating = false;
		}
	}

	function handleUserSelect(user: { uid: string; displayName: string; email: string }) {
		selectedUserId = user.uid;
		selectedUserDisplay = user.displayName || user.email;
		createConversation(user.uid);
	}
</script>

<div class="new-message-sheet">
	{#if recipientId || isCreating}
		<!-- Pre-selected recipient or creating - show loading -->
		<div class="loading-state">
			<i class="fas fa-spinner fa-spin"></i>
			<span>Starting conversation with {recipientName || selectedUserDisplay || "user"}...</span>
		</div>
	{:else}
		<!-- User search -->
		<div class="search-section">
			<p class="search-label">Search for a user to message:</p>
			<UserSearchInput
				{selectedUserId}
				{selectedUserDisplay}
				onSelect={handleUserSelect}
				placeholder="Search by name or email..."
				inlineResults={true}
				{excludeUserIds}
			/>
		</div>
	{/if}
</div>

<style>
	.new-message-sheet {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 16px;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		height: 100%;
		min-height: 200px;
		text-align: center;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
	}

	.loading-state i {
		font-size: 24px;
	}

	.search-section {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.search-label {
		margin: 0;
		font-size: 14px;
		color: var(--theme-text-dim, rgba(255, 255, 255, 0.6));
	}
</style>
