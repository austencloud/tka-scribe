/**
 * Background Popularity State
 *
 * Reactive state for background popularity counts.
 * Subscribes to real-time updates from Firebase.
 * Uses a class-based pattern for proper Svelte 5 reactivity across modules.
 */

import { browser } from "$app/environment";
import type { BackgroundPopularityCounts } from "../services/contracts/IBackgroundPopularityService";
import { BackgroundPopularityService } from "../services/implementations/BackgroundPopularityService";

/**
 * Singleton class to manage background popularity state
 * Using a class with $state fields ensures reactivity works across module boundaries
 */
class BackgroundPopularityState {
  counts = $state<BackgroundPopularityCounts>({});
  isLoading = $state(true);
  private isInitialized = false;
  private service: BackgroundPopularityService | null = null;
  private unsubscribe: (() => void) | null = null;

  /**
   * Initialize the popularity tracking
   */
  async initialize(): Promise<void> {
    if (!browser || this.isInitialized) return;
    this.isInitialized = true;

    this.service = new BackgroundPopularityService();

    // Subscribe to real-time updates
    this.unsubscribe = await this.service.subscribeToPopularity((newCounts) => {
      this.counts = newCounts;
      this.isLoading = false;
    });

    // Also fetch initial data
    this.service.getPopularityCounts().then((initialCounts) => {
      if (Object.keys(initialCounts).length > 0) {
        this.counts = initialCounts;
      }
      this.isLoading = false;
    });
  }

  /**
   * Clean up subscriptions
   */
  cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.isInitialized = false;
  }

  /**
   * Get count for a specific background
   */
  getCount(backgroundKey: string): number {
    return this.counts[backgroundKey] ?? 0;
  }

  /**
   * Record a background change
   */
  async recordChange(
    oldBackground: string | undefined,
    newBackground: string
  ): Promise<void> {
    if (!this.service) {
      this.service = new BackgroundPopularityService();
    }
    await this.service.recordBackgroundChange(oldBackground, newBackground);
  }
}

// Export singleton instance
export const backgroundPopularity = new BackgroundPopularityState();

// Convenience exports for backward compatibility
export function initializePopularityTracking(): Promise<void> {
  return backgroundPopularity.initialize();
}

export function cleanupPopularityTracking(): void {
  backgroundPopularity.cleanup();
}

export function getPopularityCount(backgroundKey: string): number {
  return backgroundPopularity.getCount(backgroundKey);
}

export function getPopularityCounts(): BackgroundPopularityCounts {
  return backgroundPopularity.counts;
}

export function isPopularityLoading(): boolean {
  return backgroundPopularity.isLoading;
}

export async function recordBackgroundChange(
  oldBackground: string | undefined,
  newBackground: string
): Promise<void> {
  await backgroundPopularity.recordChange(oldBackground, newBackground);
}
