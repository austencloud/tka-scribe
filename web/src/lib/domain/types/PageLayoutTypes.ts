/**
 * Page Layout Type Aliases
 *
 * Type aliases and utility types for page layout functionality.
 * Separated from interfaces for clean architecture.
 */

// Type aliases only
export type SequenceCardPaperSize = "A4" | "Letter" | "Legal" | "Tabloid";
export type PageOrientation = "Portrait" | "Landscape";
export type SequenceCardLayoutMode = "optimal" | "fixed" | "custom";
export type OptimizationGoal =
  | "maximize_card_size"
  | "minimize_pages"
  | "balanced";
