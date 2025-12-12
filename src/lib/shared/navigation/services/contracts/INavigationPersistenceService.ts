/**
 * INavigationPersistenceService
 *
 * Contract for navigation state persistence.
 * Handles loading and saving navigation state to localStorage/sessionStorage.
 */

import type { ModuleId } from "../../domain/types";

export interface INavigationPersistenceService {
  // Module persistence
  loadCurrentModule(): ModuleId | null;
  saveCurrentModule(moduleId: ModuleId): void;

  // Active tab persistence
  loadActiveTab(): string | null;
  saveActiveTab(tabId: string): void;

  // Last tab per module persistence (remembers where user was in each module)
  loadLastTabByModule(): Partial<Record<ModuleId, string>>;
  saveLastTabByModule(lastTabs: Partial<Record<ModuleId, string>>): void;

  // Panel persistence per tab (remembers which panel was open in each tab)
  loadLastPanelByTab(): Record<string, string | null>;
  saveLastPanelByTab(lastPanels: Record<string, string | null>): void;

  // Legacy mode persistence (for backwards compatibility)
  loadCreateMode(): string | null;
  saveCreateMode(mode: string): void;
  loadLearnMode(): string | null;
  saveLearnMode(mode: string): void;

  // Previous module (session storage - for settings toggle behavior)
  loadPreviousModule(): ModuleId | null;
  savePreviousModule(moduleId: ModuleId | null): void;
}
