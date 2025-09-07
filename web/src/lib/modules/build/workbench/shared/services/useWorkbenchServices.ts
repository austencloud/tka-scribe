/**
 * Workbench Service Bundle Resolver
 *
 * Provides a single function to resolve all workbench services at once,
 * optimizing service resolution pattern and improving type safety.
 */

import { resolve, TYPES } from "$shared";
import type { IBeatGridService } from "../../sequence-display/services/contracts";
import { createBeatGridState } from "../../sequence-display/state";
import { createSequenceState, createWorkbenchState } from "../state";
import type { ISequenceService, ISequenceStateService, IWorkbenchCoordinationService, IWorkbenchService } from "./contracts";


/**
 * Workbench Services Bundle
 * 
 * Contains all frequently used workbench services resolved via DI container
 */
export interface WorkbenchServices {
  sequenceStateService: ISequenceStateService;
  beatGridService: IBeatGridService;
  workbenchService: IWorkbenchService;
  workbenchCoordinationService: IWorkbenchCoordinationService;
  sequenceService?: ISequenceService;
}

/**
 * Resolves all workbench services from the DI container
 * 
 * This centralizes service resolution and provides type safety while
 * reducing the number of individual resolve() calls throughout components.
 * 
 * @returns Bundle of resolved workbench services
 * 
 * @example
 * ```typescript
 * const services = useWorkbenchServices();
 * const sequenceState = createSequenceState(services.sequenceStateService);
 * const workbenchState = createWorkbenchState(
 *   services.workbenchService,
 *   services.workbenchCoordinationService,
 *   sequenceState,
 *   beatGridState
 * );
 * ```
 */
export function useWorkbenchServices(): WorkbenchServices {
  // Core services (required)
  const sequenceStateService = resolve<ISequenceStateService>(
    TYPES.ISequenceStateService
  );
  const beatGridService = resolve<IBeatGridService>(
    TYPES.IBeatGridService
  );
  const workbenchService = resolve<IWorkbenchService>(
    TYPES.IWorkbenchService
  );
  const workbenchCoordinationService = resolve<IWorkbenchCoordinationService>(
    TYPES.IWorkbenchCoordinationService
  );

  // Optional services
  let sequenceService: ISequenceService | undefined;
  try {
    sequenceService = resolve<ISequenceService>(TYPES.ISequenceService);
  } catch {
    // Sequence service might not be registered in all contexts
    sequenceService = undefined;
  }

  return {
    sequenceStateService,
    beatGridService,
    workbenchService,
    workbenchCoordinationService,
    sequenceService,
  };
}

/**
 * Creates workbench dependencies factory
 * 
 * Alternative pattern for component initialization that provides
 * a clean separation between service resolution and state creation.
 * 
 * @returns Factory function for creating workbench dependencies
 */
export function createWorkbenchDependencies() {
  const services = useWorkbenchServices();
  
  return {
    services,
    createBeatGridState: () => createBeatGridState(services.beatGridService),
    createSequenceState: (serviceOverrides?: Partial<Pick<WorkbenchServices, 'sequenceService' | 'sequenceStateService'>>) => 
      createSequenceState({
        sequenceService: serviceOverrides?.sequenceService || services.sequenceService,
        sequenceStateService: serviceOverrides?.sequenceStateService || services.sequenceStateService,
      }),
    createWorkbenchState: (sequenceState: any, beatGridState: any) =>
      createWorkbenchState(
        services.workbenchService,
        services.workbenchCoordinationService,
        sequenceState,
        beatGridState
      ),
  };
}
