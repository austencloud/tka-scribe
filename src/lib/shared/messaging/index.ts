/**
 * Messaging module barrel exports
 */

// Domain models
export type {
	Conversation,
	ConversationPreview,
	ParticipantInfo,
} from "./domain/models/conversation-models";

export type {
	Message,
	MessagePreview,
	MessageAttachment,
	MessageAttachmentType,
	FeedbackAttachmentMetadata,
} from "./domain/models/message-models";

// Services
export { ConversationService } from "./services/implementations/ConversationService";
export { MessagingService } from "./services/implementations/MessagingService";

export type { IConversationService } from "./services/contracts/IConversationService";
export type { IMessagingService } from "./services/contracts/IMessagingService";
