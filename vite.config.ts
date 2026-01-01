/// <reference types="vitest/config" />
import { sveltekit } from "@sveltejs/kit/vite";
import fs from "fs";
import type { IncomingMessage, ServerResponse } from "http";
import path from "path";
import type { ViteDevServer } from "vite";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { visualizer } from "rollup-plugin-visualizer";

// ============================================================================
// CUSTOM PLUGINS
// ============================================================================

/**
 * Serves PNG files from desktop directory
 * 2025: Added error handling and proper caching
 */
import { fileURLToPath } from "node:url";
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

const dictionaryPlugin = () => ({
  name: "dictionary-files",
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      "/dictionary",
      (
        req: IncomingMessage,
        res: ServerResponse,
        next: (err?: unknown) => void
      ) => {
        if (req.url && req.url.endsWith(".png")) {
          try {
            const decodedUrl = decodeURIComponent(req.url);
            const relativePath = decodedUrl.substring(1);
            const filePath = path.resolve(
              "../desktop/data/dictionary",
              relativePath
            );
            if (fs.existsSync(filePath)) {
              res.setHeader("Content-Type", "image/png");
              res.setHeader("Cache-Control", "public, max-age=31536000"); // 2025: Better caching
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch (error) {
            console.error("Dictionary file error:", error);
          }
        }
        next();
      }
    );
  },
});

/**
 * 📱 MOBILE DEBUGGING: CORS headers for font files
 * - Fonts require CORS headers when accessed from different origins
 * - Mobile devices connect via IP address, which browsers treat as cross-origin
 * - Without this, Font Awesome icons won't load on mobile dev
 */
const fontCorsPlugin = () => ({
  name: "font-cors-headers",
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      (
        req: IncomingMessage,
        res: ServerResponse,
        next: (err?: unknown) => void
      ) => {
        const url = req.url || "";

        // Add CORS headers for font files
        if (
          url.includes(".woff2") ||
          url.includes(".woff") ||
          url.includes(".ttf") ||
          url.includes(".otf") ||
          url.includes(".eot")
        ) {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        }

        next();
      }
    );
  },
});

/**
 * 🚀 2025 OPTIMIZATION: Aggressive no-cache during development
 * - Disables ALL caching for development files
 * - Works with browser cache and service workers
 * - Ensures every change is immediately visible
 */
const devCachePlugin = () => ({
  name: "dev-cache-headers",
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      (
        req: IncomingMessage,
        res: ServerResponse,
        next: (err?: unknown) => void
      ) => {
        const url = req.url || "";

        // Skip WebSocket upgrade requests - critical for HMR
        if (req.headers.upgrade === "websocket") {
          next();
          return;
        }

        // Disable caching for ALL HTML, CSS, JS files during dev (aggressive approach)
        if (
          url.includes(".css") ||
          url.includes(".js") ||
          url.includes(".svelte") ||
          url.includes(".html") ||
          url.includes("@vite") ||
          url.includes("@fs") ||
          url.includes("/")
        ) {
          const originalWriteHead = res.writeHead;
          res.writeHead = function (...args: any[]) {
            res.setHeader(
              "Cache-Control",
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
            );
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            res.setHeader("Surrogate-Control", "no-store");
            res.setHeader("ETag", `"${Date.now()}"`); // Force cache miss
            return originalWriteHead.apply(res, args);
          };
        }

        next();
      }
    );
  },
});

// Use relative path for vite-plugin-static-copy, absolute for dev server
const webpEncoderWasmRelative =
  "node_modules/webp-encoder/lib/assets/a.out.wasm";
const webpEncoderWasmAbsolute = path.resolve(dirname, webpEncoderWasmRelative);

const webpWasmDevPlugin = () => ({
  name: "webp-wasm-dev-server",
  configureServer(server: ViteDevServer) {
    server.middlewares.use(
      (
        req: IncomingMessage,
        res: ServerResponse,
        next: (err?: unknown) => void
      ) => {
        if (
          req.url &&
          req.url.endsWith("a.out.wasm") &&
          fs.existsSync(webpEncoderWasmAbsolute)
        ) {
          res.setHeader("Content-Type", "application/wasm");
          fs.createReadStream(webpEncoderWasmAbsolute).pipe(res);
          return;
        }
        next();
      }
    );
  },
});

const webpStaticCopyPlugin = () => {
  if (!fs.existsSync(webpEncoderWasmAbsolute)) {
    return null;
  }

  return viteStaticCopy({
    targets: [
      {
        src: webpEncoderWasmRelative,
        dest: ".", // Copy to root - webp-encoder expects /a.out.wasm
      },
    ],
  });
};

// Read package.json version at build time
const packageJson = JSON.parse(
  fs.readFileSync(path.resolve(dirname, "package.json"), "utf-8")
);

// ============================================================================
// VITE 6.0 CONFIGURATION (2025 - Optimized for SvelteKit 2)
// ============================================================================

