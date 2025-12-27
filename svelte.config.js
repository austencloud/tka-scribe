import adapter from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // ============================================================================
  // PREPROCESSING (Vite handles TypeScript, styles, etc.)
  // ============================================================================
  // 2025: Enable script preprocessing for TypeScript features that emit code
  // (enums, decorators, class visibility modifiers, etc.)
  preprocess: vitePreprocess({ script: true }),

  kit: {
    // ============================================================================
    // ADAPTER (Netlify deployment - 2025 best practice: explicit adapter)
    // ============================================================================
    adapter: adapter({
      // 2025: Use Node-based functions (edge: false is default, more compatible)
      edge: false,
      // 2025: Single function bundle is simpler and often faster for cold starts
      split: false,
    }),

    // ============================================================================
    // PATH ALIASES (Clean domain-bounded architecture)
    // ============================================================================
    alias: {
      // Core aliases
      $lib: "./src/lib",
      "$lib/*": "./src/lib/*",
    },

    // ============================================================================
    // 2025: SECURITY & PERFORMANCE
    // ============================================================================
    // CSRF protection with origin checking is enabled by default
    // Use csrf.trustedOrigins to whitelist additional origins if needed

    // 2025: Preload critical modules for better performance
    prerender: {
      // Configure if you want static prerendering
      crawl: true,
    },
  },

  // ============================================================================
  // SVELTE 5 COMPILER OPTIONS
  // ============================================================================
  compilerOptions: {
    // Svelte 5 runes mode is enabled by default
    // 2025: Runes provide better reactivity and performance
    warningFilter: (warning) => {
      // Suppress state_referenced_locally warnings - these are intentional patterns
      // in this codebase where:
      // - $effect() handles prop sync
      // - Component is keyed/recreated when prop changes
      // - Initial value capture is deliberate
      if (warning.code === "state_referenced_locally") {
        return false;
      }
      return true;
    },
  },
};

export default config;
