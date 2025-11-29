/**
 * Gallery Source State
 *
 * Manages the source toggle between Community (public) and My Library (user's sequences).
 * Uses Svelte 5 runes pattern for reactive state.
 */

import { authStore } from "$lib/shared/auth/stores/authStore.svelte";

export type GallerySource = "community" | "my-library";

class GallerySourceManager {
  // Current source selection
  source = $state<GallerySource>("community");

  // Callback for when source changes
  private onChangeCallbacks: Array<(source: GallerySource) => void> = [];

  /**
   * Get the current source
   */
  get current(): GallerySource {
    return this.source;
  }

  /**
   * Check if My Library is selected
   */
  get isMyLibrary(): boolean {
    return this.source === "my-library";
  }

  /**
   * Check if Community is selected
   */
  get isCommunity(): boolean {
    return this.source === "community";
  }

  /**
   * Check if user can view their library (must be authenticated)
   */
  get canViewMyLibrary(): boolean {
    return authStore.isAuthenticated;
  }

  /**
   * Set the source
   */
  setSource(newSource: GallerySource): void {
    // If trying to set "my-library" but not authenticated, stay on community
    if (newSource === "my-library" && !authStore.isAuthenticated) {
      return;
    }

    if (this.source !== newSource) {
      this.source = newSource;
      // Notify listeners
      this.onChangeCallbacks.forEach((callback) => callback(newSource));
    }
  }

  /**
   * Toggle between sources
   */
  toggle(): void {
    if (this.source === "community" && authStore.isAuthenticated) {
      this.setSource("my-library");
    } else {
      this.setSource("community");
    }
  }

  /**
   * Register a callback for source changes
   * Returns an unsubscribe function
   */
  onChange(callback: (source: GallerySource) => void): () => void {
    this.onChangeCallbacks.push(callback);
    return () => {
      const index = this.onChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.onChangeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Reset to community (default)
   */
  reset(): void {
    this.source = "community";
  }
}

export const gallerySourceManager = new GallerySourceManager();
