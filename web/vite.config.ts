import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

const isDev = process.env.NODE_ENV !== "production";

export default defineConfig({
  plugins: [sveltekit()],

  resolve: {
    alias: {
      // Main project aliases are handled by SvelteKit
    },
  },

  build: {
    sourcemap: true,
    minify: !isDev,
  },

  ssr: {
    noExternal: ['svelte'],
  },

  esbuild: isDev
    ? {
        sourcemap: "inline",
        keepNames: true,
      }
    : {
        sourcemap: true,
      },

  css: {
    devSourcemap: isDev,
  },

  optimizeDeps: {
    include: ["@sveltejs/kit"],
  },

  server: {
    host: "0.0.0.0",
    open: false,
    fs: {
      allow: [".", "../animator"],
    },
  },

  define: {
    __VITE_IS_MODERN__: true,
  },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{js,ts}"],
    exclude: ["tests/**/*.{integration,e2e}.{js,ts}"],
    typecheck: {
      checker: "tsc",
      include: ["tests/**/*.{test,spec}.{js,ts}"],
    },
  },
});
