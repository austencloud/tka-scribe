/**
 * Contract for the messaging service
 * Handles sending, fetching, and real-time subscription to messages
 */

import type {
  Message,
  CreateMessageInput,
  MessageFetchOptions,
  MessageAttachment,
} from "../../domain/models/message-models";

export interface IMessagingService {
  /**
   * Send a new message in a conversation
   */
  sendMessage(input: CreateMessageInput): Promise<Message>;

  /**
   * Send a message with just content (convenience method)
   */
  sendTextMessage(conversationId: string, content: string): Promise<Message>;

  /**
   * Get messages for a conversation with pagination
   */
  getMessages(
    conversationId: string,
    options?: MessageFetchOptions
  ): Promise<Message[]>;

  /**
   * Subscribe to real-time message updates for a conversation
   * Returns unsubscribe function
   */
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): () => void;

  /**
   * Mark all messages in a conversation as read for the current user
   */
  markAsRead(conversationId: string): Promise<void>;

  /**
   * Mark a specific message as read
   */
  markMessageAsRead(conversationId: string, messageId: string): Promise<void>;

  /**
   * Soft delete a message (sender only)
   */
  deleteMessage(conversationId: string, messageId: string): Promise<void>;

  /**
   * Edit a message (sender only, within time limit)
   */
  editMessage(
    conversationId: string,
    messageId: string,
    newContent: string
  ): Promise<Message>;
}
