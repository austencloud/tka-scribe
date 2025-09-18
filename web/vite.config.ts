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
    sourcemap: isDev, // Only enable source maps in development
    minify: !isDev,
    rollupOptions: {
      output: {
        // Prevent circular dependency issues
        manualChunks: undefined,
      },
    },
  },

  ssr: {
    noExternal: ['svelte'],
    external: ['pdfjs-dist', 'page-flip'],
  },

  esbuild: isDev
    ? {
        sourcemap: "inline",
        keepNames: true,
      }
    : {
        sourcemap: false, // Disable source maps in production
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
});
