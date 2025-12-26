/**
 * Create Module Initialization Service Implementation
 *
 * Manages complete initialization sequence for CreateModule's construction interface.
 * Creates state, configures callbacks for sequence building workflow.
 *
 * Domain: Create module - Sequence Construction Interface
 * Extracted from CreateModule.svelte onMount monolith.
 *
 * REFACTORED: Now uses constructor injection instead of resolve() calls.
 * All dependencies are injected via @inject decorators for:
 * - Visible dependencies (can see what class needs in constructor)
 * - Compile-time safety (missing bindings fail at startup, not runtime)
 * - Testability (can pass mocks directly to constructor)
 */

import { TYPES } from "$lib/shared/inversify/types";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { injectable, inject } from "inversify";
import type { IStartPositionService } from "../../../construct/start-position-picker/services/contracts/IStartPositionService";
import { createCreateModuleState } from "$lib/features/create/shared/state/create-module-state.svelte";
import { createConstructTabState } from "$lib/features/create/shared/state/construct-tab-state.svelte";
import { createAssemblerTabState } from "$lib/features/create/shared/state/assembler-tab-state.svelte";
import { createGeneratorTabState } from "$lib/features/create/shared/state/generator-tab-state.svelte";
import type { PanelCoordinationState } from "$lib/features/create/shared/state/panel-coordination-state.svelte";
import type { IBeatOperationsService } from "../contracts/IBeatOperationsService";
import type { ICreateModuleEffectCoordinator } from "../contracts/ICreateModuleEffectCoordinator";
import type { ICreateModuleHandlers } from "../contracts/ICreateModuleHandlers";
import type { ICreateModuleService } from "../contracts/ICreateModuleService";
import type { ICreationMethodPersistenceService } from "../contracts/ICreationMethodPersistenceService";
import type { IDeepLinkSequenceService } from "../contracts/IDeepLinkSequenceService";
import type { INavigationSyncService } from "../contracts/INavigationSyncService";
import type { IResponsiveLayoutService } from "../contracts/IResponsiveLayoutService";
import type { ISequencePersistenceService } from "../contracts/ISequencePersistenceService";
import type { ISequenceService } from "../contracts/ISequenceService";
import type { ISequenceStatisticsService } from "../contracts/ISequenceStatisticsService";
import type { ISequenceTransformationService } from "../contracts/ISequenceTransformationService";
import type { ISequenceValidationService } from "../contracts/ISequenceValidationService";
import type {
  CreateModuleInitializationResult,
  ICreateModuleInitializationService,
  SequenceLoadResult,
} from "../contracts/ICreateModuleInitializationService";
import { getCreateModuleEventService } from "./CreateModuleEventService";
import type { IDeepLinkService } from "$lib/shared/navigation/services/contracts/IDeepLinkService";
import type { ICreateModuleState } from "../../types/create-module-types";
import type { IShareService } from "$lib/shared/share/services/contracts/IShareService";
import type { IPanelPersistenceService } from "../contracts/IPanelPersistenceService";
import type { BeatData } from "../../domain/models/BeatData";

