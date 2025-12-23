/**
 * CAP component definitions and mapping utilities
 */

import { CAPType } from "$lib/features/create/generate/circular/domain/models/circular-models";

// Base CAP components that can be combined
// Icons and colors match the Generate tab's CAP component buttons
export const BASE_COMPONENTS = [
  {
    id: "rotated",
    label: "Rotated",
    description: "Positions rotate 180° (or 90°)",
    icon: "rotate",
    color: "#36c3ff",
  },
  {
    id: "swapped",
    label: "Swapped",
    description: "Blue/Red hands swap roles",
    icon: "shuffle",
    color: "#26e600",
  },
  {
    id: "mirrored",
    label: "Mirrored",
    description: "Positions mirror vertically (left↔right)",
    icon: "left-right",
    color: "#6F2DA8",
  },
  {
    id: "flipped",
    label: "Flipped",
    description: "Positions mirror horizontally (top↔bottom)",
    icon: "up-down",
    color: "#14b8a6",
  },
  {
    id: "inverted",
    label: "Inverted",
    description: "Pro ↔ Anti motion types flip",
    icon: "yin-yang",
    color: "#eb7d00",
  },
  {
    id: "rewound",
    label: "Rewound",
    description: "Second half plays in reverse",
    icon: "backward",
    color: "#ec4899",
  },
] as const;

export type ComponentId = (typeof BASE_COMPONENTS)[number]["id"];

// Map component combinations to CAPType
export function componentsToCAPType(
  components: Set<ComponentId>
): string | null {
  if (components.size === 0) return null;

  const sorted = Array.from(components).sort().join("_");

  // Map combinations to CAPType enum values
  const mapping: Record<string, CAPType | string> = {
    rotated: CAPType.STRICT_ROTATED,
    mirrored: CAPType.STRICT_MIRRORED,
    flipped: "strict_flipped",
    swapped: CAPType.STRICT_SWAPPED,
    inverted: CAPType.STRICT_INVERTED,
    inverted_swapped: CAPType.SWAPPED_INVERTED,
    inverted_rotated: CAPType.ROTATED_INVERTED,
    mirrored_swapped: CAPType.MIRRORED_SWAPPED,
    flipped_swapped: "flipped_swapped",
    inverted_mirrored: CAPType.MIRRORED_INVERTED,
    flipped_inverted: "flipped_inverted",
    rotated_swapped: CAPType.ROTATED_SWAPPED,
    mirrored_rotated: CAPType.MIRRORED_ROTATED,
    flipped_rotated: "flipped_rotated",
    inverted_mirrored_rotated: CAPType.MIRRORED_INVERTED_ROTATED,
    inverted_mirrored_rotated_swapped:
      CAPType.MIRRORED_ROTATED_INVERTED_SWAPPED,
    rewound: "rewound",
    inverted_rewound: "rewound_inverted",
    // Add more combinations as needed
  };

  return mapping[sorted] ?? `custom_${sorted}`;
}
