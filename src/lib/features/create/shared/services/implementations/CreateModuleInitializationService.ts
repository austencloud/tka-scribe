/**
 * Create Module Initialization Service Implementation
 *
 * Manages complete initialization sequence for CreateModule's construction interface.
 * Resolves services, creates state, configures callbacks for sequence building workflow.
 *
 * Domain: Create module - Sequence Construction Interface
 * Extracted from CreateModule.svelte onMount monolith.
 */

import { TYPES } from "$lib/shared/inversify/types";
import { resolve } from "$lib/shared/inversify/di";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import { injectable } from "inversify";
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
import type { BeatData } from "../../domain/models/BeatData";

@injectable()
export class CreateModuleInitializationService
  implements ICreateModuleInitializationService
{
  private sequenceService: ISequenceService | null = null;
  private sequencePersistenceService: ISequencePersistenceService | null = null;
  private startPositionService: IStartPositionService | null = null;
  private CreateModuleService: ICreateModuleService | null = null;
  private layoutService: IResponsiveLayoutService | null = null;
  private navigationSyncService: INavigationSyncService | null = null;
  private beatOperationsService: IBeatOperationsService | null = null;
  private deepLinkService: IDeepLinkSequenceService | null = null;
  private navigationDeepLinkService: IDeepLinkService | null = null;

  async initialize(): Promise<CreateModuleInitializationResult> {
    // Resolve all required services
    this.sequenceService = resolve(TYPES.ISequenceService);
    this.sequencePersistenceService = resolve(
      TYPES.ISequencePersistenceService
    );
    this.startPositionService = resolve(TYPES.IStartPositionService);
    this.CreateModuleService = resolve(TYPES.ICreateModuleService);
    this.layoutService = resolve(TYPES.IResponsiveLayoutService);
    this.navigationSyncService = resolve(TYPES.INavigationSyncService);
    this.beatOperationsService = resolve(TYPES.IBeatOperationsService);
    this.deepLinkService = resolve(TYPES.IDeepLinkSequenceService);
    this.navigationDeepLinkService = resolve(TYPES.IDeepLinkService);

    // Resolve UI coordination services
    const handlers = resolve<ICreateModuleHandlers>(TYPES.ICreateModuleHandlers);
    const creationMethodPersistence = resolve<ICreationMethodPersistenceService>(
      TYPES.ICreationMethodPersistenceService
    );
    const effectCoordinator = resolve<ICreateModuleEffectCoordinator>(
      TYPES.ICreateModuleEffectCoordinator
    );
    const shareService = resolve(TYPES.IShareService) as IShareService;

    // Resolve optional services needed for sequence operations (transformations, statistics, validation)
    const sequenceStatisticsService = resolve<ISequenceStatisticsService | undefined>(
      TYPES.ISequenceStatisticsService
    );
    const sequenceTransformationService = resolve<ISequenceTransformationService | undefined>(
      TYPES.ISequenceTransformationService
    );
    const sequenceValidationService = resolve<ISequenceValidationService | undefined>(
      TYPES.ISequenceValidationService
    );

    // Wait a tick to ensure component context is fully established
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Create state objects
    const CreateModuleState = createCreateModuleState(
      this.sequenceService!,
      this.sequencePersistenceService!,
      sequenceStatisticsService,
      sequenceTransformationService,
      sequenceValidationService
    );

    // Create tab-specific states - each tab has its own independent sequence state
    const constructTabState = createConstructTabState(
      this.CreateModuleService!,
      this.sequenceService!,
      this.sequencePersistenceService!,
      sequenceStatisticsService,
      sequenceTransformationService,
      sequenceValidationService,
      CreateModuleState
    );

    const assemblerTabState = createAssemblerTabState(
      this.sequenceService!,
      this.sequencePersistenceService!,
      sequenceStatisticsService,
      sequenceTransformationService,
      sequenceValidationService
    );

    const generatorTabState = createGeneratorTabState(
      this.sequenceService!,
      this.sequencePersistenceService!,
      sequenceStatisticsService,
      sequenceTransformationService,
      sequenceValidationService
    );

    // Attach tab states to CreateModuleState for easy access
    CreateModuleState.constructTabState = constructTabState; // Legacy accessor
    CreateModuleState.constructorTabState = constructTabState; // Main accessor (triggers setter for _constructorTabState)
    CreateModuleState.assemblerTabState = assemblerTabState;
    CreateModuleState.generatorTabState = generatorTabState;

    // Initialize services
    await this.CreateModuleService!.initialize();

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
      sequenceService: this.sequenceService!,
      sequencePersistenceService: this.sequencePersistenceService!,
      startPositionService: this.startPositionService!,
      CreateModuleService: this.CreateModuleService!,
      layoutService: this.layoutService!,
      navigationSyncService: this.navigationSyncService!,
      beatOperationsService: this.beatOperationsService!,

      // UI coordination services
      handlers,
      creationMethodPersistence,
      effectCoordinator,
      deepLinkService: this.deepLinkService!,
      shareService,
    };
  }

  async loadSequenceAndInitializePersistence(
    setSequence: (sequence: SequenceData) => void,
    initializePersistence: () => Promise<void>
  ): Promise<SequenceLoadResult> {
    if (!this.deepLinkService) {
      throw new Error("DeepLinkService not initialized");
    }

    // Try to load from deep link or pending edit
    const loadResult = await this.deepLinkService.loadFromAnySource(setSequence);

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
    activeTab: string,
    isWorkspaceEmpty: boolean,
    currentSelection: boolean
  ): boolean {
    // If already selected, keep it
    if (currentSelection) {
      return true;
    }

    // Check if on a creation method tab
    const isCreationMethodTab =
      activeTab === "assembler" ||
      activeTab === "constructor" ||
      activeTab === "generator";

    // Auto-select if on creation tab or workspace has content
    return isCreationMethodTab || !isWorkspaceEmpty;
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
    if (!this.startPositionService) {
      throw new Error("Start position service not initialized");
    }

    await this.startPositionService.getDefaultStartPositions(gridMode);
  }

  /**
   * Check if there's a share deep link waiting to be processed.
   * This checks if the navigation DeepLinkService has data stored for the "share" module.
   */
  hasShareDeepLink(): boolean {
    return this.navigationDeepLinkService?.hasDataForModule("share") ?? false;
  }
}
