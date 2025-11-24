/**
 * Deep Link Initialization
 *
 * Simplified integration that:
 * 1. Parses deep link from URL
 * 2. Stores data in deepLinkStore
 * 3. Navigates to target module/tab
 * 4. Modules consume the data on mount
 */

import { browser } from "$app/environment";
import { parseDeepLink } from "./sequence-url-encoder";
import { deepLinkStore } from "./deep-link-store.svelte";
import { navigationState } from "$shared";

const MODULE_MAPPINGS: Record<
  string,
  { moduleId: string; tabId?: string; navigateToModule?: string }
> = {
  construct: { moduleId: "create", tabId: "constructor" },
  constructor: { moduleId: "create", tabId: "constructor" },
  assemble: { moduleId: "create", tabId: "assembler" },
  assembler: { moduleId: "create", tabId: "assembler" },
  generate: { moduleId: "create", tabId: "generator" },
  generator: { moduleId: "create", tabId: "generator" },
  share: { moduleId: "share", navigateToModule: "create" }, // Share panel in create module
  animate: { moduleId: "animate", tabId: "single" },
  single: { moduleId: "animate", tabId: "single" },
  tunnel: { moduleId: "animate", tabId: "tunnel" },
  mirror: { moduleId: "animate", tabId: "mirror" },
  grid: { moduleId: "animate", tabId: "grid" },
  explore: { moduleId: "explore", tabId: "gallery" },
  gallery: { moduleId: "explore", tabId: "gallery" },
};

/**
 * Initialize deep link handling on app load
 * Call this once in MainInterface.svelte's onMount
 */
export function initializeDeepLinks(): void {
  if (!browser) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);

  // Check for spotlight parameter (Explorer module)
  const spotlightId = urlParams.get("spotlight");
  if (spotlightId) {
    // User is viewing a sequence in Explorer - ensure we're in the explore module
    navigationState.setCurrentModule("explore");
    navigationState.setActiveTab("gallery");
    return;
  }

  // Check for sheet parameter that might indicate a module
  const sheetType = urlParams.get("sheet");
  if (sheetType && !urlParams.has("open")) {
    // If we have a sheet but no sequence data, don't override the module
    // Let the default localStorage behavior handle it
    return;
  }

  const url = window.location.search;

  if (!url || url.length === 0) {
    return;
  }

  try {
    const parsed = parseDeepLink(url);

    if (!parsed) {
      return;
    }

    const mapping = MODULE_MAPPINGS[parsed.module.toLowerCase()];
    if (!mapping) {
      console.warn(`Unknown module in deep link: ${parsed.module}`);
      return;
    }

    // Store the sequence data for the module to consume
    deepLinkStore.set(mapping.moduleId, parsed.sequence, mapping.tabId);

    // Navigate to the target module (use navigateToModule if specified, otherwise use moduleId)
    const targetModule = mapping.navigateToModule || mapping.moduleId;
    navigationState.setCurrentModule(targetModule as any);

    // Navigate to the target tab if specified
    if (mapping.tabId) {
      navigationState.setActiveTab(mapping.tabId);
    }

    // NOTE: We don't clear the URL here anymore!
    // The live URL sync will keep the URL up-to-date as the sequence is edited.
    // This means users can always copy the URL bar to share their current work.
  } catch (error) {
    console.error("Error processing deep link:", error);
  }
}
