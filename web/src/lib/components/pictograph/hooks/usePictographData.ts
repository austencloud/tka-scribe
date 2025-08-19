/**
 * usePictographData.ts - Data Transformation Hook
 *
 * Handles all data transformation and derivation logic for the Pictograph component.
 * This includes merging different data sources, filtering, and computing display values.
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
  effectivePictographData: PictographData | null;
  /** Check if we have valid data to render */
  hasValidData: boolean;
  /** Get the display letter for the pictograph */
  displayLetter: string | null;
  /** Get filtered arrows ready for rendering */
  arrowsToRender: Array<{ color: MotionColor; arrowData: ArrowData }>;
  /** Get filtered props ready for rendering */
  propsToRender: Array<{ color: MotionColor; propData: PropData }>;
}

/**
 * Hook for managing pictograph data transformation and derivation
 */
export function usePictographData(
  props: PictographDataProps
): PictographDataState {
  const { pictographData } = props;

  // Get effective pictograph data
  const effectivePictographData = pictographData || null;

  // Check if we have valid data
  const hasValidData = effectivePictographData != null;

  // Get display letter
  const displayLetter = (() => {
    const data = effectivePictographData;
    if (data?.letter) return data.letter;
    return null;
  })();

  // Get arrows to render
  const arrowsToRender = (() => {
    const data = effectivePictographData;
    if (!data?.arrows) return [];

    return Object.entries(data.arrows)
      .filter(([_, arrowData]) => arrowData != null)
      .map(([color, arrowData]) => ({
        color: color as MotionColor,
        arrowData: arrowData as ArrowData,
      }));
  })();

  // Get props to render
  const propsToRender = (() => {
    const data = effectivePictographData;
    if (!data?.props) return [];

    return Object.entries(data.props)
      .filter(([_, propData]) => propData != null)
      .map(([color, propData]) => ({
        color: color as MotionColor,
        propData: propData as PropData,
      }));
  })();

  return {
    effectivePictographData,
    hasValidData,
    displayLetter,
    arrowsToRender,
    propsToRender,
  };
}
