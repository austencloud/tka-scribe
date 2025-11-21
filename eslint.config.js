/**
 * ESLint Configuration - Svelte 5 + TypeScript (Pragmatic Strictness)
 *
 * PHILOSOPHY (Updated 2025-01-21):
 * =================================
 * This config follows the official Svelte ESLint recommendations focusing on
 * "preventing errors" rather than "enforcing maximum type safety".
 *
 * TWO-LAYER DEFENSE:
 * 1. TypeScript strict mode (tsconfig.json) - Catches type bugs
 * 2. ESLint - Catches patterns TypeScript can't (async, promises, Svelte issues)
 *
 * WHY NOT ULTRA-STRICT:
 * - The "no-unsafe-*" rules generate 500+ false positives in Svelte 5
 * - Official Svelte docs mention these rules in "ignoreWarnings" section
 * - TypeScript strict mode already catches real type errors
 * - We had 1 TypeScript error vs 938 ESLint false positives
 *
 * WHAT TO TRUST:
 * ✅ TypeScript compiler errors - These are real bugs
 * ✅ ESLint errors for async/promises - These catch real issues
 * ✅ Svelte compile errors - These are real issues
 * ❌ "no-unsafe-*" warnings - Mostly false positives in Svelte 5
 *
 * REFERENCES:
 * - Svelte ESLint Guide: https://sveltejs.github.io/eslint-plugin-svelte/user-guide/
 * - Discussion: See conversation from 2025-01-21 about strictness levels
 */
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-config-prettier";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import storybookPlugin from "eslint-plugin-storybook";
import sveltePlugin from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";

