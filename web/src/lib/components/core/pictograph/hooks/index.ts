/**
 * Pictograph Hooks - Barrel export for all pictograph hooks
 * 
 * Re-exports the hooks from their actual locations in the services layer
 * to maintain the expected import structure for the Pictograph component.
 */

// Re-export hooks from their actual locations in services
export { usePictographData } from "$lib/services/implementations/core/pictograph/usePictographData";
export { useComponentLoading } from "$lib/services/implementations/core/pictograph/useComponentLoading";
export { useArrowPositioning } from "$lib/services/implementations/core/pictograph/useArrowPositioning";

// Re-export types for convenience
export type { PictographDataState, PictographDataProps } from "$lib/services/implementations/core/pictograph/usePictographData";
export type { ComponentLoadingState, ComponentLoadingProps } from "$lib/services/implementations/core/pictograph/useComponentLoading";
export type { ArrowPositioningState, ArrowPositioningProps } from "$lib/services/implementations/core/pictograph/useArrowPositioning";
