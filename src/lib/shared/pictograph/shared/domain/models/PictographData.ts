/**
 * Pictograph Domain Model
 *
 * Immutable data for a complete pictograph.
 * Based on modern desktop app's pictographData.py
 */
import { Letter } from "../../../../foundation/domain/models/Letter";
import { GridPosition } from "../../../grid/domain/enums/grid-enums";
import { MotionColor } from "../enums/pictograph-enums";
import type { MotionData } from "./MotionData";

export interface PictographData {
  readonly id: string;

  // Letter and position data
  readonly letter?: Letter | null;
  readonly startPosition?: GridPosition | null;
  readonly endPosition?: GridPosition | null;

  // Movement data - explicitly allow undefined values
  readonly motions: Partial<Record<MotionColor, MotionData | undefined>>;
}
