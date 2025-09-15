export type SortModeDetail =
  | { mode: "all" }
  | { mode: "group"; method: string };

export type SortOption = {
  value: string;
  label: string;
  icon: string;
  isSortMethod: boolean;
  description: string;
};
