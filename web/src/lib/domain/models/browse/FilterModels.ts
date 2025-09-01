/**
 * Browse Filter Models
 *
 * Interface definitions for browse filtering functionality.
 */

import type { FilterType } from "../../enums/enums";
import type { FilterValue } from "../../types/BrowseTypes";

export interface FilterConfig {
  type: FilterType;
  value: FilterValue;
  displayName: string;
}
