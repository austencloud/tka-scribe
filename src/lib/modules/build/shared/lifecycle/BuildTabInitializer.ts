import type { IDeviceDetector, IViewportService } from "$shared";
import { ensureContainerInitialized, GridMode, resolve } from "$shared";
import { TYPES } from "$shared/inversify/types";
import type { IStartPositionService } from "../../construct/start-position-picker/services/contracts";
import type {
  BuildTabServices,
  BuildTabStates,
  InitializationResult,
  InitializationStatus,
} from "../orchestration/types";
import type {
  IBuildTabService,
  ISequencePersistenceService,
  ISequenceService,
} from "../services/contracts";
import { getBuildTabEventService } from "../services/implementations/BuildTabEventService";
import { createBuildTabState, createConstructTabState } from "../state";

/**
 * Handles all BuildTab initialization logic in one place
 * Extracted from BuildTab.svelte onMount to improve testability
 */
export class BuildTabInitializer {
  /**
   * Resolve all required services from DI container
   */
  async resolveServices(): Promise<BuildTabServices> {
    await ensureContainerInitialized();

    const services: BuildTabServices = {
      sequenceService: resolve<ISequenceService>(TYPES.ISequenceService),
      sequencePersistenceService: resolve<ISequencePersistenceService>(
        TYPES.ISequencePersistenceService
      ),
      startPositionService: resolve<IStartPositionService>(TYPES.IStartPositionService),
      buildTabService: resolve<IBuildTabService>(TYPES.IBuildTabService),
      deviceDetector: resolve<IDeviceDetector>(TYPES.IDeviceDetector),
      viewportService: resolve<IViewportService>(TYPES.IViewportService),
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
  async createStates(services: BuildTabServices): Promise<BuildTabStates> {
    const {
      sequenceService,
      sequencePersistenceService,
      buildTabService
    } = services;

    // Wait a tick to ensure component context is fully established
    await new Promise(resolve => setTimeout(resolve, 0));

    const buildTabState = createBuildTabState(
      sequenceService,
      sequencePersistenceService
    );

    const constructTabState = createConstructTabState(
      buildTabService,
      buildTabState.sequenceState,
      sequencePersistenceService
    );

    return { buildTabState, constructTabState };
  }

  /**
   * Initialize services and wire up callbacks
   */
  async initializeServices(
    services: BuildTabServices,
    states: BuildTabStates
  ): Promise<void> {
    const { buildTabService, startPositionService } = services;
    const { buildTabState } = states;

    // Initialize build tab service
    await buildTabService.initialize();

    // Set up sequence state callbacks for BuildTabEventService
    const buildTabEventService = getBuildTabEventService();
    buildTabEventService.setSequenceStateCallbacks(
      () => buildTabState.sequenceState.getCurrentSequence(),
      (sequence) => buildTabState.sequenceState.setCurrentSequence(sequence)
    );

    // Set up option history callback
    buildTabEventService.setAddOptionToHistoryCallback(
      (beatIndex, beatData) => buildTabState.addOptionToHistory(beatIndex, beatData)
    );

    // Load start positions
    await startPositionService.getDefaultStartPositions(GridMode.DIAMOND);
  }

  /**
   * Initialize states with persisted data
   */
  async initializeStates(states: BuildTabStates): Promise<void> {
    const { buildTabState, constructTabState } = states;

    await buildTabState.initializeWithPersistence();
    await constructTabState.initializeConstructTab();
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
      console.log(`✅ BuildTab initialized in ${initTime.toFixed(2)}ms`);

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
        `❌ BuildTab initialization failed after ${initTime.toFixed(2)}ms:`,
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

      throw new Error(
        `BuildTab initialization failed: ${status.error}`
      );
    }
  }
}
