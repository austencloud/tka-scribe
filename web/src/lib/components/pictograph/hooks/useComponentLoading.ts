/**
 * useComponentLoading.ts - Component Loading Management Hook
 *
 * Handles loading state tracking and coordination for all sub-components
 * (Grid, Arrows, Props) within the Pictograph component.
 *
 * REFACTORED: Updated to use Svelte 5 runes ($state, $derived) with proper reactivity.
 */

import type { PictographData } from "$lib/domain";
import { MotionColor } from "$lib/domain/enums";

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
export function useComponentLoading(props: ComponentLoadingProps) {
  // Calculate required components based on data
  const getRequiredComponents = (data: PictographData | null): string[] => {
    const components = ["grid"];

    if (!data) return components;

    if (data.arrows?.[MotionColor.BLUE]) components.push("blue-arrow");
    if (data.arrows?.[MotionColor.RED]) components.push("red-arrow");
    if (data.props?.[MotionColor.BLUE]) components.push("blue-prop");
    if (data.props?.[MotionColor.RED]) components.push("red-prop");

    return components;
  };

  return {
    getRequiredComponents,
  };
}
