/**
 * Navigation Utils - Public API
 *
 * Centralized exports for navigation utilities including:
 * - Sheet routing
 * - Deep linking
 * - URL encoding/decoding
 */

// Sheet router exports
export {
  closeSheet,
  getCurrentSheet,
  onRouteChange,
  openAnimationPanel,
  openSheet,
  openSpotlight,
} from "./sheet-router";

// Deep link exports
export { initializeDeepLinks } from "./deep-link-init";
export { deepLinkStore } from "./deep-link-store.svelte";
export {
  clearSequenceFromURL,
  createDebouncedURLSync,
  hasSequenceInURL,
  syncURLWithSequence,
} from "./live-url-sync";
export {
  decodeSequence,
  decodeSequenceWithCompression,
  encodeSequence,
  encodeSequenceWithCompression,
  estimateURLLength,
  generateShareURL,
  parseDeepLink,
} from "./sequence-url-encoder";

// Sequence restoration testing (dev/testing)
export {
  formatMultipleTestResults,
  formatTestResult,
  testMultipleSequences,
  testSequenceRestoration,
  testURLRestoration,
} from "./sequence-restoration-test";
export { sequenceRestorationTester } from "./test-sequence-restoration.svelte";

// Types
export type { DeepLinkResult } from "./deep-link-handler";
