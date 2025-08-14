import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 5173,
    host: "0.0.0.0", // Bind to all interfaces (IPv4 and IPv6)
    open: true,
    fs: {
      allow: [".", "../animator"],
    },
  },
});
