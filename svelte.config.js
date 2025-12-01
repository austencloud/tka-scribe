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

      // Shared resources (cross-domain access)
      $shared: "./src/lib/shared",
      "$shared/*": "./src/lib/shared/*",

      // Feature aliases (for cross-domain barrel imports)
      $create: "./src/lib/features/create",
      "$create/*": "./src/lib/features/create/*",

      $learn: "./src/lib/features/learn",
      "$learn/*": "./src/lib/features/learn/*",

      $discover: "./src/lib/features/discover",
      "$discover/*": "./src/lib/features/discover/*",

      $animate: "./src/lib/features/animate",
      "$animate/*": "./src/lib/features/animate/*",

      $wordcard: "./src/lib/features/word-card",
      "$wordcard/*": "./src/lib/features/word-card/*",

      $collect: "./src/lib/features/collect",
      "$collect/*": "./src/lib/features/collect/*",

      $write: "./src/lib/features/write",
      "$write/*": "./src/lib/features/write/*",

      $render: "./src/lib/shared/render",
      "$render/*": "./src/lib/shared/render/*",
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
  },
};

export default config;
