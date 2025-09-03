import adapter from "@sveltejs/adapter-netlify";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess({
    script: true,
    style: true,
    sourceMap: true, // Enable source maps for Svelte files
    typescript: {
      tsconfigFile: "./tsconfig.json",
      compilerOptions: {
        module: "esnext",
        sourceMap: true, // Enable TypeScript source maps
        inlineSourceMap: false,
        inlineSources: false,
      },
    },
  }),

  kit: {
    // adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
    // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
    // See https://svelte.dev/docs/kit/adapters for more information about adapters.
    adapter: adapter(),

    // Prerender SEO pages for better search engine crawling
    prerender: {
      entries: ["*", "/about", "/features", "/getting-started", "/browse"],
    },

    // Move the path aliases from tsconfig.json to here
    alias: {
      $lib: "./src/lib",
      "$lib/*": "./src/lib/*",
      $components: "./src/lib/components",
      "$components/*": "./src/lib/components/*",
      $domain: "./src/lib/domain",
      "$domain/*": "./src/lib/domain/*",
      $services: "./src/lib/services",
      "$services/*": "./src/lib/services/*",
      // Tab-first service aliases
      "$services/animator": "./src/lib/services/animator",
      "$services/browse": "./src/lib/services/browse",
      "$services/build": "./src/lib/services/build",
      "$services/learn": "./src/lib/services/learn",
      "$services/word-card": "./src/lib/services/word-card",
      "$services/core": "./src/lib/services/core",
      // Tab-specific contract aliases
      "$contracts/animator": "./src/lib/services/animator/contracts",
      "$contracts/browse": "./src/lib/services/browse/contracts",
      "$contracts/build": "./src/lib/services/build/contracts",
      "$contracts/learn": "./src/lib/services/learn/contracts",
      "$contracts/word-card": "./src/lib/services/word-card/contracts",
      "$contracts/core": "./src/lib/services/core/contracts",
      // Legacy aliases for backward compatibility (will be removed)
      $contracts: "./src/lib/services",
      "$contracts/*": "./src/lib/services/*",
      $implementations: "./src/lib/services",
      "$implementations/*": "./src/lib/services/*",
      $inversify: "./src/lib/services/inversify",
      "$inversify/*": "./src/lib/services/inversify/*",
      $utils: "./src/lib/utils",
      "$utils/*": "./src/lib/utils/*",
      $state: "./src/lib/state",
      "$state/*": "./src/lib/state/*",
      $styles: "./src/styles",
      "$styles/*": "./src/styles/*",
      $config: "./src/config",
      "$config/*": "./src/config/*",
    },
  },
};

export default config;
