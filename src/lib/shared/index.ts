/**
 * Shared Library Exports
 *
 * Clean barrel exports for all shared functionality.
 * This is the main entry point for importing shared types, services, and utilities.
 */

// === SHARED INFRASTRUCTURE ===
export * from "./inversify";
export * from "./settings";
export * from "./theme";
export * from "./utils";
export { createComponentLogger, debugLogger } from "./utils/debug-logger";
export * from "./validation";

// === PICTOGRAPH CORE TYPES ===
export type { PictographData } from "./pictograph/shared/domain/models/PictographData";
export type { MotionData } from "./pictograph/shared/domain/models/MotionData";
export {
  GridLocation,
  GridMode,
} from "./pictograph/grid/domain/enums/grid-enums";
export {
  MotionType,
  Orientation,
  RotationDirection,
} from "./pictograph/shared/domain/enums/pictograph-enums";

// === UI TYPES ===
export type { TabId } from "./foundation/ui/UITypes";

// === MODULE EXPORTS ===
export * from "../modules/animate/shared/domain";
export * from "../modules/create/generate/circular/domain";
export * from "../modules/create/generate/shared/domain";
export * from "../modules/create/shared/domain/factories";
export * from "../modules/create/shared/domain/models";
export * from "../modules/discover/shared/domain";
export * from "../modules/learn/codex/domain";
export * from "../modules/learn/quiz/domain";
export * from "../modules/word-card/domain";

// === SPECIFIC EXPORTS FOR CROSS-MODULE DEPENDENCIES ===

// Storage utility functions (needed by modules)
import { StorageService } from "./foundation/services/implementations/StorageService";

export const safeSessionStorageGet = <T>(
  key: string,
  defaultValue: T | null = null
): T | null => {
  const storageService = new StorageService();
  return storageService.safeSessionStorageGet(key, defaultValue);
};

export const safeSessionStorageSet = <T>(key: string, value: T): void => {
  const storageService = new StorageService();
  storageService.safeSessionStorageSet(key, value);
};

export const safeSessionStorageRemove = (key: string): void => {
  const storageService = new StorageService();
  storageService.removeSessionStorageItem(key);
};

// CSV parser interface (needed by modules)
export type { ICSVPictographParserService as ICSVPictographParser } from "./foundation/services/contracts/data/ICSVPictographParserService";

// CAP Type service (needed by CAPCard component)
export type { ICAPTypeService } from "../modules/create/generate/shared/services/contracts/ICAPTypeService";

// Generation orchestration service (needed by generate-actions state)
export type { IGenerationOrchestrationService } from "../modules/create/generate/shared/services/contracts/IGenerationOrchestrationService";

// Sequence export service (needed by button components)
export type { ISequenceExportService } from "../modules/create/shared/services/contracts/ISequenceExportService";

// Mobile services (needed by components)
export type { IGestureService } from "./mobile/services/contracts/IGestureService";
export type { IMobileFullscreenService } from "./mobile/services/contracts/IMobileFullscreenService";
export type { IPlatformDetectionService } from "./mobile/services/contracts/IPlatformDetectionService";

// Beat grid models (needed by workbench)
export type {
  BeatGridConfig,
  ContainerDimensions,
  LayoutInfo,
} from "../modules/create/shared/workspace-panel/sequence-display/domain/models/beat-grid-models";
