/**
 * Pictograph Domain Model
 *
 * Immutable data for a complete pictograph.
 * Based on modern desktop app's pictographData.py
 */

import type { ArrowData } from "./ArrowData";
import { createArrowData } from "./ArrowData";
import type { GridData } from "./GridData";
import { createGridData } from "./GridData";
import type { MotionData } from "./MotionData";
import type { PropData } from "./PropData";
import { createPropData } from "./PropData";
import { getLetterType as getTypeFromLetter } from "./Letter";
import { Direction, GridPosition, LetterType, Timing } from "./enums";

export interface PictographData {
  // Core identity
  readonly id: string;

  // Grid configuration
  readonly gridData: GridData;

  // Arrows, props, and motions (consistent dictionary approach)
  readonly arrows: Record<string, ArrowData>; // "blue", "red"
  readonly props: Record<string, PropData>; // "blue", "red"
  readonly motions: Record<string, MotionData>; // "blue", "red"

  // Letter data - simple string letter system
  readonly letter?: string | null;
  readonly startPosition?: GridPosition | null;
  readonly endPosition?: GridPosition | null;

  // Legacy compatibility properties
  readonly gridMode?: string | null;

  // Letter determination fields (legacy - now derived from letter.type)
  readonly timing?: Timing | null;
  readonly direction?: Direction | null;
  readonly letterType?: LetterType | null; // Deprecated: use letter.type instead

  // Visual state
  readonly isBlank: boolean;
  readonly isMirrored: boolean;

  // Metadata
  readonly metadata: Record<string, unknown>;
}

export function createPictographData(
  data: Partial<PictographData> = {}
): PictographData {
  // Ensure we have blue and red arrows
  const arrows = {
    blue: createArrowData(),
    red: createArrowData(),
    ...data.arrows,
  };

  // Ensure we have blue and red props
  const props = {
    blue: createPropData(),
    red: createPropData(),
    ...data.props,
  };

  return {
    id: data.id ?? crypto.randomUUID(),
    gridData: data.gridData ?? createGridData(),
    arrows,
    props,
    motions: data.motions ?? {},
    letter: data.letter ?? null,
    startPosition: data.startPosition ?? null,
    endPosition: data.endPosition ?? null,
    timing: data.timing ?? null,
    direction: data.direction ?? null,
    letterType: data.letterType ?? null,
    isBlank: data.isBlank ?? false,
    isMirrored: data.isMirrored ?? false,
    metadata: data.metadata ?? {},
  };
}

export function updatePictographData(
  pictograph: PictographData,
  updates: Partial<PictographData>
): PictographData {
  return {
    ...pictograph,
    ...updates,
  };
}

export function updateArrow(
  pictograph: PictographData,
  color: string,
  updates: Partial<ArrowData>
): PictographData {
  if (!(color in pictograph.arrows)) {
    throw new Error(`Arrow color '${color}' not found`);
  }

  const currentArrow = pictograph.arrows[color];
  const updatedArrow = { ...currentArrow, ...updates };
  const newArrows = { ...pictograph.arrows, [color]: updatedArrow } as Record<
    string,
    ArrowData
  >;
  return { ...pictograph, arrows: newArrows };
}

export function updateProp(
  pictograph: PictographData,
  color: string,
  updates: Partial<PropData>
): PictographData {
  if (!(color in pictograph.props)) {
    throw new Error(`Prop color '${color}' not found`);
  }

  const currentProp = pictograph.props[color];
  const updatedProp = { ...currentProp, ...updates };
  const newProps = { ...pictograph.props, [color]: updatedProp } as Record<
    string,
    PropData
  >;
  return { ...pictograph, props: newProps };
}

// Convenience getters
export function getBlueArrow(pictograph: PictographData): ArrowData {
  return pictograph.arrows.blue ?? createArrowData();
}

export function getRedArrow(pictograph: PictographData): ArrowData {
  return pictograph.arrows.red ?? createArrowData();
}

export function getBlueProp(pictograph: PictographData): PropData {
  return pictograph.props.blue ?? createPropData();
}

export function getRedProp(pictograph: PictographData): PropData {
  return pictograph.props.red ?? createPropData();
}

// Letter convenience functions
export function getLetterValue(pictograph: PictographData): string | null {
  return pictograph.letter ?? null;
}

export function getLetterType(pictograph: PictographData): LetterType | null {
  // Get type from letter string or fall back to legacy letterType
  if (pictograph.letter) {
    return (
      getTypeFromLetter(pictograph.letter) ?? pictograph.letterType ?? null
    );
  }
  return pictograph.letterType ?? null;
}

export function setLetter(
  pictograph: PictographData,
  letter: string | null
): PictographData {
  return {
    ...pictograph,
    letter,
    // Update legacy letterType for backward compatibility
    letterType: letter ? getTypeFromLetter(letter) : null,
  };
}

export function pictographDataToObject(
  pictograph: PictographData
): Record<string, unknown> {
  return {
    id: pictograph.id,
    gridData: pictograph.gridData,
    arrows: pictograph.arrows,
    props: pictograph.props,
    motions: pictograph.motions,
    letter: pictograph.letter,
    startPosition: pictograph.startPosition,
    endPosition: pictograph.endPosition,
    timing: pictograph.timing,
    direction: pictograph.direction,
    letterType: pictograph.letterType,
    isBlank: pictograph.isBlank,
    isMirrored: pictograph.isMirrored,
    metadata: pictograph.metadata,
  };
}

export function pictographDataFromObject(
  data: Record<string, unknown>
): PictographData {
  const pictographData: Partial<PictographData> = {
    ...(data.id !== undefined && { id: data.id as string }),
    ...(data.gridData !== undefined && { gridData: data.gridData as GridData }),
    ...(data.arrows !== undefined && {
      arrows: data.arrows as Record<string, ArrowData>,
    }),
    ...(data.props !== undefined && {
      props: data.props as Record<string, PropData>,
    }),
    ...(data.motions !== undefined && {
      motions: data.motions as Record<string, MotionData>,
    }),
    ...(data.letter !== undefined && {
      letter: data.letter as string | null,
    }),
    ...(data.startPosition !== undefined && {
      startPosition: data.startPosition as GridPosition | null,
    }),
    ...(data.endPosition !== undefined && {
      endPosition: data.endPosition as GridPosition | null,
    }),
    ...(data.timing !== undefined && { timing: data.timing as Timing | null }),
    ...(data.direction !== undefined && {
      direction: data.direction as Direction | null,
    }),
    ...(data.letterType !== undefined && {
      letterType: data.letterType as LetterType | null,
    }),
    ...(data.isBlank !== undefined && { isBlank: data.isBlank as boolean }),
    ...(data.isMirrored !== undefined && {
      isMirrored: data.isMirrored as boolean,
    }),
    ...(data.metadata !== undefined && {
      metadata: data.metadata as Record<string, unknown>,
    }),
  };

  return createPictographData(pictographData);
}
