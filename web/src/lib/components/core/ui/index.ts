/**
 * Core UI Components - Reusable UI elements
 *
 * Barrel exports for all core UI components that are used across the application.
 * These are foundational UI elements that provide consistent styling and behavior.
 */

// Scrollable containers
export { default as GlassScrollContainer } from "./GlassScrollContainer.svelte";
export { default as SimpleGlassScroll } from "./SimpleGlassScroll.svelte";

// Loading and feedback components
export { default as LoadingScreen } from "./LoadingScreen.svelte";

// Toggle and input components
export { default as IOSToggle } from "./IOSToggle.svelte";

// Layout components
export { default as Splitter } from "./Splitter.svelte";

// Re-export types for convenience
export type {
  ScrollbarVariant as GlassScrollbarVariant,
  ScrollDirection,
} from "./GlassScrollContainer.svelte";
export type { ScrollbarVariant } from "./SimpleGlassScroll.svelte";