export default defineConfig({
  // ============================================================================
  // ENVIRONMENT & DEFINES
  // ============================================================================
  define: {
    __DEFINES__: JSON.stringify({}),
    __APP_VERSION__: JSON.stringify(packageJson.version),
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(packageJson.version),
  },
  plugins: [
    sveltekit({
      // Explicitly enable HMR and hot module replacement
      hot: {
        preserveLocalState: true,
        injectCss: true,
      },
    }),
    dictionaryPlugin(),
    fontCorsPlugin(), // 📱 CORS headers for fonts (mobile debugging)
    devCachePlugin(), // 🚀 2025: Smart caching (no-cache for CSS/JS, cache for SVGs)
    webpWasmDevPlugin(),
    webpStaticCopyPlugin(),
    // 📊 Bundle analyzer - generates stats.html when ANALYZE=true
    process.env.ANALYZE === "true" &&
      visualizer({
        filename: "stats.html",
        open: true,
        gzipSize: true,
        brotliSize: true,
        template: "treemap", // or "sunburst", "network"
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      // Aliases handled by SvelteKit
    },
    // Force browser builds during SSR to avoid Node.js require() issues
    conditions: ["browser", "module", "import", "default"],
  },
  // ============================================================================
  // BUILD (Production optimization)
  // ============================================================================
  build: {
    // Source maps disabled in production for security (exposes original source)
    // Enable locally with: VITE_SOURCEMAP=true npm run build
    sourcemap: process.env.VITE_SOURCEMAP === "true",
    target: "esnext",
    minify: "esbuild",
    // 2025: Fast default minification
    cssMinify: "esbuild",
    // 2025: Works with Svelte 5

    rollupOptions: {
      output: {
        // Strategic chunking for your actual dependencies
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("fabric")) return "vendor-fabric";
            if (id.includes("pdfjs-dist")) return "vendor-pdf";
            if (id.includes("firebase")) return "vendor-firebase";
            if (id.includes("dexie")) return "vendor-dexie";
            // pixi.js is heavy (~500KB) - keep it in its own chunk
            if (id.includes("pixi.js") || id.includes("pixi"))
              return "vendor-pixi";
            return "vendor";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Warn for 1MB+ chunks
  },
  // ============================================================================
  // SSR
  // ============================================================================
  ssr: {
    noExternal: [
      "svelte",
      "inversify", // Force bundle to avoid CommonJS require()
      "reflect-metadata", // Required by inversify, often has CJS issues
      "gif.js", // May contain CJS code
      "file-saver", // Often has CJS exports
      "@tsparticles/basic",
      "@tsparticles/engine",
      "@tsparticles/preset-snow",
    ],
    external: ["pdfjs-dist", "page-flip"],
  },
  // ============================================================================
  // CSS
  // ============================================================================
  css: {
    devSourcemap: true,
  },
  // ============================================================================
  // DEPENDENCY PRE-BUNDLING (Vite 6.0)
  // ⚡ PERFORMANCE: Only pre-bundle lightweight essentials + dependencies that need ESM transformation
  // Heavy libraries (fabric, page-flip) are excluded and load on-demand when features are used
  // This reduces initial dev server load time from 30s+ to ~5-10s
  // ============================================================================
  optimizeDeps: {
    include: [
      // Core DI & validation (lightweight, needed immediately)
      "inversify",
      "reflect-metadata",
      "zod",

      // UI components (lightweight)
      "vaul-svelte",
      "bits-ui",
      "embla-carousel-svelte",

      // Small utilities
      "file-saver",

      // ⚡ PERFORMANCE FIX: Pre-bundle dexie for proper ESM handling
      // Needs Vite transformation despite being in dataModule (Tier 1)
      "dexie",
      // Threlte: avoid on-demand re-optimization (prevents stale dep 504s)
      "@threlte/core",
      "@threlte/extras",
    ],
    exclude: [
      "pdfjs-dist",
      // ⚡ Lazy-load these heavy libraries on-demand
      "fabric", // ~500KB canvas library (loads when user uses animator)
      "page-flip", // PDF flipbook (loads in learn module)
    ],
  },
  // ============================================================================
  // DEV SERVER (Vite 6.0 enhancements)
  // ============================================================================
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true, // 📱 Mobile debugging requires consistent port (ADB reverse tcp:5173)
    headers: {
      // Enable OAuth popups to communicate with parent window
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
    },
    fs: {
      allow: [".", "../animator", "../desktop"],
      strict: true, // 2025: Security best practice
    },
    hmr: {
      overlay: true,
      clientPort: 5173,
      // Explicit client port
      timeout: 30000, // 30s timeout instead of default 5s
    },
    watch: {
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        // 🚨 CRITICAL: Use ./build/** NOT **/build/**
        // The pattern **/build/** will match ANY directory named "build" at any depth.
        // This could cause HMR to ignore source code directories.
        // Only ignore the root-level build output directory.
        "./build/**",
        "**/.svelte-kit/**",
      ],
    },
    // 2025: Preload critical files on dev start
    warmup: {
      clientFiles: [
        "./src/lib/shared/**/*.ts",
        "./src/lib/modules/**/*.svelte",
      ],
    },
  },
  // ============================================================================
  // PREVIEW (Testing production builds)
  // ============================================================================
  preview: {
    port: 4173,
    strictPort: true,
    host: "0.0.0.0",
  },
});
