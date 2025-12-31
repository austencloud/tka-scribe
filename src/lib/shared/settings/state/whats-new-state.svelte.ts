/**
 * What's New Modal State
 *
 * Manages the "What's New" modal that shows after version updates.
 * Tracks whether user has seen the current version's changelog.
 */

import type { AppVersion } from "$lib/features/feedback/domain/models/version-models";

const STORAGE_KEY = "tka-last-seen-version";

class WhatsNewState {
  isOpen = $state(false);
  version = $state<AppVersion | null>(null);
  isLoading = $state(false);
  error = $state<string | null>(null);

  /**
   * Check if user has seen the current version
   */
  hasSeenVersion(version: string): boolean {
    if (typeof localStorage === "undefined") return true;
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    return lastSeen === version;
  }

  /**
   * Mark current version as seen
   */
  markVersionAsSeen(version: string): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(STORAGE_KEY, version);
  }

  /**
   * Open the modal with version data
   */
  open(version: AppVersion) {
    this.version = version;
    this.isOpen = true;
  }

  /**
   * Close and mark as seen
   */
  close() {
    if (this.version) {
      this.markVersionAsSeen(this.version.version);
    }
    this.isOpen = false;
  }

  /**
   * Just close without marking as seen (for escape/backdrop)
   */
  dismiss() {
    if (this.version) {
      this.markVersionAsSeen(this.version.version);
    }
    this.isOpen = false;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  /**
   * Reset state (for testing)
   */
  reset() {
    this.isOpen = false;
    this.version = null;
    this.isLoading = false;
    this.error = null;
  }
}

export const whatsNewState = new WhatsNewState();
