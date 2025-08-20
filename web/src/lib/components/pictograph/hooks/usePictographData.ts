/**
 * usePictographData.ts - Data Transformation Hook
 *
 * Handles all data transformation and derivation logic for the Pictograph component.
 * This includes merging different data sources, filtering, and computing display values.
 * 
 * REFACTORED: Updated to use proper Svelte 5 runes with reactive getters.
 */

import type {
  ArrowData,
  MotionColor,
  PictographData,
  PropData,
} from "$lib/domain";

export interface PictographDataProps {
  pictographData?: PictographData | null;
}

export interface PictographDataState {
  /** Get the effective pictograph data from either prop */
  get effectivePictographData(): PictographData | null;
  /** Check if we have valid data to render */
  get hasValidData(): boolean;
  /** Get the display letter for the pictograph */
  get displayLetter(): string | null;
  /** Get filtered arrows ready for rendering */
  get arrowsToRender(): Array<{ color: MotionColor; arrowData: ArrowData }>;
  /** Get filtered props ready for rendering */
  get propsToRender(): Array<{ color: MotionColor; propData: PropData }>;
}

/**
 * Hook for managing pictograph data transformation and derivation
 * Returns reactive getters using Svelte 5 $derived pattern
 */
export function usePictographData(
  props: PictographDataProps
): PictographDataState {
  const { pictographData } = props;

  return {
    // Get effective pictograph data
    get effectivePictographData() {
      return pictographData || null;
    },

    // Check if we have valid data
    get hasValidData() {
      return this.effectivePictographData != null;
    },

    // Get display letter
    get displayLetter() {
      const data = this.effectivePictographData;
      if (data?.letter) return data.letter;
      return null;
    },

    // Get arrows to render
    get arrowsToRender() {
      const data = this.effectivePictographData;
      if (!data?.arrows) return [];

      return Object.entries(data.arrows)
        .filter(([_, arrowData]) => arrowData != null)
        .map(([color, arrowData]) => ({
          color: color as MotionColor,
          arrowData: arrowData as ArrowData,
        }));
    },

    // Get props to render
    get propsToRender() {
      const data = this.effectivePictographData;
      if (!data?.props) return [];

      return Object.entries(data.props)
        .filter(([_, propData]) => propData != null)
        .map(([color, propData]) => ({
          color: color as MotionColor,
          propData: propData as PropData,
        }));
    },
  };
}
