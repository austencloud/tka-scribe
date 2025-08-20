/**
 * Codex Service Interfaces for DI Container
 */

import type { ServiceInterface } from "../types";
import type { ICodexService } from "../../codex/ICodexService";
import type { ILetterMappingRepository } from "$lib/repositories/LetterMappingRepository";
import type { ILessonRepository } from "$lib/repositories/LessonRepository";

import type { IPictographOperationsService } from "../../codex/PictographOperationsService";
import type { ICsvLoaderService } from "../../implementations/data/CsvLoaderService";
import type { ILetterQueryService } from "../../implementations/data/LetterQueryService";
import type { IMotionQueryService } from "../../implementations/data/MotionQueryService";

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

export const IPictographOperationsServiceInterface: ServiceInterface<IPictographOperationsService> =
  {
    token: "IPictographOperationsService",
    implementation: null as unknown as new (
      ...args: unknown[]
    ) => IPictographOperationsService,
  };

// New focused microservices interfaces
export const ICsvLoaderServiceInterface: ServiceInterface<ICsvLoaderService> = {
  token: "ICsvLoaderService",
  implementation: null as unknown as new (
    ...args: unknown[]
  ) => ICsvLoaderService,
};

export const ILetterQueryServiceInterface: ServiceInterface<ILetterQueryService> =
  {
    token: "ILetterQueryService",
    implementation: null as unknown as new (
      ...args: unknown[]
    ) => ILetterQueryService,
  };

export const IMotionQueryServiceInterface: ServiceInterface<IMotionQueryService> =
  {
    token: "IMotionQueryService",
    implementation: null as unknown as new (
      ...args: unknown[]
    ) => IMotionQueryService,
  };
