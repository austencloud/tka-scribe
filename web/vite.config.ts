import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    sourcemap: true,
  },
  esbuild: {
    sourcemap: true,
  },
  css: {
    devSourcemap: true,
  },
  optimizeDeps: {
    include: ["@sveltejs/kit"],
  },
  server: {
    port: 5173,
    host: "0.0.0.0", // Bind to all interfaces (IPv4 and IPv6)
    open: false, // Don't auto-open so debugger can control it
    fs: {
      allow: [".", "../animator"],
    },
  },
  // Enhance source maps for better debugging
  define: {
    __VITE_IS_MODERN__: true,
  },
  // Add development-specific source map configuration
  ...(process.env.NODE_ENV !== "production" && {
    build: {
      sourcemap: "inline",
      minify: false,
    },
  }),
});
