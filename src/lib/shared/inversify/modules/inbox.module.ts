import { ContainerModule, type ContainerModuleLoadOptions } from "inversify";
import { TYPES } from "../types";

/**
 * Inbox Module
 *
 * Registers inbox-specific services and dependencies.
 * Note: Inbox primarily uses shared state (inboxState) and existing services
 * (NotificationService, ConversationService) so this module is lightweight.
 */
export const inboxModule = new ContainerModule(
  (options: ContainerModuleLoadOptions) => {
    // === INBOX SERVICES ===

    // Inbox uses shared services from notifications and messaging modules
    // No inbox-specific services to register at this time

    // Future: Could bind inbox-specific orchestrators or managers here if needed
  }
);
