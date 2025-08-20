/**
 * useComponentLoading.ts - Component Loading Management Hook
 *
 * Handles loading state tracking and coordination for all sub-components
 * (Grid, Arrows, Props) within the Pictograph component.
 *
 * REFACTORED: Updated to use Svelte 5 runes ($state, $derived) with proper reactivity.
 */

import type { PictographData } from "$lib/domain";

export interface ComponentLoadingProps {
  /** Current pictograph data to determine required components */
  pictographData: PictographData | null;
}

export interface ComponentLoadingState {
  /** Set of loaded components */
  get loadedComponents(): Set<string>;
  /** Whether all required components are loaded */
  get allComponentsLoaded(): boolean;
  /** Whether components are currently loading */
  get isLoading(): boolean;
  /** Whether all components have finished loading */
  get isLoaded(): boolean;
  /** List of required components for current data */
  get requiredComponents(): string[];
  /** Current error message, if any */
  get errorMessage(): string | null;
  /** Handle component successfully loaded */
  handleComponentLoaded: (componentName: string) => void;
  /** Handle component loading error */
  handleComponentError: (componentName: string, error: string) => void;
  /** Clear all loading state */
  clearLoadingState: () => void;
}

/**
 * Factory function for component loading management.
 * Returns reactive state using Svelte 5 runes.
 */
export function useComponentLoading(props: ComponentLoadingProps): ComponentLoadingState {
  const { pictographData } = props;
  
  // State using Svelte 5 $state
  let loadedComponentsSet = $state(new Set<string>());
  let errorState = $state<string | null>(null);

  // Calculate required components based on data
  const getRequiredComponents = (data: PictographData | null): string[] => {
    const components = ["grid"];

    if (!data) return components;

    if (data.arrows?.blue) components.push("blue-arrow");
    if (data.arrows?.red) components.push("red-arrow");
    if (data.props?.blue) components.push("blue-prop");
    if (data.props?.red) components.push("red-prop");

    return components;
  };

  return {
    // Reactive getters using $derived pattern
    get loadedComponents() {
      return loadedComponentsSet;
    },

    get requiredComponents() {
      return getRequiredComponents(pictographData);
    },

    get allComponentsLoaded() {
      const required = this.requiredComponents;
      return required.every(component => loadedComponentsSet.has(component));
    },

    get isLoading() {
      return !this.allComponentsLoaded && this.requiredComponents.length > 0;
    },

    get isLoaded() {
      return this.allComponentsLoaded;
    },

    get errorMessage() {
      return errorState;
    },

    // Action handlers
    handleComponentLoaded: (componentName: string) => {
      loadedComponentsSet.add(componentName);
      // Trigger reactivity by reassigning
      loadedComponentsSet = new Set(loadedComponentsSet);
    },

    handleComponentError: (componentName: string, error: string) => {
      errorState = `Component ${componentName} failed to load: ${error}`;
      // Still mark as loaded to prevent blocking
      loadedComponentsSet.add(componentName);
      loadedComponentsSet = new Set(loadedComponentsSet);
    },

    clearLoadingState: () => {
      loadedComponentsSet = new Set();
      errorState = null;
    },
  };
}
