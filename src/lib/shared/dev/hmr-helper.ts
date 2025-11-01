/**
 * HMR Helper Utilities
 *
 * Provides runtime utilities for development to help with HMR edge cases.
 * Only included in development builds.
 */

/**
 * Force a full page reload - useful when HMR fails to update properly
 *
 * Usage in browser console:
 * ```js
 * window.__TKA_RELOAD()
 * ```
 *
 * Or add keyboard shortcut:
 * ```js
 * // Press Ctrl+Shift+R for hard reload
 * window.addEventListener('keydown', (e) => {
 *   if (e.ctrlKey && e.shiftKey && e.key === 'R') {
 *     window.__TKA_RELOAD();
 *   }
 * });
 * ```
 */
export function setupHMRHelpers() {
  if (import.meta.env.DEV) {
    // Make reload function globally available
    (window as any).__TKA_RELOAD = () => {
      console.log('[🔄 TKA] Forcing full reload...');
      window.location.reload();
    };

    // Add keyboard shortcut: Ctrl+Shift+R for hard reload
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        console.log('[🔄 TKA] Manual reload triggered (Ctrl+Shift+R)');
        (window as any).__TKA_RELOAD();
      }
    });

    console.log('[HMR Helper] Dev utilities loaded:');
    console.log('  - window.__TKA_RELOAD() - Force full reload');
    console.log('  - Ctrl+Shift+R - Hard reload shortcut');
  }
}

/**
 * Log HMR acceptance for a module
 * Useful for debugging HMR issues
 */
export function acceptHMR(moduleName: string) {
  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      console.log(`[⚡ HMR] ${moduleName} updated`);
    });
  }
}
