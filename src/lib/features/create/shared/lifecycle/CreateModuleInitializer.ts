import type { IViewportService } from "$lib/shared/device/services/contracts/IViewportService";
import { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { IDeviceDetector } from "$lib/shared/device/services/contracts/IDeviceDetector";
import { resolve, ensureContainerInitialized } from "$lib/shared/inversify";
import { TYPES } from "$lib/shared/inversify/types";
import type { IStartPositionService } from "../../construct/start-position-picker/services/contracts";
import type {
  CreateModuleServices,
  CreateModuleStates,
  InitializationResult,
  InitializationStatus,
} from "../orchestration/types";
import type {
  ICreateModuleService,
  ISequencePersistenceService,
  ISequenceService,
} from "../services/contracts";
import type { ISequenceStatisticsService } from "../services/contracts/ISequenceStatisticsService";
import type { ISequenceTransformationService } from "../services/contracts/ISequenceTransformationService";
import type { ISequenceValidationService } from "../services/contracts/ISequenceValidationService";
import { getCreateModuleEventService } from "../services/implementations/CreateModuleEventService";
import { createCreateModuleState, createConstructTabState } from "../state";
import { createAssemblerTabState } from "../state/assembler-tab-state.svelte";
import { createGeneratorTabState } from "../state/generator-tab-state.svelte";
import { createModeSpecificPersistenceService } from "../services/implementations/ModeSpecificPersistenceService";

/**
 * Handles all CreateModule initialization logic in one place
 * Extracted from CreateModule.svelte onMount to improve testability
 */
export class CreateModuleInitializer {
  /**
   * Resolve all required services from DI container
   */
  async resolveServices(): Promise<CreateModuleServices> {
    await ensureContainerInitialized();

    const services: CreateModuleServices = {
      sequenceService: resolve<ISequenceService>(TYPES.ISequenceService),
      sequencePersistenceService: resolve<ISequencePersistenceService>(
        TYPES.ISequencePersistenceService
      ),
      startPositionService: resolve<IStartPositionService>(
        TYPES.IStartPositionService
      ),
      CreateModuleService: resolve<ICreateModuleService>(
        TYPES.ICreateModuleService
      ),
      deviceDetector: resolve<IDeviceDetector>(TYPES.IDeviceDetector),
      viewportService: resolve<IViewportService>(TYPES.IViewportService),
      sequenceStatisticsService: resolve<ISequenceStatisticsService>(
        TYPES.ISequenceStatisticsService
      ),
      sequenceTransformationService: resolve<ISequenceTransformationService>(
        TYPES.ISequenceTransformationService
      ),
      sequenceValidationService: resolve<ISequenceValidationService>(
        TYPES.ISequenceValidationService
      ),
    };

    // Validate all services resolved successfully
    const missingServices = Object.entries(services)
      .filter(([_, service]) => !service)
      .map(([key]) => key);

    if (missingServices.length > 0) {
      throw new Error(
        `Failed to resolve services: ${missingServices.join(", ")}`
      );
    }

    return services;
  }

  /**
   * Create state factories from resolved services
   */
  async createStates(
    services: CreateModuleServices
  ): Promise<CreateModuleStates> {
    const {
      sequenceService,
      sequencePersistenceService,
      CreateModuleService,
      sequenceStatisticsService,
      sequenceTransformationService,
      sequenceValidationService,
    } = services;

    // Wait a tick to ensure component context is fully established
    await new Promise((resolve) => setTimeout(resolve, 0));

    const CreateModuleState = createCreateModuleState(
      sequenceService,
      sequencePersistenceService,
      sequenceStatisticsService,
      sequenceTransformationService,
      sequenceValidationService
    );

    // Create mode-specific persistence services for each tab
    // This ensures each tab saves/loads from its own localStorage key
    const constructorPersistence = sequencePersistenceService
      ? createModeSpecificPersistenceService("constructor", sequencePersistenceService)
      : undefined;

    const assemblerPersistence = sequencePersistenceService
      ? createModeSpecificPersistenceService("assembler", sequencePersistenceService)
      : undefined;

    const generatorPersistence = sequencePersistenceService
      ? createModeSpecificPersistenceService("generator", sequencePersistenceService)
      : undefined;

    // Create constructor tab state with its own independent sequence state
    // Previously this was sharing CreateModuleState.sequenceState, causing tabs to share beat grids
    const constructTabState = createConstructTabState(
      CreateModuleService,
      sequenceService,
      constructorPersistence,
      sequenceStatisticsService,
      sequenceTransformationService,
      sequenceValidationService
    );

    // Create tab-specific states for assembler and generator
    // Each tab gets its own independent sequence state and persistence
    const assemblerTabState = createAssemblerTabState(
      sequenceService,
      assemblerPersistence,
      sequenceStatisticsService,
      sequenceTransformationService,
      sequenceValidationService
    );

    const generatorTabState = createGeneratorTabState(
      sequenceService,
      generatorPersistence,
      sequenceStatisticsService,
      sequenceTransformationService,
      sequenceValidationService
    );

    // Register tab states with CreateModuleState so getActiveTabSequenceState() works
    CreateModuleState.constructorTabState = constructTabState;
    CreateModuleState.assemblerTabState = assemblerTabState;
    CreateModuleState.generatorTabState = generatorTabState;

    // Also set the legacy constructTabState accessor for backwards compatibility
    CreateModuleState.constructTabState = constructTabState;

    return { CreateModuleState, constructTabState };
  }

  /**
   * Initialize services and wire up callbacks
   */
  async initializeServices(
    services: CreateModuleServices,
    states: CreateModuleStates
  ): Promise<void> {
    const { CreateModuleService, startPositionService } = services;
    const { CreateModuleState } = states;

    // Initialize Create Module Service
    await CreateModuleService.initialize();

    // Set up sequence state callbacks for CreateModuleEventService
    const CreateModuleEventService = getCreateModuleEventService();
    CreateModuleEventService.setSequenceStateCallbacks(
      () => CreateModuleState.sequenceState.getCurrentSequence(),
      (sequence) => CreateModuleState.sequenceState.setCurrentSequence(sequence)
    );

    // Set up option history callback
    CreateModuleEventService.setAddOptionToHistoryCallback(
      (beatIndex, beatData) =>
        CreateModuleState.addOptionToHistory(beatIndex, beatData)
    );

    // Load start positions
    await startPositionService.getDefaultStartPositions(GridMode.DIAMOND);
  }

  /**
   * Initialize states with persisted data
   */
  async initializeStates(states: CreateModuleStates): Promise<void> {
    const { CreateModuleState, constructTabState } = states;

    await CreateModuleState.initializeWithPersistence();
    await constructTabState.initializeConstructTab();

    // Initialize tab-specific sequence states with their persisted data
    // Each tab loads from its own localStorage key
    const ctorState = CreateModuleState.constructorTabState as any;
    if (ctorState?.sequenceState) {
      await ctorState.sequenceState.initializeWithPersistence();
    }
    if (CreateModuleState.assemblerTabState) {
      await CreateModuleState.assemblerTabState.initializeAssemblerTab();
    }
    if (CreateModuleState.generatorTabState) {
      await CreateModuleState.generatorTabState.initializeGeneratorTab();
    }
  }

  /**
   * Main initialization - orchestrates all setup steps with error handling and performance tracking
   */
  async initialize(): Promise<InitializationResult> {
    const startTime = performance.now();

    try {
      // Step 1: Resolve services
      const services = await this.resolveServices();

      // Step 2: Create state factories
      const states = await this.createStates(services);

      // Step 3: Initialize services and wire up callbacks
      await this.initializeServices(services, states);

      // Step 4: Load persisted data
      await this.initializeStates(states);

      const initTime = performance.now() - startTime;
      console.log(`✅ CreateModule initialized in ${initTime.toFixed(2)}ms`);

      // Success status
      const status: InitializationStatus = {
        servicesResolved: true,
        statesInitialized: true,
        persistenceLoaded: true,
        ready: true,
      };

      return {
        services,
        states,
        status,
      };
    } catch (error) {
      const initTime = performance.now() - startTime;
      console.error(
        `❌ CreateModule initialization failed after ${initTime.toFixed(2)}ms:`,
        error
      );

      // Error status
      const status: InitializationStatus = {
        servicesResolved: false,
        statesInitialized: false,
        persistenceLoaded: false,
        ready: false,
        error: error instanceof Error ? error.message : String(error),
      };

      throw new Error(`CreateModule initialization failed: ${status.error}`);
    }
  }
}
