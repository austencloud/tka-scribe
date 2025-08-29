/**
 * Build Service Interfaces
 *
 * Interfaces for build tab services including pictograph organization,
 * workbench operations, and construction coordination.
 */

import type { PictographData } from "./domain-types";

// ============================================================================
// PICTOGRAPH ORGANIZATION INTERFACES
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

export interface IPictographOrganizerService {
  organizePictographs(pictographs: PictographData[]): OrganizedPictographs;
  determinePictographType(pictograph: PictographData): string;
  updateConfig(newConfig: Partial<PictographOrganizationConfig>): void;
  getConfig(): PictographOrganizationConfig;
}
