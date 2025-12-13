/**
 * Thumbnail Components
 *
 * Lightweight pictograph rendering for gallery views.
 * Optimized for performance with virtualization support.
 */

// Components
export { default as ThumbnailBeatGrid } from "./ThumbnailBeatGrid.svelte";
export { default as ThumbnailBeatCell } from "./ThumbnailBeatCell.svelte";
export { default as ThumbnailPictograph } from "./ThumbnailPictograph.svelte";
export { default as SimplifiedPictograph } from "./SimplifiedPictograph.svelte";
export { default as ThumbnailGrid } from "./ThumbnailGrid.svelte";

// Types
export type {
  ThumbnailRenderConfig,
  ThumbnailSequenceData,
  ComputedPosition,
  ComputedAssets,
  PrecomputedBeatRenderData,
} from "./thumbnail-types";
export { DEFAULT_THUMBNAIL_CONFIG } from "./thumbnail-types";

// Utilities
export {
  calculateThumbnailGridLayout,
  getCellGridPosition,
  type ThumbnailGridLayout,
} from "./thumbnail-grid-utils";

// Asset Cache
export {
  getThumbnailAssetCache,
  preloadThumbnailAssets,
} from "./thumbnail-asset-cache.svelte";
