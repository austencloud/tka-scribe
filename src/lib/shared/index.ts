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

// === STORAGE UTILITIES ===
// (Keep these as they're pure utilities that don't create circular deps)
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

// === FOUNDATION CONTRACTS ===
export type { ICSVPictographParser } from "./foundation/services/contracts/data/ICSVPictographParser";
