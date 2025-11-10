/**
 * Info Sections
 *
 * Defines the tab navigation structure for the info experience.
 */

import type { InfoSection, InfoTab } from "./types";

export const INFO_SECTIONS: InfoSection[] = [
  {
    id: "resources" satisfies InfoTab,
    label: "Resources",
    icon: '<i class="fas fa-book"></i>',
    color: "rgba(102, 126, 234, 1)",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: "support" satisfies InfoTab,
    label: "Support",
    icon: '<i class="fas fa-heart"></i>',
    color: "rgba(236, 72, 153, 1)",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
  },
  {
    id: "dev" satisfies InfoTab,
    label: "Dev",
    icon: '<i class="fas fa-code"></i>',
    color: "rgba(34, 197, 94, 1)",
    gradient: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
  },
];
