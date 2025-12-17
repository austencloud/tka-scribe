/**
 * Inbox State Management
 *
 * Svelte 5 runes-based state for the combined messages + notifications inbox.
 */

import type { ConversationPreview, Conversation } from "$lib/shared/messaging/domain/models/conversation-models";
import type { Message } from "$lib/shared/messaging/domain/models/message-models";
import type { UserNotification } from "$lib/features/feedback/domain/models/notification-models";

// Inbox tab types
export type InboxTab = "messages" | "notifications";

// Inbox view state
export type InboxView = "list" | "thread" | "compose";

/**
 * Reactive inbox state using Svelte 5 runes
 */
class InboxState {
	// Drawer state
	isOpen = $state(false);
	activeTab = $state<InboxTab>("messages");
	currentView = $state<InboxView>("list");

	// Message state
	conversations = $state<ConversationPreview[]>([]);
	selectedConversation = $state<Conversation | null>(null);
	messages = $state<Message[]>([]);

	// Notification state
	notifications = $state<UserNotification[]>([]);

	// Derived unread counts from actual data - using arrow functions for reactivity
	unreadMessageCount = $derived.by(() => {
		return this.conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
	});

	unreadNotificationCount = $derived.by(() => {
		return this.notifications.filter((n) => !n.read).length;
	});

	// Loading states
	isLoadingConversations = $state(false);
	isLoadingMessages = $state(false);
	isLoadingNotifications = $state(false);

	// Compose state (for new message)
	composeRecipientId = $state<string | null>(null);
	composeRecipientName = $state<string | null>(null);

	// Derived state - using $derived.by for proper reactivity
	totalUnreadCount = $derived.by(() => {
		return this.unreadMessageCount + this.unreadNotificationCount;
	});

	hasUnread = $derived.by(() => {
		return this.totalUnreadCount > 0;
	});

	// Actions
	open(tab?: InboxTab) {
		this.isOpen = true;
		if (tab) {
			this.activeTab = tab;
		}
		this.currentView = "list";
	}

	close() {
		this.isOpen = false;
		this.selectedConversation = null;
		this.messages = [];
		this.currentView = "list";
		this.composeRecipientId = null;
		this.composeRecipientName = null;
	}

	setTab(tab: InboxTab) {
		this.activeTab = tab;
		this.currentView = "list";
		this.selectedConversation = null;
		this.messages = [];
	}

	selectConversation(conversation: Conversation) {
		this.selectedConversation = conversation;
		this.currentView = "thread";
	}

	backToList() {
		this.selectedConversation = null;
		this.messages = [];
		this.currentView = "list";
	}

	startCompose(recipientId?: string, recipientName?: string) {
		this.composeRecipientId = recipientId || null;
		this.composeRecipientName = recipientName || null;
		this.currentView = "compose";
	}

	cancelCompose() {
		this.composeRecipientId = null;
		this.composeRecipientName = null;
		this.currentView = "list";
	}

	// Update methods for subscriptions
	setConversations(conversations: ConversationPreview[]) {
		this.conversations = conversations;
	}

	setMessages(messages: Message[]) {
		this.messages = messages;
	}

	setNotifications(notifications: UserNotification[]) {
		this.notifications = notifications;
	}

	setLoadingConversations(loading: boolean) {
		this.isLoadingConversations = loading;
	}

	setLoadingMessages(loading: boolean) {
		this.isLoadingMessages = loading;
	}

	setLoadingNotifications(loading: boolean) {
		this.isLoadingNotifications = loading;
	}
}

// Export singleton instance
export const inboxState = new InboxState();
