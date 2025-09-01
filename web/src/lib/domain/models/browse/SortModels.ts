/**
 * Browse Sort Models
 *
 * Interface definitions for browse sorting functionality.
 */

import type { SortMethod } from "../../enums/enums";
import type { SortDirection } from "../../types/BrowseTypes";

export interface SortConfig {
  method: SortMethod;
  direction: SortDirection;
  displayName: string;
}
