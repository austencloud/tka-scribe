/**
 * Thumbnail Rendering Types
 *
 * Type definitions for lightweight thumbnail rendering in galleries.
 * These types support passing render configuration from parent to children
 * without per-instance service resolution.
 */

import type { PropType } from "$lib/shared/pictograph/prop/domain/enums/PropType";
import type { GridMode } from "$lib/shared/pictograph/grid/domain/enums/grid-enums";
import type { BeatData } from "$lib/features/create/shared/domain/models/BeatData";
import type { StartPositionData } from "$lib/features/create/shared/domain/models/StartPositionData";

/**
 * Render configuration passed from gallery to thumbnail components
 * Centralized settings subscription - computed once, passed to all children
 */
export interface ThumbnailRenderConfig {
  /** Blue hand prop type from settings */
  bluePropType: PropType;
  /** Red hand prop type from settings */
  redPropType: PropType;
  /** Show TKA letter glyph */
  showTKA: boolean;
  /** Show VTG mode glyph */
  showVTG: boolean;
  /** Show elemental glyph */
  showElemental: boolean;
  /** Show position glyphs */
  showPositions: boolean;
  /** Show reversal indicators */
  showReversals: boolean;
  /** Show non-radial grid points */
  showNonRadialPoints: boolean;
}

/**
 * Sequence beat data for thumbnail rendering
 */
export interface ThumbnailSequenceData {
  id: string;
  word: string;
  beats: readonly BeatData[];
  startPosition?: StartPositionData | BeatData;
  gridMode?: GridMode;
}

/**
 * Pre-computed position for prop/arrow rendering
 * Avoids per-instance service resolution
 */
export interface ComputedPosition {
  x: number;
  y: number;
  rotation: number;
}

/**
 * Pre-computed assets for rendering
 */
export interface ComputedAssets {
  imageSrc: string;
  center: { x: number; y: number };
}

/**
 * Complete pre-computed render data for a single beat
 */
export interface PrecomputedBeatRenderData {
  beatData: BeatData | StartPositionData;
  gridMode: GridMode;
  blueProps?: {
    position: ComputedPosition;
    assets: ComputedAssets;
  };
  redProps?: {
    position: ComputedPosition;
    assets: ComputedAssets;
  };
  blueArrow?: {
    position: ComputedPosition;
    assets: ComputedAssets;
    shouldMirror: boolean;
  };
  redArrow?: {
    position: ComputedPosition;
    assets: ComputedAssets;
    shouldMirror: boolean;
  };
}

/**
 * Default render config when settings aren't available
 */
export const DEFAULT_THUMBNAIL_CONFIG: ThumbnailRenderConfig = {
  bluePropType: "staff" as PropType,
  redPropType: "staff" as PropType,
  showTKA: true,
  showVTG: false,
  showElemental: false,
  showPositions: false,
  showReversals: true,
  showNonRadialPoints: false,
};
