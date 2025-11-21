/**
 * CreationMethodPersistenceService.ts
 *
 * Service implementation for persisting user's creation method selection state.
 * Uses localStorage to track whether user has selected a creation method (persists across sessions).
 *
 * Domain: Create module - Persistent State Management
 */

import { injectable } from "inversify";

import type { ICreationMethodPersistenceService } from "../contracts/ICreationMethodPersistenceService";

@injectable()
export class CreationMethodPersistenceService
  implements ICreationMethodPersistenceService
{
  private readonly STORAGE_KEY = "tka-create-method-selected";

  /**
   * Get localStorage if available, handling SSR and browser compatibility
   */
  private getLocalStorage(): Storage | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      return window.localStorage;
    } catch {
      // LocalStorage may be unavailable in some contexts (private browsing, etc.)
      return null;
    }
  }

  /**
   * Check if user has ever selected a creation method (persists across sessions)
   */
  hasUserSelectedMethod(): boolean {
    const storage = this.getLocalStorage();
    if (!storage) {
      return false;
    }

    return storage.getItem(this.STORAGE_KEY) === "true";
  }

  /**
   * Mark that user has selected a creation method
   */
  markMethodSelected(): void {
    const storage = this.getLocalStorage();
    if (!storage) {
      return;
    }

    storage.setItem(this.STORAGE_KEY, "true");
  }

  /**
   * Clear the creation method selection state
   */
  resetSelection(): void {
    const storage = this.getLocalStorage();
    if (!storage) {
      return;
    }

    storage.removeItem(this.STORAGE_KEY);
  }
}
