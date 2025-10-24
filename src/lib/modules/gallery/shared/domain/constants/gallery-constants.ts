import { GallerySortMethod } from "../enums";
import type { SortConfig } from "../models/sort-models";

// Predefined sort configurations
export const SORT_CONFIGS: Record<GallerySortMethod, SortConfig> = {
  [GallerySortMethod.ALPHABETICAL]: {
    method: GallerySortMethod.ALPHABETICAL,
    direction: "asc",
    displayName: "Name A-Z",
  },
  [GallerySortMethod.DATE_ADDED]: {
    method: GallerySortMethod.DATE_ADDED,
    direction: "desc",
    displayName: "Recently Added",
  },
  [GallerySortMethod.DIFFICULTY_LEVEL]: {
    method: GallerySortMethod.DIFFICULTY_LEVEL,
    direction: "asc",
    displayName: "Difficulty",
  },
  [GallerySortMethod.SEQUENCE_LENGTH]: {
    method: GallerySortMethod.SEQUENCE_LENGTH,
    direction: "asc",
    displayName: "Length",
  },
  [GallerySortMethod.AUTHOR]: {
    method: GallerySortMethod.AUTHOR,
    direction: "asc",
    displayName: "Author",
  },
  [GallerySortMethod.POPULARITY]: {
    method: GallerySortMethod.POPULARITY,
    direction: "desc",
    displayName: "Popularity",
  },
};
