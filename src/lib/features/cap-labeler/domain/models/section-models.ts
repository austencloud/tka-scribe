/**
 * Domain models for section-based CAP designations
 */

import type { ComponentId } from "../constants/cap-components";
import type { SliceSize } from "$lib/features/create/generate/circular/domain/models/circular-models";

export interface SectionDesignation {
  beats: number[]; // Beat numbers in this section
  components: ComponentId[];
  capType: string | null;
  sliceSize?: SliceSize | null; // Only relevant when "rotated" component is selected
  baseWord?: string; // TKA base word this section derives from (e.g., "bbbb", "ekek")
  baseWordFragment?: string; // Fragment of base word if only partial (e.g., "BB" from "BBBB")
  transformation?: string; // How this instance is transformed: "none", "mirrored", "rotated", etc.
}
