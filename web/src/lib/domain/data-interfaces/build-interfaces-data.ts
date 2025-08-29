/**
 * Build Service Interfaces
 *
 * Interfaces for build tab services including pictograph organization,
 * workbench operations, and construction coordination.
 */
// ============================================================================
// PICTOGRAPH ORGANIZATION INTERFACES
// ============================================================================
import type { PictographData } from "$lib/domain/core";

// ============================================================================
// DATA CONTRACTS (Domain Models)
// ============================================================================

export interface OrganizedPictographs {
  individual: Record<string, PictographData[]>;
  grouped: Record<string, PictographData[]>;
  totalCount: number;
  hasIndividual: boolean;
  hasGrouped: boolean;
}

export interface PictographOrganizationConfig {
  individualSections: string[];
  groupedSections: string[];
}
