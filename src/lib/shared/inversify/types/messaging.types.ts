/**
 * Messaging Service Type Identifiers
 *
 * Services for user-to-user messaging and conversations.
 */

export const MessagingTypes = {
  IMessagingService: Symbol.for("IMessagingService"),
  IConversationService: Symbol.for("IConversationService"),
} as const;
