// Foundation UI Components
// Reusable UI building blocks that are used across multiple modules

export { default as Drawer } from "./Drawer.svelte";
export { default as SheetDragHandle } from "./SheetDragHandle.svelte";
export { default as ConfirmDialog } from "./ConfirmDialog.svelte";
export { default as ErrorScreen } from "./ErrorScreen.svelte";
export { default as FontAwesomeIcon } from "./FontAwesomeIcon.svelte";
export { default as HorizontalSwipeContainer } from "./HorizontalSwipeContainer.svelte";
export { default as SkeletonLoader } from "./SkeletonLoader.svelte";
export { default as SimpleGlassScroll } from "./SimpleGlassScroll.svelte";

// Export utility handlers
export { SwipeToDismissHandler } from "./SwipeToDismissHandler";
export { FocusTrapHandler } from "./FocusTrapHandler";
export { SnapPointsHandler } from "./SnapPointsHandler";
export {
  generateDrawerId,
  registerDrawer,
  unregisterDrawer,
  isTopDrawer,
  getStackDepth,
  getDrawerZIndex,
  hasOpenDrawers,
} from "./DrawerStack";
export type { SwipePlacement, SwipeToDismissOptions } from "./SwipeToDismissHandler";
export type { FocusTrapOptions } from "./FocusTrapHandler";
export type { SnapPointValue, SnapPointsOptions } from "./SnapPointsHandler";

// Export types
export type { ScrollbarVariant, UISize, UIVariant } from "./types";

// Export UI types that are missing from shared exports
export type {
  ActiveCreateModule,
  BuildModeId,
  ExportResult,
  Html2CanvasFunction,
  PerformanceSnapshot,
  TabId,
  UIPerformanceMetrics,
  UITheme,
  WindowWithHtml2Canvas,
} from "./UITypes";
