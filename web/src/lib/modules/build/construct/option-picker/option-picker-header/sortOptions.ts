import type { SortOption } from "./sort-types";

// Enhanced view options with better icons and descriptions (matching legacy)
export const viewOptions: readonly SortOption[] = [
  {
    value: "all",
    label: "All",
    icon: "✨",
    isSortMethod: false,
    description: "Show all valid options",
  },
  {
    value: "type",
    label: "Type",
    icon: "📁",
    isSortMethod: true,
    description: "Group options by type",
  },
  {
    value: "endPosition",
    label: "End",
    icon: "🏁",
    isSortMethod: true,
    description: "Group by ending position",
  },
  {
    value: "reversals",
    label: "Reversals",
    icon: "🔄",
    isSortMethod: true,
    description: "Group by reversals",
  },
];
