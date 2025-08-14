import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
    host: "localhost", // Revert to localhost for Firefox compatibility
    open: true,
    fs: {
      allow: [".", "../animator"],
    },
  },
});
