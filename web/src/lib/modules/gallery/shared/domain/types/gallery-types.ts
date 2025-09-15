/**
 * Gallery Type Aliases
 *
 * Type aliases and utility types for gallery functionality.
 * Separated from interfaces and enums for clean architecture.
 */

// Re-export filtering types for compatibility
export type { GalleryFilterValue } from "$shared/persistence/domain";

// Gallery-specific type aliases
export type SortDirection = "asc" | "desc";
