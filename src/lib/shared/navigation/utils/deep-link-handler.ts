/**
 * Deep Link Handler
 *
 * Handles URL-based deep linking to modules with pre-loaded sequences.
 * Integrates with the navigation system and module state management.
 *
 * Supported URL format:
 * ?open=construct:encoded_sequence
 * ?open=animate:encoded_sequence
 * ?open=explore:encoded_sequence
 */

import { browser } from "$app/environment";
import type { SequenceData } from "$lib/shared/foundation/domain/models/SequenceData";

import { parseDeepLink } from "./sequence-url-encoder";

// ============================================================================
// Module & Tab Mappings
// ============================================================================

/**
 * Map short module names to full module IDs and their target tabs
 */
const MODULE_MAPPINGS: Record<string, { moduleId: string; tabId?: string }> = {
  construct: { moduleId: "create", tabId: "constructor" },
  constructor: { moduleId: "create", tabId: "constructor" },
  assemble: { moduleId: "create", tabId: "assembler" },
  assembler: { moduleId: "create", tabId: "assembler" },
  generate: { moduleId: "create", tabId: "generator" },
  generator: { moduleId: "create", tabId: "generator" },
  animate: { moduleId: "animate", tabId: "single" },
  tunnel: { moduleId: "animate", tabId: "tunnel" },
  mirror: { moduleId: "animate", tabId: "mirror" },
  grid: { moduleId: "animate", tabId: "grid" },
  explore: { moduleId: "explore", tabId: "gallery" },
  gallery: { moduleId: "explore", tabId: "gallery" },
};

// ============================================================================
// Deep Link Processing
// ============================================================================

export interface DeepLinkResult {
  moduleId: string;
  tabId: string | undefined;
  sequence: SequenceData;
}

/**
 * Process a deep link from the current URL
 * @returns DeepLinkResult if valid deep link found, null otherwise
 */
export function processDeepLink(): DeepLinkResult | null {
  if (!browser) return null;

  const url = window.location.search;
  const parsed = parseDeepLink(url);

  if (!parsed) return null;

  const mapping = MODULE_MAPPINGS[parsed.module.toLowerCase()];
  if (!mapping) {
    console.warn(`Unknown module in deep link: ${parsed.module}`);
    return null;
  }

  return {
    moduleId: mapping.moduleId,
    tabId: mapping.tabId,
    sequence: parsed.sequence,
  };
}

/**
 * Check if current URL contains a deep link
 */
export function hasDeepLink(): boolean {
  if (!browser) return false;
  const params = new URLSearchParams(window.location.search);
  return params.has("open");
}

/**
 * Clear the deep link from URL without navigation
 * Useful after processing to clean up the URL
 */
export function clearDeepLinkFromURL(): void {
  if (!browser) return;

  const url = new URL(window.location.href);
  url.searchParams.delete("open");

  // Update URL without reload
  window.history.replaceState({}, "", url.toString());
}

// ============================================================================
// Module-Specific Sequence Loading
// ============================================================================

export interface SequenceLoader {
  loadSequenceIntoCreate(sequence: SequenceData, tab?: string): Promise<void>;
  loadSequenceIntoAnimate(sequence: SequenceData, tab?: string): Promise<void>;
  loadSequenceIntoExplore(sequence: SequenceData): Promise<void>;
}

/**
 * Type definitions for service dependencies
 */
interface SequenceCoreState {
  setCurrentSequence: (sequence: SequenceData) => void;
}

interface AnimateModuleState {
  loadSequence?: (sequence: SequenceData) => void;
  setCurrentSequence?: (sequence: SequenceData) => void;
}

interface NavigationState {
  setCurrentModule: (moduleId: string) => void;
  setActiveTab: (tabId: string) => void;
}

/**
 * Create a sequence loader that interfaces with your DI container
 * This should be called with your actual service instances
 */
export function createSequenceLoader(services: {
  sequenceCoreState?: SequenceCoreState;
  animateModuleState?: AnimateModuleState;
  navigationState?: NavigationState;
}): SequenceLoader {
  return {
    loadSequenceIntoCreate(
      sequence: SequenceData,
      tab?: string
    ): Promise<void> {
      const { sequenceCoreState, navigationState } = services;

      if (!sequenceCoreState) {
        console.warn("SequenceCoreState not available for deep link");
        return Promise.resolve();
      }

      // Set the current sequence in create module state
      sequenceCoreState.setCurrentSequence(sequence);

      // Navigate to create module and specified tab
      if (navigationState) {
        navigationState.setCurrentModule("create");
        if (tab) {
          navigationState.setActiveTab(tab);
        }
      }

      return Promise.resolve();
    },

    loadSequenceIntoAnimate(
      sequence: SequenceData,
      tab?: string
    ): Promise<void> {
      const { animateModuleState, navigationState } = services;

      if (!animateModuleState) {
        console.warn("AnimateModuleState not available for deep link");
        return Promise.resolve();
      }

      // Set the sequence in animate module state
      // This assumes your animate module has a method to load sequences
      if (animateModuleState.loadSequence) {
        animateModuleState.loadSequence(sequence);
      } else if (animateModuleState.setCurrentSequence) {
        animateModuleState.setCurrentSequence(sequence);
      }

      // Navigate to animate module and specified tab
      if (navigationState) {
        navigationState.setCurrentModule("animate");
        if (tab) {
          navigationState.setActiveTab(tab);
        }
      }

      return Promise.resolve();
    },

    loadSequenceIntoExplore(sequence: SequenceData): Promise<void> {
      const { navigationState } = services;

      // For explore module, we might just navigate there
      // The sequence could be highlighted or opened in spotlight
      if (navigationState) {
        navigationState.setCurrentModule("explore");
      }

      // Optionally open in spotlight viewer
      if (browser && sequence.id) {
        const url = new URL(window.location.href);
        url.searchParams.set("spotlight", sequence.id);
        window.history.pushState({}, "", url.toString());
      }

      return Promise.resolve();
    },
  };
}

// ============================================================================
// Main Deep Link Handler
// ============================================================================

/**
 * Initialize deep link handling on app load
 * Call this once during app initialization
 *
 * @param loader - The sequence loader with service dependencies
 * @returns Cleanup function to remove listeners
 */
export function initializeDeepLinkHandling(loader: SequenceLoader): () => void {
  if (!browser) return () => {};

  const handleDeepLink = async () => {
    const result = processDeepLink();
    if (!result) return;

    console.log("Processing deep link:", result);

    // Load sequence into appropriate module
    try {
      switch (result.moduleId) {
        case "create":
          await loader.loadSequenceIntoCreate(result.sequence, result.tabId);
          break;
        case "animate":
          await loader.loadSequenceIntoAnimate(result.sequence, result.tabId);
          break;
        case "explore":
          await loader.loadSequenceIntoExplore(result.sequence);
          break;
        default:
          console.warn(`Unhandled module: ${result.moduleId}`);
      }

      // Clean up URL after processing
      clearDeepLinkFromURL();
    } catch (error) {
      console.error("Failed to process deep link:", error);
    }
  };

  // Handle initial load
  void handleDeepLink();

  // Handle popstate (back/forward navigation)
  const popstateHandler = () => void handleDeepLink();
  window.addEventListener("popstate", popstateHandler);

  // Return cleanup function
  return () => {
    window.removeEventListener("popstate", popstateHandler);
  };
}