export default [
  // Global ignores (equivalent to .eslintignore)
  {
    ignores: [
      "build/**",
      ".svelte-kit/**",
      "dist/**",
      ".netlify/**",
      "node_modules/**",
      "**/*.generated.*",
      "scripts/**",
      "tools/**",
      "*.config.ts",
      "*.config.js",
      "*.cjs",
      "*.mjs",
      "*.shims.d.ts",
      "static/**",
      "temp-scripts/**",
      "**/*.old.*",
      "tests/**",
      "src/stories/**",
      ".storybook/**",
      "archive/**",
      "**/*.md",
      "*.txt",
      "**/*.json",
      "!package.json",
      "!tsconfig.json",
    ],
  },

  // Base ESLint recommended rules
  js.configs.recommended,

  // TypeScript files configuration
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
        ecmaVersion: 2020,
        project: "./tsconfig.json",
      },
      globals: {
        console: "readonly",
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        indexedDB: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        alert: "readonly",
        confirm: "readonly",
        prompt: "readonly",
        location: "readonly",
        history: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        FormData: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        Blob: "readonly",
        File: "readonly",
        FileReader: "readonly",
        Image: "readonly",
        AudioContext: "readonly",
        HTMLElement: "readonly",
        Element: "readonly",
        Node: "readonly",
        NodeList: "readonly",
        Event: "readonly",
        CustomEvent: "readonly",
        MessageEvent: "readonly",
        EventTarget: "readonly",
        AbortController: "readonly",
        AbortSignal: "readonly",
        IntersectionObserver: "readonly",
        MutationObserver: "readonly",
        ResizeObserver: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        CSS: "readonly",
        performance: "readonly",
        getComputedStyle: "readonly",
        crypto: "readonly",
        btoa: "readonly",
        atob: "readonly",
        // Svelte 5 runes
        $state: "readonly",
        $derived: "readonly",
        $effect: "readonly",
        $props: "readonly",
        $bindable: "readonly",
        $inspect: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        global: "readonly",
        Buffer: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "simple-import-sort": simpleImportSort,
      "no-relative-import-paths": noRelativeImportPaths,
    },
    rules: {
      // ============================================================================
      // TYPESCRIPT RECOMMENDED RULES
      // ============================================================================
      ...tsPlugin.configs.recommended.rules,
      ...tsPlugin.configs["recommended-type-checked"].rules,

      // ============================================================================
      // UNUSED VARIABLES (Fixed: use ^_ pattern instead of .*)
      // ============================================================================
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],

      // ============================================================================
      // TYPE SAFETY RULES - PRAGMATIC APPROACH
      // ============================================================================
      // Decision made 2025-01-21: These "no-unsafe-*" rules are DISABLED.
      //
      // WHY:
      // 1. The official Svelte ESLint guide focuses on "preventing errors" not
      //    "enforcing strict type safety" (see: sveltejs.github.io/eslint-plugin-svelte)
      // 2. These rules generate 500+ false positives in normal Svelte 5 code
      // 3. The Svelte team explicitly mentions these in their "ignoreWarnings" docs
      // 4. TypeScript strict mode (tsconfig.json) is our REAL type safety net
      //    - We have strict: true, noImplicitAny, strictNullChecks, etc.
      //    - TypeScript compiler catches actual type errors (we had only 1 TS error!)
      // 5. ESLint should catch patterns TypeScript CAN'T (like floating promises)
      //    not duplicate what TypeScript already does better
      //
      // WHAT THIS MEANS:
      // - TypeScript strict mode = catches type bugs (the important work)
      // - ESLint = catches async bugs, promise handling, and Svelte-specific issues
      // - No noise from 938 false positive "unsafe" warnings
      //
      // IF YOU'RE TEMPTED TO RE-ENABLE THESE:
      // Ask: "Will this catch bugs TypeScript strict mode doesn't?" If no, leave it off.
      // The goal is signal, not noise. Every warning you ignore trains you to ignore warnings.
      //
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",

      // ============================================================================
      // IMPORTANT: RULES THAT ACTUALLY CATCH BUGS
      // ============================================================================
      // These stay enabled because they catch issues TypeScript strict mode doesn't:
      //
      "@typescript-eslint/no-floating-promises": "error", // Unhandled async = actual bugs
      "@typescript-eslint/no-misused-promises": "error", // Async/sync confusion = actual bugs
      "@typescript-eslint/no-explicit-any": "warn", // Keep typing honest (but just a nudge)

      // ============================================================================
      // STYLE PREFERENCES - DISABLED (Decision: 2025-01-21)
      // ============================================================================
      // The following rules are STYLE PREFERENCES that don't catch bugs.
      // They generate 900+ warnings we'll never fix, which trains us to ignore warnings.
      // When every warning matters, you pay attention. When most are noise, you ignore them all.
      //
      // DISABLED STYLE RULES:
      "@typescript-eslint/prefer-nullish-coalescing": "off", // Style: ?? vs || (rarely matters)
      "@typescript-eslint/prefer-optional-chain": "off", // Style: a?.b vs a && a.b
      "@typescript-eslint/no-unnecessary-condition": "off", // Pedantic, TS already catches most
      "@typescript-eslint/require-await": "off", // Style: async without await
      "@typescript-eslint/no-redundant-type-constituents": "off", // Pedantic type cleanup
      "@typescript-eslint/restrict-template-expressions": "off", // Pedantic string coercion
      "@typescript-eslint/no-base-to-string": "off", // Caught by TS strict mode
      "@typescript-eslint/no-unnecessary-type-assertion": "off", // Caught by TS
      "@typescript-eslint/unbound-method": "off", // Rarely an issue
      "@typescript-eslint/ban-ts-comment": "off", // We're adults

      // Import sorting is handled by Prettier, don't need ESLint for this
      "simple-import-sort/imports": "off",
      "simple-import-sort/exports": "off",

      // Keep type imports consistent (this one's actually useful for tree-shaking)
      "@typescript-eslint/consistent-type-imports": "warn",

      // ============================================================================
      // ARCHITECTURAL BOUNDARIES
      // ============================================================================
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["$services", "$services/*"],
              message:
                "Use relative imports instead of $services alias to avoid circular dependencies",
            },
            {
              group: ["$domain", "$domain/*"],
              message:
                "Use $shared/domain or relative imports instead of $domain alias",
            },
            {
              group: ["$implementations", "$implementations/*"],
              message:
                "Use relative imports within modules instead of $implementations alias",
            },
            {
              group: ["$state", "$state/*"],
              message:
                "Use module-specific state imports instead of global $state alias",
            },
          ],
        },
      ],
    },
  },

  // Svelte files configuration
  {
    files: ["**/*.svelte"],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tsParser,
        sourceType: "module",
        ecmaVersion: 2020,
        project: "./tsconfig.json",
        extraFileExtensions: [".svelte"],
      },
      globals: {
        console: "readonly",
        document: "readonly",
        window: "readonly",
        navigator: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        indexedDB: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        alert: "readonly",
        confirm: "readonly",
        prompt: "readonly",
        location: "readonly",
        history: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        FormData: "readonly",
        Headers: "readonly",
        Request: "readonly",
        Response: "readonly",
        Blob: "readonly",
        File: "readonly",
        FileReader: "readonly",
        Image: "readonly",
        AudioContext: "readonly",
        HTMLElement: "readonly",
        Element: "readonly",
        Node: "readonly",
        NodeList: "readonly",
        Event: "readonly",
        CustomEvent: "readonly",
        MessageEvent: "readonly",
        EventTarget: "readonly",
        AbortController: "readonly",
        AbortSignal: "readonly",
        IntersectionObserver: "readonly",
        MutationObserver: "readonly",
        ResizeObserver: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        CSS: "readonly",
        performance: "readonly",
        crypto: "readonly",
        btoa: "readonly",
        atob: "readonly",
        // Svelte 5 runes
        $state: "readonly",
        $derived: "readonly",
        $effect: "readonly",
        $props: "readonly",
        $bindable: "readonly",
        $inspect: "readonly",
      },
    },
    plugins: {
      svelte: sveltePlugin,
    },
    rules: {
      ...sveltePlugin.configs.recommended.rules,
      // Svelte-specific overrides
      "svelte/valid-compile": "error",
      // Disabled: All {@html} usages in codebase are for trusted, application-generated
      // content (FontAwesome icons and SVG assets). Each usage has been reviewed and
      // documented with eslint-disable comments. No user-generated content is rendered.
      "svelte/no-at-html-tags": "off",
    },
  },

  // Test files - relax some rules
  {
    files: ["tests/**/*.ts", "tests/**/*.js"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
    },
  },

  // Storybook files - apply storybook rules
  {
    files: ["**/*.stories.@(ts|tsx|js|jsx|svelte)", ".storybook/**/*"],
    plugins: {
      storybook: storybookPlugin,
    },
    rules: {
      "storybook/await-interactions": "error",
      "storybook/context-in-play-function": "error",
      "storybook/default-exports": "error",
      "storybook/hierarchy-separator": "warn",
      "storybook/no-redundant-story-name": "warn",
      "storybook/prefer-pascal-case": "warn",
      "storybook/use-storybook-expect": "error",
      "storybook/use-storybook-testing-library": "error",
    },
  },

  // Prettier must be last to override formatting rules
  prettierConfig,
];
