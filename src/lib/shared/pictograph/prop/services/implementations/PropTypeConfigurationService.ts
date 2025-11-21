/**
 * Prop Type Configuration Service
 *
 * Handles prop type mappings and pictograph data transformations
 * for user-selected prop types. Extracts complex prop type logic
 * from state management into a testable service.
 */

import { injectable } from "inversify";

import type { PictographData, PropType } from "$shared";

import type { IPropTypeConfigurationService } from "../contracts/IPropTypeConfigurationService";

@injectable()
export class PropTypeConfigurationService
  implements IPropTypeConfigurationService
{
  /**
   * Map PropTypeTab UI IDs to actual prop filenames
   * PropTypeTab uses capitalized IDs, but filenames have specific formats
   */
  private readonly propTypeMapping: Record<string, string> = {
    Staff: "staff",
    Simplestaff: "simple_staff",
    Club: "club",
    Fan: "fan",
    Triad: "triad",
    Minihoop: "minihoop",
    Buugeng: "buugeng",
    Triquetra: "triquetra",
    Sword: "sword",
    Chicken: "chicken",
    Hand: "hand",
    Guitar: "guitar",
    Ukulele: "ukulele",
  };

  /**
   * Convert UI prop type to filename format
   */
  mapPropTypeToFilename(uiPropType: string): string {
    return this.propTypeMapping[uiPropType] || uiPropType.toLowerCase();
  }

  /**
   * Create pictograph data with all motions using the specified prop type
   * This ensures beta offset logic and placement calculations see consistent prop types
   */
  applyPropTypeToPictographData(
    pictographData: PictographData,
    userPropType: string
  ): PictographData {
    const propTypeFilename = this.mapPropTypeToFilename(userPropType);

    return {
      ...pictographData,
      motions: {
        red: pictographData.motions.red
          ? {
              ...pictographData.motions.red,
              propType: propTypeFilename as PropType,
            }
          : pictographData.motions.red,
        blue: pictographData.motions.blue
          ? {
              ...pictographData.motions.blue,
              propType: propTypeFilename as PropType,
            }
          : pictographData.motions.blue,
      },
    };
  }
}
