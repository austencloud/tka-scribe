/**
 * Create Module Services Type Definition
 *
 * Container interface for all CreateModule services.
 * Used by the context system to provide services to descendant components.
 *
 * Domain: Create module - Service types
 */

import type { IShareService } from "$lib/shared/share/services/contracts/IShareService";
import type { IStartPositionService } from "../../construct/start-position-picker/services/contracts/IStartPositionService";
import type { IBeatOperationsService } from "../services/contracts/IBeatOperationsService";
import type { ICreateModuleService } from "../services/contracts/ICreateModuleService";
import type { INavigationSyncService } from "../services/contracts/INavigationSyncService";
import type { IResponsiveLayoutService } from "../services/contracts/IResponsiveLayoutService";
import type { ISequencePersister } from "../services/contracts/ISequencePersister";
import type { ISequenceRepository } from "../services/contracts/ISequenceRepository";

/**
 * Container for all CreateModule services
 */
export interface CreateModuleServices {
  sequenceService: ISequenceRepository;
  sequencePersistenceService: ISequencePersister;
  startPositionService: IStartPositionService;
  CreateModuleService: ICreateModuleService;
  layoutService: IResponsiveLayoutService;
  navigationSyncService: INavigationSyncService;
  beatOperationsService: IBeatOperationsService;
  shareService: IShareService;
}
