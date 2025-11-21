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
      // TYPE SAFETY - AGGRESSIVE (Promoted to errors)
      // ============================================================================
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "@typescript-eslint/no-unsafe-argument": "error",

      // Keep these as warnings (less critical)
      "@typescript-eslint/no-unsafe-enum-comparison": "warn",
      "@typescript-eslint/unbound-method": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/require-await": "warn",
      "@typescript-eslint/no-redundant-type-constituents": "warn",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/restrict-template-expressions": "warn",
      "@typescript-eslint/no-base-to-string": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",

      // ============================================================================
      // MODERN TYPESCRIPT BEST PRACTICES
      // ============================================================================
      "@typescript-eslint/consistent-type-imports": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/no-unnecessary-condition": "warn",

      // ============================================================================
      // IMPORT SORTING
      // ============================================================================
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",

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
