import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup/vitest-setup.ts"],
    include: [
      "tests/unit/**/*.{test,spec}.{js,ts}",
      "tests/integration/**/*.{test,spec}.{js,ts}",
      "tests/debug/**/*.{test,spec}.{js,ts}",
    ],
    exclude: [
      "legacy_app/**/*",
      "node_modules/**/*",
      "tests/e2e/**/*", // E2E tests run with Playwright
    ],
    alias: {
      $lib: new URL("./src/lib", import.meta.url).pathname,
      $app: new URL("./src/app", import.meta.url).pathname,
      $shared: new URL("./src/lib/shared", import.meta.url).pathname,
    },
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    conditions: ["browser"],
  },
});
