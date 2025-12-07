/**
 * Shared Library Exports
 *
 * Centralized exports for commonly used shared utilities, UI primitives,
 * and cross-module types. Keep these exports aligned with real entrypoints
 * to avoid broken barrel references.
 */

// === SHARED UI PRIMITIVES ===
export { default as ConfirmDialog } from "./foundation/ui/ConfirmDialog.svelte";
export { default as Drawer } from "./foundation/ui/Drawer.svelte";
export { default as FontAwesomeIcon } from "./foundation/ui/FontAwesomeIcon.svelte";
export { default as HorizontalSwipeContainer } from "./foundation/ui/HorizontalSwipeContainer.svelte";
export { default as SheetDragHandle } from "./foundation/ui/SheetDragHandle.svelte";
export { default as SkeletonLoader } from "./foundation/ui/SkeletonLoader.svelte";
export { default as SimpleGlassScroll } from "./foundation/ui/SimpleGlassScroll.svelte";

// Panel Components - Shared building blocks for panel UIs
export { default as PanelAvatar } from "./components/panel/PanelAvatar.svelte";
export { default as PanelButton } from "./components/panel/PanelButton.svelte";
export { default as PanelCard } from "./components/panel/PanelCard.svelte";
export { default as PanelContent } from "./components/panel/PanelContent.svelte";
export { default as PanelGrid } from "./components/panel/PanelGrid.svelte";
export { default as PanelHeader } from "./components/panel/PanelHeader.svelte";
export { default as PanelSearch } from "./components/panel/PanelSearch.svelte";
export { default as PanelSpinner } from "./components/panel/PanelSpinner.svelte";
export { default as PanelState } from "./components/panel/PanelState.svelte";
export { default as PanelTabs } from "./components/panel/PanelTabs.svelte";

// DI helpers
export * from "./inversify";
export { createComponentLogger, debugLogger } from "./utils/debug-logger";

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

// PNG metadata extractor (needed by modules)
export { PngMetadataExtractor } from "./pictograph/shared/utils/png-metadata-extractor";

// CSV parser interface (needed by modules)
export type { ICSVPictographParser } from "./foundation/services/contracts/data/ICSVPictographParser";

// CAP Type service (needed by CAPCard component)
export type { ICAPTypeService } from "../features/create/generate/shared/services/contracts/ICAPTypeService";

// Generation orchestration service (needed by generate-actions state)
export type { IGenerationOrchestrationService } from "../features/create/generate/shared/services/contracts/IGenerationOrchestrationService";

// Sequence export service (needed by button components)
export type { ISequenceExportService } from "../features/create/shared/services/contracts/ISequenceExportService";

// Turns tuple generator service (needed by Pictograph component for TKA glyph)
export type { ITurnsTupleGeneratorService } from "./pictograph/arrow/positioning/placement/services/contracts/ITurnsTupleGeneratorService";

// Mobile services (needed by components)
export type { IGestureService } from "./mobile/services/contracts/IGestureService";
export type { IMobileFullscreenService } from "./mobile/services/contracts/IMobileFullscreenService";
export type { IPlatformDetectionService } from "./mobile/services/contracts/IPlatformDetectionService";

// Beat grid models (needed by workbench)
export type {
  BeatGridConfig,
  ContainerDimensions,
  LayoutInfo,
} from "../features/create/shared/workspace-panel/sequence-display/domain/models/beat-grid-models";
