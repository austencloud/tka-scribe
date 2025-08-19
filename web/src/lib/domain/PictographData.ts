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
import {
  ArrowType,
  Direction,
  GridPosition,
  LetterType,
  MotionColor,
  Timing,
} from "./enums";

export interface PictographData {
  // Core identity
  readonly id: string;

  // Grid configuration
  readonly gridData: GridData;

  // Arrows, props, and motions (consistent dictionary approach)
  readonly arrows: Record<string, ArrowData>; // "blue", "red"
  readonly props: Record<string, PropData>; // "blue", "red"
  readonly motions: Record<string, MotionData>; // "blue", "red"

  // Letter and position data
  readonly letter?: string | null;
  readonly startPosition?: GridPosition | null;
  readonly endPosition?: GridPosition | null;

  // Legacy compatibility properties
  readonly gridMode?: string | null;

  // Letter determination fields
  readonly beat: number;
  readonly timing?: Timing | null;
  readonly direction?: Direction | null;
  readonly duration?: number | null;
  readonly letterType?: LetterType | null;

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
    blue: createArrowData({
      arrowType: ArrowType.BLUE,
      color: MotionColor.BLUE,
    }),
    red: createArrowData({ arrowType: ArrowType.RED, color: MotionColor.RED }),
    ...data.arrows,
  };

  // Ensure we have blue and red props
  const props = {
    blue: createPropData({ color: MotionColor.BLUE }),
    red: createPropData({ color: MotionColor.RED }),
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
    beat: data.beat ?? 0,
    timing: data.timing ?? null,
    direction: data.direction ?? null,
    duration: data.duration ?? null,
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
  return (
    pictograph.arrows.blue ??
    createArrowData({ arrowType: ArrowType.BLUE, color: MotionColor.BLUE })
  );
}

export function getRedArrow(pictograph: PictographData): ArrowData {
  return (
    pictograph.arrows.red ??
    createArrowData({ arrowType: ArrowType.RED, color: MotionColor.RED })
  );
}

export function getBlueProp(pictograph: PictographData): PropData {
  return pictograph.props.blue ?? createPropData({ color: MotionColor.BLUE });
}

export function getRedProp(pictograph: PictographData): PropData {
  return pictograph.props.red ?? createPropData({ color: MotionColor.RED });
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
    beat: pictograph.beat,
    timing: pictograph.timing,
    direction: pictograph.direction,
    duration: pictograph.duration,
    letterType: pictograph.letterType,
    isBlank: pictograph.isBlank,
    isMirrored: pictograph.isMirrored,
    metadata: pictograph.metadata,
  };
}

export function pictographDataFromObject(
  data: Record<string, unknown>
): PictographData {
  const pictographData: Record<string, unknown> = {};

  if (data.id !== undefined) {
    pictographData.id = data.id;
  }
  if (data.gridData !== undefined) {
    pictographData.gridData = data.gridData;
  }
  if (data.arrows !== undefined) {
    pictographData.arrows = data.arrows;
  }
  if (data.props !== undefined) {
    pictographData.props = data.props;
  }
  if (data.motions !== undefined) {
    pictographData.motions = data.motions;
  }
  if (data.letter !== undefined) {
    pictographData.letter = data.letter;
  }
  if (data.startPosition !== undefined) {
    pictographData.startPosition = data.startPosition;
  }
  if (data.endPosition !== undefined) {
    pictographData.endPosition = data.endPosition;
  }
  if (data.beat !== undefined) {
    pictographData.beat = data.beat;
  }
  if (data.timing !== undefined) {
    pictographData.timing = data.timing;
  }
  if (data.direction !== undefined) {
    pictographData.direction = data.direction;
  }
  if (data.duration !== undefined) {
    pictographData.duration = data.duration;
  }
  if (data.letterType !== undefined) {
    pictographData.letterType = data.letterType;
  }
  if (data.isBlank !== undefined) {
    pictographData.isBlank = data.isBlank;
  }
  if (data.isMirrored !== undefined) {
    pictographData.isMirrored = data.isMirrored;
  }
  if (data.metadata !== undefined) {
    pictographData.metadata = data.metadata;
  }

  return createPictographData(pictographData as Partial<PictographData>);
}
