/**
 * CAP Component Constants
 * Defines the available CAP transformation types with their display metadata
 */

import { CAPComponent, type CAPComponentInfo } from "../models";

/**
 * Complete list of CAP components with their display metadata
 * Used for UI rendering and user selection
 * Note: Descriptions are handled by CAPExplanationTextGenerator service
 */
export const CAP_COMPONENTS: readonly CAPComponentInfo[] = [
  {
    component: CAPComponent.ROTATED,
    label: "Rotated",
    shortLabel: "Rotated",
    icon: "🔄",
    color: "#36c3ff"
  },
  {
    component: CAPComponent.MIRRORED,
    label: "Mirrored",
    shortLabel: "Mirrored",
    icon: "🪞",
    color: "#6F2DA8"
  },
  {
    component: CAPComponent.SWAPPED,
    label: "Swapped",
    shortLabel: "Swapped",
    icon: "🔀",
    color: "#26e600"
  },
  {
    component: CAPComponent.COMPLEMENTARY,
    label: "Complementary",
    shortLabel: "Compl.",
    icon: "🎨",
    color: "#eb7d00"
  }
] as const;
