/**
 * Conversation domain models for the peer-to-peer messaging system
 */

import type { MessagePreview } from "./message-models";

/**
 * Information about a participant in a conversation
 */
export interface ParticipantInfo {
	userId: string;
	displayName: string;
	avatar?: string;
	joinedAt: Date;
}

/**
 * A conversation between two or more users
 */
export interface Conversation {
	id: string;
	participants: string[]; // Sorted user IDs for consistent querying
	participantInfo: Record<string, ParticipantInfo>;
	lastMessage?: MessagePreview;
	unreadCount: Record<string, number>; // Per-user unread counts
	createdAt: Date;
	updatedAt: Date;
	// Future: muted, archived, pinned flags per user
}

/**
 * Simplified conversation view for inbox list
 */
export interface ConversationPreview {
	id: string;
	otherParticipant: ParticipantInfo;
	lastMessage?: MessagePreview;
	unreadCount: number;
	updatedAt: Date;
}

/**
 * Options for fetching conversations
 */
export interface ConversationFetchOptions {
	limit?: number;
	includeArchived?: boolean;
}

/**
 * Result from getting or creating a conversation
 */
export interface GetOrCreateConversationResult {
	conversation: Conversation;
	isNew: boolean;
}
