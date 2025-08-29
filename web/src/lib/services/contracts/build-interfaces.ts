/**
 * Build Service Interfaces
 *
 * Interfaces for build tab services including pictograph organization,
 * workbench operations, and construction coordination.
 */
// ============================================================================
// PICTOGRAPH ORGANIZATION INTERFACES
// ============================================================================
import type {
  OrganizedPictographs,
  PictographOrganizationConfig,
} from "$lib/domain/data-interfaces/build-interfaces-data";
import type { PictographData } from "$lib/domain/core";

// ============================================================================
// SERVICE CONTRACTS (Behavioral Interfaces)
// ============================================================================

export interface IPictographOrganizerService {
  organizePictographs(pictographs: PictographData[]): OrganizedPictographs;
  determinePictographType(pictograph: PictographData): string;
  updateConfig(newConfig: Partial<PictographOrganizationConfig>): void;
  getConfig(): PictographOrganizationConfig;
}

export interface IBuildTabEventService {
  // Event handling methods for build tab interactions
  handleTabSwitch(tabId: string): void;
  handleWorkbenchUpdate(data: any): void;
  handleOptionSelection(option: any): void;
}

export interface IBuildTabTransitionService {
  // Transition management for build tab state changes
  transitionToTab(tabId: string): Promise<void>;
  getTransitionState(): string;
  isTransitioning(): boolean;
}

export interface IBuildTabService {
  // Main build tab coordination service
  initialize(): Promise<void>;
  getCurrentTab(): string;
  switchToTab(tabId: string): Promise<void>;
  getTabState(tabId: string): any;
  updateTabState(tabId: string, state: any): void;
}

// ============================================================================
// RE-EXPORT TYPES FOR EXTERNAL USE
// ============================================================================

// Re-export types that other modules need to import
export type {
  OrganizedPictographs,
  PictographOrganizationConfig,
} from "$lib/domain/data-interfaces/build-interfaces-data";
