/**
 * Messaging Module - Placeholder for messaging feature loading
 *
 * Note: MessagingService and ConversationService use singleton exports
 * directly instead of DI resolution. This module exists only to support
 * the loadFeatureModule("messaging") pattern for lazy-loading.
 */

import type { ContainerModuleLoadOptions } from "inversify";
import { ContainerModule } from "inversify";

export const messagingModule = new ContainerModule(
  (_options: ContainerModuleLoadOptions) => {
    // Services use singleton exports - no DI bindings needed
  }
);
