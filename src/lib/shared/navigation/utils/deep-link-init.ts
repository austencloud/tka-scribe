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

const MODULE_MAPPINGS: Record<string, { moduleId: string; tabId?: string }> = {
  construct: { moduleId: "create", tabId: "constructor" },
  constructor: { moduleId: "create", tabId: "constructor" },
  assemble: { moduleId: "create", tabId: "assembler" },
  assembler: { moduleId: "create", tabId: "assembler" },
  generate: { moduleId: "create", tabId: "generator" },
  generator: { moduleId: "create", tabId: "generator" },
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
    console.log("⚠️ Deep link init skipped - not in browser");
    return;
  }

  const url = window.location.search;
  console.log("🔍 Checking for deep link in URL:", url);

  if (!url || url.length === 0) {
    console.log("ℹ️ No URL parameters found");
    return;
  }

  try {
    const parsed = parseDeepLink(url);

    if (!parsed) {
      console.log("ℹ️ No deep link detected in URL");
      return;
    }

    console.log("🔗 Deep link detected:", {
      module: parsed.module,
      sequenceBeats: parsed.sequence.beats.length,
      sequenceWord: parsed.sequence.word,
    });

    const mapping = MODULE_MAPPINGS[parsed.module.toLowerCase()];
    if (!mapping) {
      console.warn(`❌ Unknown module in deep link: ${parsed.module}`);
      return;
    }

    console.log("📍 Mapping to:", mapping);

    // Store the sequence data for the module to consume
    deepLinkStore.set(mapping.moduleId, parsed.sequence, mapping.tabId);
    console.log("💾 Stored sequence in deepLinkStore for module:", mapping.moduleId);

    // Navigate to the target module
    navigationState.setCurrentModule(mapping.moduleId as any);
    console.log("🧭 Set current module:", mapping.moduleId);

    // Navigate to the target tab if specified
    if (mapping.tabId) {
      navigationState.setActiveTab(mapping.tabId);
      console.log("📑 Set active tab:", mapping.tabId);
    }

    // NOTE: We don't clear the URL here anymore!
    // The live URL sync will keep the URL up-to-date as the sequence is edited.
    // This means users can always copy the URL bar to share their current work.

    console.log("✅ Deep link processed successfully!");
  } catch (error) {
    console.error("❌ Error processing deep link:", error);
  }
}
