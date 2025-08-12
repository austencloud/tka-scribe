/**
 * Animator module exports
 * Main entry point for the animation system
 */

// Core types and utilities
export * from './types/core.js';

// Constants
export * from './constants/index.js';

// Animation engine
export { SimplifiedAnimationEngine } from './core/engine/simplified-animation-engine.js';

// Canvas utilities
export { CanvasRenderer } from './utils/canvas/CanvasRenderer.js';
export { SVGGenerator } from './utils/canvas/SVGGenerator.js';

// SVG utilities
export { svgStringToImage } from './svgStringToImage.js';

// Components
export { default as AnimatorCanvas } from './components/canvas/AnimatorCanvas.svelte';
export { default as GridManager } from './components/canvas/GridManager.svelte';
