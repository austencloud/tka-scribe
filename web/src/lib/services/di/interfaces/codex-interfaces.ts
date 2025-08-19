/**
 * Codex Service Interfaces for DI Container
 */

import type { ServiceInterface } from "../types";
import type { ICodexService } from "../../codex/ICodexService";
import type { ILetterMappingRepository } from "$lib/repositories/LetterMappingRepository";
import type { ILessonRepository } from "$lib/repositories/LessonRepository";
import type { IPictographQueryService } from "../../codex/PictographQueryService";
import type { IPictographOperationsService } from "../../codex/PictographOperationsService";
import type { CsvDataService } from "../../implementations/CsvDataService";

// Service interface definitions for DI container
export const ICodexServiceInterface: ServiceInterface<ICodexService> = {
  token: "ICodexService",
  implementation: null as unknown as new (...args: unknown[]) => ICodexService,
};

export const ILetterMappingRepositoryInterface: ServiceInterface<ILetterMappingRepository> =
  {
    token: "ILetterMappingRepository",
    implementation: null as unknown as new (
      ...args: unknown[]
    ) => ILetterMappingRepository,
  };

export const ILessonRepositoryInterface: ServiceInterface<ILessonRepository> = {
  token: "ILessonRepository",
  implementation: null as unknown as new (
    ...args: unknown[]
  ) => ILessonRepository,
};

export const IPictographQueryServiceInterface: ServiceInterface<IPictographQueryService> =
  {
    token: "IPictographQueryService",
    implementation: null as unknown as new (
      ...args: unknown[]
    ) => IPictographQueryService,
  };

export const IPictographOperationsServiceInterface: ServiceInterface<IPictographOperationsService> =
  {
    token: "IPictographOperationsService",
    implementation: null as unknown as new (
      ...args: unknown[]
    ) => IPictographOperationsService,
  };

export const ICsvDataServiceInterface: ServiceInterface<CsvDataService> = {
  token: "ICsvDataService",
  implementation: null as unknown as new (...args: unknown[]) => CsvDataService,
};
