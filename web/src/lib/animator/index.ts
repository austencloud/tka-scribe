/**
 * Animator module exports
 * Main entry point for the animation system
 */

// Core types (refactored into focused modules)
export * from "./types/index.js";

// Constants
export * from "./constants/index.js";

// Animation engine
export { SequenceAnimationEngine as StandalonePortedEngine } from "./core/engine/sequence-animation-engine.js";

// Math services (replaces standalone-math.js)
export * from "./utils/math/index.js";

// TODO: File utilities (PNG parser path issues)
// export { extractSequenceFromPNG } from "../../../animator/src/lib/animator/utils/file/png-parser.js";
// export type { PNGParseResult } from "../../../animator/src/lib/animator/utils/file/png-parser.js";

// Canvas utilities
export { CanvasRenderer } from "./utils/canvas/CanvasRenderer.js";
export { SVGGenerator } from "./utils/canvas/SVGGenerator.js";

// SVG utilities
export { svgStringToImage } from "./svgStringToImage.js";

// Components (based on standalone_animator.html reference implementation)
export { default as AnimatorCanvas } from "./components/canvas/AnimatorCanvas.svelte";
export { default as GridManager } from "./components/canvas/GridManager.svelte";
