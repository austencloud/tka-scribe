/**
 * Messaging Module - DI bindings for messaging services
 */

import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { MessagingService } from "$lib/shared/messaging/services/implementations/MessagingService";
import { ConversationService } from "$lib/shared/messaging/services/implementations/ConversationService";

export const messagingModule = new ContainerModule(
	(options: ContainerModuleLoadOptions) => {
		options.bind(TYPES.IMessagingService).to(MessagingService).inSingletonScope();
		options.bind(TYPES.IConversationService).to(ConversationService).inSingletonScope();
	}
);
