/**
 * Message domain models for the peer-to-peer messaging system
 */

/**
 * Attachment types that can be included in messages
 */
export type MessageAttachmentType = "image" | "sequence" | "link";

/**
 * An attachment on a message (images, sequence links, etc.)
 */
export interface MessageAttachment {
	type: MessageAttachmentType;
	url: string;
	thumbnailUrl?: string;
	metadata?: {
		title?: string;
		description?: string;
		width?: number;
		height?: number;
		sequenceId?: string;
	};
}

/**
 * A single message in a conversation
 */
export interface Message {
	id: string;
	conversationId: string;
	senderId: string;
	senderName: string;
	senderAvatar?: string;
	content: string;
	createdAt: Date;
	editedAt?: Date;
	readBy: string[]; // User IDs who have read this message
	attachments?: MessageAttachment[];
	isDeleted?: boolean; // Soft delete flag
}

/**
 * Input for creating a new message
 */
export interface CreateMessageInput {
	conversationId: string;
	content: string;
	attachments?: MessageAttachment[];
}

/**
 * Preview of a message for display in conversation list
 */
export interface MessagePreview {
	content: string;
	senderId: string;
	senderName: string;
	createdAt: Date;
	hasAttachment?: boolean;
}

/**
 * Options for fetching messages with pagination
 */
export interface MessageFetchOptions {
	limit?: number;
	beforeId?: string; // For cursor-based pagination
	afterId?: string;
}
