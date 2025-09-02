/**
 * Animator module exports
 * Main entry point for the animation system
 */

// Core types (refactored into focused modules)
export * from "./types/index.js";

// Constants
export * from "./constants/index.js";

// Animation engine
export { SequenceAnimationEngine as StandalonePortedEngine } from "$lib/services/implementations/animator/sequence-animation-engine.js";

// Math services are now in services/implementations/animator/
// Import them from $utils for convenience

// TODO: File utilities (PNG parser path issues)
// export { extractSequenceFromPNG } from "../../../animator/src/lib/animator/utils/file/png-parser.js";
// export type { PNGParseResult } from "../../../animator/src/lib/animator/utils/file/png-parser.js";

// Canvas utilities
export { CanvasRenderer } from "$lib/services/implementations/animator/CanvasRenderer.js";
export { SVGGenerator } from "$lib/services/implementations/animator/SVGGenerator.js";

// SVG utilities
export { svgStringToImage } from "./svgStringToImage.js";

// Components (based on standalone_animator.html reference implementation)
export { default as AnimatorCanvas } from "./AnimatorCanvas.svelte";
export { default as GridManager } from "./GridManager.svelte";
