/**
 * ICreateModuleEffectCoordinator.ts
 *
 * Service interface for coordinating all reactive effects in CreateModule.
 * Centralizes effect setup to reduce complexity in the component.
 *
 * Domain: Create module - Effect Orchestration
 */

import type { NavigationState } from "$lib/shared/navigation/state/navigation-state.svelte";
import type { CreateModuleState } from "../../state/create-module-state.svelte";
import type { ConstructTabState } from "../../state/construct-tab-state.svelte";
import type { PanelCoordinationState } from "../../state/panel-coordination-state.svelte";
import type { IResponsiveLayoutService } from "./IResponsiveLayoutService";
import type { INavigationSyncService } from "./INavigationSyncService";
import type { IDeepLinkSequenceService } from "./IDeepLinkSequenceService";
import type { ICreationMethodPersistenceService } from "./ICreationMethodPersistenceService";
import type { IBeatOperationsService } from "./IBeatOperationsService";
import type { AutosaveService } from "../../services/AutosaveService";

/**
 * Configuration for CreateModule effects
 */
export interface CreateModuleEffectConfig {
  // State accessors (use getters to avoid stale closures)
  getCreateModuleState: () => CreateModuleState | null;
  getConstructTabState: () => ConstructTabState | null;
  panelState: PanelCoordinationState;
  navigationState: NavigationState;

  // Services
  layoutService: IResponsiveLayoutService;
  navigationSyncService: INavigationSyncService;
  getDeepLinkService: () => IDeepLinkSequenceService | null;
  getCreationMethodPersistence: () => ICreationMethodPersistenceService | null;
  getBeatOperationsService: () => IBeatOperationsService | null;
  getAutosaveService: () => AutosaveService | null;

  // State flags
  isServicesInitialized: () => boolean;
  hasSelectedCreationMethod: () => boolean;
  setHasSelectedCreationMethod: (value: boolean) => void;

  // Layout callbacks
  onLayoutChange: (shouldUseSideBySideLayout: boolean) => void;
  getShouldUseSideBySideLayout: () => boolean;
  setAnimatingBeatNumber: (beat: number | null) => void;

  // Optional callbacks
  onCurrentWordChange?: (word: string) => void;
  onTabAccessibilityChange?: (canAccess: boolean) => void;

  // DOM elements
  toolPanelElement: HTMLElement | null;
  buttonPanelElement: HTMLElement | null;
}

/**
 * Service for coordinating all reactive effects in CreateModule
 */
export interface ICreateModuleEffectCoordinator {
  /**
   * Set up all reactive effects for CreateModule
   * @param config Configuration object containing all dependencies
   * @returns Cleanup function to dispose all effects
   */
  setupEffects(config: CreateModuleEffectConfig): () => void;
}
