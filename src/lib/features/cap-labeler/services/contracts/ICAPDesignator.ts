import type { SliceSize } from "$lib/features/create/generate/circular/domain/models/circular-models";

/**
 * Base CAP component ID
 */
export type ComponentId =
  | "rotated"
  | "swapped"
  | "mirrored"
  | "flipped"
  | "inverted"
  | "rewound"
  | "repeated"
  | "modular";

/**
 * CAP designation for a sequence or section
 */
export interface CAPDesignation {
  components: ComponentId[];
  capType: string | null;
  sliceSize?: SliceSize | null; // Only relevant when "rotated" component is selected
}

/**
 * Section designation for a subset of beats
 */
export interface SectionDesignation {
  beats: number[]; // Beat numbers in this section
  components: ComponentId[];
  capType: string | null;
  sliceSize?: SliceSize | null; // Only relevant when "rotated" component is selected
}

/**
 * Service for formatting and managing CAP designations
 */
export interface ICAPDesignator {
  /**
   * Format a designation for display
   */
  formatDesignation(designation: CAPDesignation | SectionDesignation): string;

  /**
   * Format section beats for display (e.g., "1-4" or "1,3,5")
   */
  formatSectionBeats(beats: number[]): string;

  /**
   * Check if a designation is a duplicate of existing designations
   */
  isDuplicateDesignation(
    designation: CAPDesignation,
    existing: CAPDesignation[]
  ): boolean;
}
