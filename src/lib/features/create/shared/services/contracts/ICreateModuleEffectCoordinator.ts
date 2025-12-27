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
import type { IResponsiveLayoutManager } from "./IResponsiveLayoutManager";
import type { INavigationSyncer } from "./INavigationSyncer";
import type { IDeepLinkSequenceHandler } from "./IDeepLinkSequenceHandler";
import type { ICreationMethodPersister } from "./ICreationMethodPersister";
import type { IBeatOperator } from "./IBeatOperator";
import type { Autosaver } from "../../services/Autosaver";

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
  layoutService: IResponsiveLayoutManager;
  NavigationSyncer: INavigationSyncer;
  getDeepLinker: () => IDeepLinkSequenceHandler | null;
  getCreationMethodPersistence: () => ICreationMethodPersister | null;
  getBeatOperator: () => IBeatOperator | null;
  getAutosaver: () => Autosaver | null;

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