@injectable()
export class CreateModuleInitializationService
  implements ICreateModuleInitializationService
{
  constructor(
    // Core services
    @inject(TYPES.ISequenceService)
    private readonly sequenceService: ISequenceService,
    @inject(TYPES.ISequencePersistenceService)
    private readonly sequencePersistenceService: ISequencePersistenceService,
    @inject(TYPES.IStartPositionService)
    private readonly startPositionService: IStartPositionService,
    @inject(TYPES.ICreateModuleService)
    private readonly createModuleService: ICreateModuleService,
    @inject(TYPES.IResponsiveLayoutService)
    private readonly layoutService: IResponsiveLayoutService,
    @inject(TYPES.INavigationSyncService)
    private readonly navigationSyncService: INavigationSyncService,
    @inject(TYPES.IBeatOperationsService)
    private readonly beatOperationsService: IBeatOperationsService,
    @inject(TYPES.IDeepLinkSequenceService)
    private readonly deepLinkService: IDeepLinkSequenceService,
    @inject(TYPES.IDeepLinkService)
    private readonly navigationDeepLinkService: IDeepLinkService,

    // UI coordination services
    @inject(TYPES.ICreateModuleHandlers)
    private readonly handlers: ICreateModuleHandlers,
    @inject(TYPES.ICreationMethodPersistenceService)
    private readonly creationMethodPersistence: ICreationMethodPersistenceService,
    @inject(TYPES.ICreateModuleEffectCoordinator)
    private readonly effectCoordinator: ICreateModuleEffectCoordinator,
    @inject(TYPES.IShareService)
    private readonly shareService: IShareService,
    @inject(TYPES.IPanelPersistenceService)
    private readonly panelPersistenceService: IPanelPersistenceService,

    // Sequence operation services
    @inject(TYPES.ISequenceStatisticsService)
    private readonly sequenceStatisticsService: ISequenceStatisticsService,
    @inject(TYPES.ISequenceTransformationService)
    private readonly sequenceTransformationService: ISequenceTransformationService,
    @inject(TYPES.ISequenceValidationService)
    private readonly sequenceValidationService: ISequenceValidationService
  ) {}

  async initialize(): Promise<CreateModuleInitializationResult> {
    // Wait a tick to ensure component context is fully established
    await new Promise((r) => setTimeout(r, 0));

    // Create state objects using injected services
    const CreateModuleState = createCreateModuleState(
      this.sequenceService,
      this.sequencePersistenceService,
      this.sequenceStatisticsService,
      this.sequenceTransformationService,
      this.sequenceValidationService
    );

    // Create tab-specific states - each tab has its own independent sequence state
    const constructTabState = createConstructTabState(
      this.createModuleService,
      this.sequenceService,
      this.sequencePersistenceService,
      this.sequenceStatisticsService,
      this.sequenceTransformationService,
      this.sequenceValidationService,
      CreateModuleState
    );

    const assemblerTabState = createAssemblerTabState(
      this.sequenceService,
      this.sequencePersistenceService,
      this.sequenceStatisticsService,
      this.sequenceTransformationService,
      this.sequenceValidationService
    );

    const generatorTabState = createGeneratorTabState(
      this.sequenceService,
      this.sequencePersistenceService,
      this.sequenceStatisticsService,
      this.sequenceTransformationService,
      this.sequenceValidationService
    );

    // Attach tab states to CreateModuleState for easy access
    CreateModuleState.constructTabState = constructTabState; // Legacy accessor
    CreateModuleState.constructorTabState = constructTabState; // Main accessor (triggers setter for _constructorTabState)
    CreateModuleState.assemblerTabState = assemblerTabState;
    CreateModuleState.generatorTabState = generatorTabState;

    // Initialize services
    await this.createModuleService.initialize();

    // Initialize tab states (but NOT persistence - that's done after deep link check)
    await constructTabState.initializeConstructTab();
    await assemblerTabState.initializeAssemblerTab();
    await generatorTabState.initializeGeneratorTab();

    // Note: Event callbacks configured separately via configureEventCallbacks()
    // after component has created panelState

    // Load start positions
    await this.loadStartPositions(GridMode.DIAMOND);

    return {
      // State objects
      CreateModuleState,
      constructTabState,
      assemblerTabState,
      generatorTabState,

      // Core services
      sequenceService: this.sequenceService,
      sequencePersistenceService: this.sequencePersistenceService,
      startPositionService: this.startPositionService,
      CreateModuleService: this.createModuleService,
      layoutService: this.layoutService,
      navigationSyncService: this.navigationSyncService,
      beatOperationsService: this.beatOperationsService,

      // UI coordination services
      handlers: this.handlers,
      creationMethodPersistence: this.creationMethodPersistence,
      effectCoordinator: this.effectCoordinator,
      deepLinkService: this.deepLinkService,
      shareService: this.shareService,
      panelPersistenceService: this.panelPersistenceService,
    };
  }

  async loadSequenceAndInitializePersistence(
    setSequence: (sequence: SequenceData) => void,
    initializePersistence: () => Promise<void>
  ): Promise<SequenceLoadResult> {
    // Try to load from deep link or pending edit
    const loadResult =
      await this.deepLinkService.loadFromAnySource(setSequence);

    if (loadResult.loaded) {
      // Initialize persistence so the deep link sequence can be saved
      // This ensures the sequence persists across navigation/reloads
      await initializePersistence();

      return {
        sequenceLoaded: true,
        targetTab: loadResult.targetTab,
        shouldMarkMethodSelected: true,
      };
    }

    // No sequence from deep link/pending edit - initialize from persistence
    await initializePersistence();

    return {
      sequenceLoaded: false,
      shouldMarkMethodSelected: false,
    };
  }

  detectCreationMethodSelection(
    _activeTab: string,
    isWorkspaceEmpty: boolean,
    currentSelection: boolean
  ): boolean {
    // If already selected (from localStorage), keep it
    if (currentSelection) {
      return true;
    }

    // Only auto-skip tutorial if workspace has content (deep link, restored sequence)
    // This indicates an existing user, not a first-timer
    // Don't skip based on current tab - let the tutorial show for new users
    return !isWorkspaceEmpty;
  }

  configureEventCallbacks(
    CreateModuleState: ICreateModuleState,
    panelState: PanelCoordinationState
  ): void {
    const CreateModuleEventService = getCreateModuleEventService();

    // Set up sequence state callbacks for CreateModuleEventService
    CreateModuleEventService.setSequenceStateCallbacks(
      () => CreateModuleState.sequenceState.getCurrentSequence(),
      (sequence) => CreateModuleState.sequenceState.setCurrentSequence(sequence)
    );

    // Set up option history callback
    CreateModuleEventService.setAddOptionToHistoryCallback(
      (beatIndex, beatData) =>
        CreateModuleState.addOptionToHistory(beatIndex, beatData)
    );

    // Set up undo snapshot callback
    CreateModuleEventService.setPushUndoSnapshotCallback((type, metadata) =>
      CreateModuleState.pushUndoSnapshot(type as any, metadata as any)
    );

    // Configure panel state callbacks on sequenceState
    const seqState = CreateModuleState.sequenceState as any;

    seqState.onEditPanelOpen = (
      beatIndex: number,
      beatData: unknown,
      beatsData: unknown[]
    ) => {
      if (beatsData && beatsData.length > 0) {
        // Multi-select: open batch edit panel
        panelState.openBatchEditPanel(beatsData as BeatData[]);
      } else {
        // Single beat: open Sequence Actions panel (auto-open effect will handle it based on selection)
        panelState.openSequenceActionsPanel();
      }
    };

    seqState.onEditPanelClose = () => {
      panelState.closeSequenceActionsPanel();
    };

    seqState.onAnimationStart = () => {
      panelState.setAnimating(true);
    };

    seqState.onAnimationEnd = () => {
      panelState.setAnimating(false);
    };
  }

  async loadStartPositions(gridMode: GridMode): Promise<void> {
    await this.startPositionService.getDefaultStartPositions(gridMode);
  }

  /**
   * Check if there's a share deep link waiting to be processed.
   * This checks if the navigation DeepLinkService has data stored for the "share" module.
   */
  hasShareDeepLink(): boolean {
    return this.navigationDeepLinkService.hasDataForModule("share");
  }
}
