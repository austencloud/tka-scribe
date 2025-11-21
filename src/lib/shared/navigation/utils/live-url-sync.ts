/**
 * Live URL Sync
 *
 * Keeps the browser URL in sync with the current sequence so users can
 * share by simply copying the URL bar at any time.
 *
 * Uses history.replaceState to avoid filling browser history with edits.
 * Debounces updates to avoid constant URL changes while editing.
 */

import { browser } from "$app/environment";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

import { generateShareURL } from "./sequence-url-encoder";

// Track pending debounced updates
let pendingUpdate: ReturnType<typeof setTimeout> | null = null;

/**
 * Update the browser URL to reflect the current sequence
 * Uses replaceState to avoid creating history entries
 *
 * @param sequence - Current sequence to encode in URL (null to clear)
 * @param module - Module shorthand: 'construct', 'animate', etc.
 * @param options - Configuration options
 */
export function syncURLWithSequence(
  sequence: SequenceData | null,
  module: string,
  options: {
    debounce?: number; // Milliseconds to debounce (default: 500)
    immediate?: boolean; // Skip debouncing
    allowClear?: boolean; // Allow clearing URL (default: false during initialization)
  } = {}
): void {
  if (!browser) return;

  const { debounce = 500, immediate = false, allowClear = true } = options;

  // Clear any pending update
  if (pendingUpdate) {
    clearTimeout(pendingUpdate);
    pendingUpdate = null;
  }

  // If no sequence, only clear if explicitly allowed
  // This prevents clearing during initialization when deep links are loading
  if (!sequence?.beats || sequence.beats.length === 0) {
    if (allowClear) {
      clearSequenceFromURL();
    }
    return;
  }

  const updateURL = () => {
    try {
      const { url } = generateShareURL(sequence, module, { compress: true });

      // Extract just the search params
      const urlObj = new URL(url);
      const newSearch = urlObj.search;

      // Only update if the URL actually changed
      if (window.location.search !== newSearch) {
        // Use replaceState to avoid creating history entries
        const newURL = `${window.location.pathname}${newSearch}`;
        window.history.replaceState({}, "", newURL);

        console.log(`🔗 URL synced: ${newURL.length} chars`);
      }
    } catch (error) {
      console.error("Failed to sync URL with sequence:", error);
    }
  };

  // Immediate update or debounce
  if (immediate) {
    updateURL();
  } else {
    // Debounce to avoid constant updates while editing
    pendingUpdate = setTimeout(updateURL, debounce);
  }
}

/**
 * Clear sequence data from URL
 * Removes the 'open' parameter and reverts to clean URL
 */
export function clearSequenceFromURL(): void {
  if (!browser) return;

  const urlObj = new URL(window.location.href);
  const hasOpenParam = urlObj.searchParams.has("open");

  if (hasOpenParam) {
    urlObj.searchParams.delete("open");
    window.history.replaceState({}, "", urlObj.toString());
    console.log("🧹 Cleared sequence from URL");
    console.trace("Stack trace for URL clear:");
  }
}

/**
 * Get current sequence from URL if present
 * Useful for checking if URL contains a sequence
 */
export function hasSequenceInURL(): boolean {
  if (!browser) return false;
  const params = new URLSearchParams(window.location.search);
  return params.has("open");
}

/**
 * Create a debounced URL sync function for reactive effects
 * Returns a function that can be called repeatedly without creating
 * multiple pending timeouts
 */
export function createDebouncedURLSync(
  module: string,
  debounceMs = 500
): (sequence: SequenceData | null) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (sequence: SequenceData | null) => {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      syncURLWithSequence(sequence, module, { immediate: true });
      timeout = null;
    }, debounceMs);
  };
}
