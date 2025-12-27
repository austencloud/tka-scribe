/**
 * Contract for the conversation service
 * Handles conversation CRUD and real-time subscriptions
 */

import type {
  Conversation,
  ConversationPreview,
  ConversationFetchOptions,
  GetOrCreateConversationResult,
} from "../../domain/models/conversation-models";

export interface IConversationManager {
  /**
   * Get or create a conversation between two users
   * Returns existing conversation if one exists, otherwise creates new
   */
  getOrCreateConversation(
    otherUserId: string
  ): Promise<GetOrCreateConversationResult>;

  /**
   * Get a specific conversation by ID
   */
  getConversation(conversationId: string): Promise<Conversation | null>;

  /**
   * Get current user's conversations (inbox list)
   */
  getConversations(
    options?: ConversationFetchOptions
  ): Promise<ConversationPreview[]>;

  /**
   * Subscribe to real-time updates of user's conversation list
   * Returns unsubscribe function
   */
  subscribeToConversations(
    callback: (conversations: ConversationPreview[]) => void
  ): () => void;

  /**
   * Get total unread message count across all conversations
   */
  getTotalUnreadCount(): Promise<number>;

  /**
   * Subscribe to total unread count changes
   * Returns unsubscribe function
   */
  subscribeToUnreadCount(callback: (count: number) => void): () => void;

  /**
   * Check if a conversation exists between current user and another user
   */
  conversationExists(otherUserId: string): Promise<string | null>;

  /**
   * Archive a conversation (hides from inbox but preserves messages)
   */
  archiveConversation(conversationId: string): Promise<void>;

  /**
   * Unarchive a conversation
   */
  unarchiveConversation(conversationId: string): Promise<void>;
}
