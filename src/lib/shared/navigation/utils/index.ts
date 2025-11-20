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
  openSheet,
  closeSheet,
  getCurrentSheet,
  openSpotlight,
  openAnimationPanel,
  onRouteChange,
} from "./sheet-router";

// Deep link exports
export {
  generateShareURL,
  parseDeepLink,
  encodeSequence,
  decodeSequence,
  estimateURLLength,
  encodeSequenceWithCompression,
  decodeSequenceWithCompression,
} from "./sequence-url-encoder";
export { initializeDeepLinks } from "./deep-link-init";
export { deepLinkStore } from "./deep-link-store.svelte";
export {
  syncURLWithSequence,
  clearSequenceFromURL,
  hasSequenceInURL,
  createDebouncedURLSync,
} from "./live-url-sync";

// Sequence restoration testing (dev/testing)
export {
  testSequenceRestoration,
  testURLRestoration,
  formatTestResult,
  testMultipleSequences,
  formatMultipleTestResults,
} from "./sequence-restoration-test";
export { sequenceRestorationTester } from "./test-sequence-restoration.svelte";

// Types
export type { DeepLinkResult } from "./deep-link-handler";
