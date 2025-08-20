/**
 * useComponentLoading.ts - Component Loading Management Hook
 *
 * Handles loading state tracking and coordination for all sub-components
 * (Grid, Arrows, Props) within the Pictograph component.
 *
 * Note: This provides a factory function that returns reactive state for the Svelte component.
 */

import type { PictographData } from "$lib/domain";

export interface ComponentLoadingProps {
  /** Current pictograph data to determine required components */
  pictographData: PictographData | null;
}

export interface ComponentLoadingState {
  /** Set of loaded components */
  loadedComponents: Set<string>;
  /** Whether all required components are loaded */
  allComponentsLoaded: boolean;
  /** Whether components are currently loading */
  isLoading: boolean;
  /** Whether all components have finished loading */
  isLoaded: boolean;
  /** List of required components for current data */
  requiredComponents: string[];
  /** Handle component successfully loaded */
  handleComponentLoaded: (componentName: string) => void;
  /** Handle component loading error */
  handleComponentError: (componentName: string, error: string) => void;
  /** Current error message, if any */
  errorMessage: string | null;
  /** Clear all loading state */
  clearLoadingState: () => void;
}

/**
 * Factory function for component loading management.
 * Returns the state factory that can be used within Svelte components.
 */
export function useComponentLoading(props: ComponentLoadingProps) {
  // Calculate required components
  const getRequiredComponents = (pictographData: PictographData | null) => {
    const components = ["grid"];

    if (!pictographData) return components;

    if (pictographData.arrows?.blue) components.push("blue-arrow");
    if (pictographData.arrows?.red) components.push("red-arrow");
    if (pictographData.props?.blue) components.push("blue-prop");
    if (pictographData.props?.red) components.push("red-prop");

    return components;
  };

  return {
    getRequiredComponents,
  };
}
