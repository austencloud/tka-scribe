#!/usr/bin/env node
/**
 * Development Helper Script
 *
 * This script runs the development server with automatic sequence index updates.
 * It watches for changes in the dictionary folder and regenerates the index automatically.
 */

import { spawn } from "child_process";
import chokidar from "chokidar";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let indexGenerationTimeout;
const DEBOUNCE_TIME = 2000; // 2 seconds

function generateIndex() {
  console.log("🔄 Regenerating sequence index...");

  const indexGenerator = spawn("node", ["generate-real-index.js"], {
    cwd: __dirname,
    stdio: "pipe",
  });

  indexGenerator.stdout.on("data", (data) => {
    process.stdout.write(data);
  });

  indexGenerator.stderr.on("data", (data) => {
    process.stderr.write(data);
  });

  indexGenerator.on("close", (code) => {
    if (code === 0) {
      console.log("✅ Sequence index updated successfully");
    } else {
      console.error(`❌ Index generation failed with code ${code}`);
    }
  });
}

function startFileWatcher() {
  console.log("👀 Starting file watcher for dictionary changes...");

  const watcher = chokidar.watch(
    [
      path.join(__dirname, "static/dictionary/**/*.png"),
      path.join(__dirname, "static/dictionary/**/"),
    ],
    {
      ignored: /(^|[/\\])\../, // Ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    }
  );

  watcher.on("all", (event, filePath) => {
    console.log(
      `📁 Dictionary change detected: ${event} ${path.relative(__dirname, filePath)}`
    );

    // Debounce: wait for multiple changes to settle
    clearTimeout(indexGenerationTimeout);
    indexGenerationTimeout = setTimeout(generateIndex, DEBOUNCE_TIME);
  });

  return watcher;
}

function startDevServer() {
  console.log("🚀 Starting development server...");

  const devServer = spawn("npm", ["run", "dev"], {
    cwd: __dirname,
    stdio: "inherit",
  });

  devServer.on("close", (code) => {
    console.log(`Dev server exited with code ${code}`);
    process.exit(code);
  });

  return devServer;
}

async function main() {
  console.log("🔧 TKA Development Helper");
  console.log("========================");

  // Generate initial index
  console.log("📋 Generating initial sequence index...");
  generateIndex();

  // Start file watcher
  const watcher = startFileWatcher();

  // Start dev server after a short delay to allow index generation
  setTimeout(() => {
    startDevServer();
  }, 3000);

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down...");
    watcher.close();
    process.exit(0);
  });
}

main().catch(console.error);
