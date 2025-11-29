/**
 * Create Module Initialization Service Contract
 *
 * Handles all initialization logic for CreateModule including:
 * - Service resolution
 * - State object creation
 * - Persistence initialization
 * - Start position loading
 * - Event service configuration
 * - Deep link and sequence loading coordination
 *
 * Extracted from CreateModule.svelte onMount monolith.
 */

import type { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import type { PanelCoordinationState } from "../../state/panel-coordination-state.svelte";
import type { IBeatOperationsService } from "./IBeatOperationsService";
import type { ICreateModuleEffectCoordinator } from "./ICreateModuleEffectCoordinator";
import type { ICreateModuleHandlers } from "./ICreateModuleHandlers";
import type { ICreationMethodPersistenceService } from "./ICreationMethodPersistenceService";
import type { IDeepLinkSequenceService } from "./IDeepLinkSequenceService";
import type { INavigationSyncService } from "./INavigationSyncService";
import type { IResponsiveLayoutService } from "./IResponsiveLayoutService";

export interface CreateModuleInitializationResult {
  // State objects
  CreateModuleState: unknown;
  constructTabState: unknown;
  assemblerTabState: unknown;
  generatorTabState: unknown;

  // Core services
  sequenceService: unknown;
  sequencePersistenceService: unknown;
  startPositionService: unknown;
  CreateModuleService: unknown;
  layoutService: IResponsiveLayoutService;
  navigationSyncService: INavigationSyncService;
  beatOperationsService: IBeatOperationsService;

  // UI coordination services
  handlers: ICreateModuleHandlers;
  creationMethodPersistence: ICreationMethodPersistenceService;
  effectCoordinator: ICreateModuleEffectCoordinator;
  deepLinkService: IDeepLinkSequenceService;
  shareService: unknown;
}

export interface SequenceLoadResult {
  /** Whether a sequence was loaded from deep link or pending edit */
  sequenceLoaded: boolean;
  /** Tab to navigate to (from deep link) */
  targetTab?: string;
  /** Whether creation method should be marked as selected */
  shouldMarkMethodSelected: boolean;
}

export interface ICreateModuleInitializationService {
  /**
   * Initialize all services and state for CreateModule
   * @returns Initialized services and state objects
   * @throws Error if initialization fails
   */
  initialize(): Promise<CreateModuleInitializationResult>;

  /**
   * Configure event service callbacks for sequence operations
   * @param CreateModuleState Create Module State object
   * @param panelState Panel coordination state for callback handlers
   */
  configureEventCallbacks(
    CreateModuleState: unknown,
    panelState: PanelCoordinationState
  ): void;

  /**
   * Load default start positions for a grid mode
   * @param gridMode Grid mode to load start positions for
   */
  loadStartPositions(gridMode: GridMode): Promise<void>;

  /**
   * Load sequence from deep link or pending edit, then initialize persistence if needed.
   * Coordinates the order of operations to prevent data overwrites.
   *
   * @param setSequence Callback to set sequence in state
   * @param initializePersistence Callback to initialize persistence (only called if no sequence loaded)
   * @returns Result indicating what was loaded and what actions to take
   */
  loadSequenceAndInitializePersistence(
    setSequence: (sequence: SequenceData) => void,
    initializePersistence: () => Promise<void>
  ): Promise<SequenceLoadResult>;

  /**
   * Check if creation method was already selected based on current state.
   * Auto-detects based on active tab or workspace content.
   *
   * @param activeTab Current active navigation tab
   * @param isWorkspaceEmpty Whether the workspace has content
   * @param currentSelection Current selection state from persistence
   * @returns Whether method should be considered selected
   */
  detectCreationMethodSelection(
    activeTab: string,
    isWorkspaceEmpty: boolean,
    currentSelection: boolean
  ): boolean;

  /**
   * Check if there's a share deep link waiting to be processed.
   * Used to prevent panel restoration from localStorage when share panel
   * should open via deep link instead.
   *
   * @returns True if a share deep link is pending
   */
  hasShareDeepLink?(): boolean;
}
