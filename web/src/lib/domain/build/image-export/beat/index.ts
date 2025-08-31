/**
 * Beat Domain Types
 *
 * Export point for beat-related domain types and models.
 */

// Export beat-frame types with explicit Position alias to avoid conflicts
export type {
    BeatFrameConfig, Position as BeatFramePosition, ContainerDimensions,
    LayoutInfo
} from "../../workbench/beat-frame";
export * from "./fallback";
export * from "./grid";

