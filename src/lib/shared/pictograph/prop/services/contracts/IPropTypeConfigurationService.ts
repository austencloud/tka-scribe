/**
 * Prop Type Configuration Service Contract
 */

import type { PictographData } from "$shared";

export interface IPropTypeConfigurationService {
  /**
   * Convert UI prop type to filename format
   */
  mapPropTypeToFilename(uiPropType: string): string;

  /**
   * Create pictograph data with all motions using the specified prop type
   */
  applyPropTypeToPictographData(
    pictographData: PictographData,
    userPropType: string
  ): PictographData;
}
