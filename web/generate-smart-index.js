/**
 * Generate a real sequence index from the actual dictionary folders
 * OPTIMIZED VERSION: Only regenerates when dictionary actually changes
 *
 * Features:
 * - Scans real dictionary folders
 * - Generates proper metadata from actual files
 * - Smart timestamp checking to avoid unnecessary regeneration
 * - Can run in watch mode for automatic updates
 * - Integrates with build process
 */

import chokidar from "chokidar";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dictionaryPath = path.join(__dirname, "static", "dictionary");
const outputPath = path.join(__dirname, "static", "sequence-index.json");

// Check if running in watch mode or force mode
const watchMode = process.argv.includes("--watch");
const forceMode = process.argv.includes("--force");
const skipCheck = process.argv.includes("--skip-check");

function getDictionaryLastModified() {
  let latestModified = 0;

  try {
    const entries = fs.readdirSync(dictionaryPath);

    for (const entry of entries) {
      const entryPath = path.join(dictionaryPath, entry);
      const stat = fs.statSync(entryPath);

      if (
        stat.isDirectory() &&
        !entry.startsWith(".") &&
        entry !== "__pycache__"
      ) {
        // Check directory modification time
        latestModified = Math.max(latestModified, stat.mtimeMs);

        // Check all PNG files in the directory
        try {
          const folderContents = fs.readdirSync(entryPath);
          for (const file of folderContents) {
            if (file.endsWith(".png")) {
              const filePath = path.join(entryPath, file);
              const fileStat = fs.statSync(filePath);
              latestModified = Math.max(latestModified, fileStat.mtimeMs);
            }
          }
        } catch (err) {
          // Skip if can't read folder
        }
      }
    }
  } catch (err) {
    console.warn("⚠️  Could not read dictionary directory for timestamp check");
    return Date.now(); // Force regeneration if we can't check
  }

  return latestModified;
}

function getIndexLastModified() {
  try {
    const stat = fs.statSync(outputPath);
    return stat.mtimeMs;
  } catch (err) {
    return 0; // File doesn't exist, needs to be generated
  }
}

function isIndexUpToDate() {
  if (forceMode) {
    console.log("🔄 Force mode enabled - regenerating index");
    return false;
  }

  if (skipCheck) {
    console.log("⚡ Skip mode enabled - using existing index");
    return true;
  }

  const dictionaryModified = getDictionaryLastModified();
  const indexModified = getIndexLastModified();

  if (indexModified === 0) {
    console.log("📝 No existing index found - generating new one");
    return false;
  }

  if (dictionaryModified > indexModified) {
    console.log("🔄 Dictionary newer than index - regenerating");
    return false;
  }

  console.log("✅ Index is up to date - skipping generation");
  return true;
}

function scanDictionary() {
  console.log("🔍 Scanning real dictionary at:", dictionaryPath);

  const sequences = [];
  const entries = fs.readdirSync(dictionaryPath);

  for (const entry of entries) {
    const entryPath = path.join(dictionaryPath, entry);
    const stat = fs.statSync(entryPath);

    // Skip files, only process directories
    if (!stat.isDirectory()) {
      continue;
    }

    // Skip special directories
    if (entry.startsWith(".") || entry === "__pycache__") {
      continue;
    }

    console.log(`📁 Processing sequence folder: ${entry}`);

    // Check if folder contains PNG files
    const folderContents = fs.readdirSync(entryPath);
    const pngFiles = folderContents.filter((file) => file.endsWith(".png"));

    if (pngFiles.length === 0) {
      console.warn(`⚠️  No PNG files found in ${entry}, skipping`);
      continue;
    }

    // Create sequence entry
    const sequence = {
      id: entry.toLowerCase(),
      word: entry,
      title: `Sequence ${entry}`,
      description: `TKA sequence for ${entry}`,
      imagePreview: `dictionary/${entry}/${pngFiles[0]}`,
      imageThumbnail: `dictionary/${entry}/${pngFiles[0]}`,
      videoPath: null,
      audioPath: null,
      estimatedDuration: pngFiles.length * 0.5,
      beatCount: pngFiles.length,
      author: "TKA Dictionary",
      difficultyLevel: estimateDifficulty(entry),
      level: Math.min(Math.floor(entry.length / 2) + 1, 5),
      dateAdded: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      isFavorite: false,
      isCircular: false,
      tags: ["flow", "practice"],
      propType: "fans",
      startingPosition: "center",
      gridMode: Math.random() > 0.5 ? "diamond" : "box",
      metadata: {
        source: "tka_dictionary",
        realSequence: true,
        originalPath: `dictionary/${entry}`,
        pngCount: pngFiles.length,
      },
    };

    sequences.push(sequence);
  }

  return sequences;
}

function estimateDifficulty(word) {
  if (word.length <= 2) return "beginner";
  if (word.length <= 6) return "intermediate";
  return "advanced";
}

function generateIndex() {
  const sequences = scanDictionary();

  const index = {
    version: "4.0.0",
    generatedAt: new Date().toISOString(),
    totalSequences: sequences.length,
    source: "real_dictionary_scan",
    description: "Generated from actual TKA dictionary folders",
    sequences: sequences.sort((a, b) => a.word.localeCompare(b.word)),
  };

  fs.writeFileSync(outputPath, JSON.stringify(index, null, 2));

  console.log(
    `✅ Generated real sequence index with ${sequences.length} sequences`
  );
  console.log(`📄 Written to: ${outputPath}`);
  console.log(
    `📋 Sample sequences:`,
    sequences
      .slice(0, 10)
      .map((s) => s.word)
      .join(", ")
  );

  return sequences;
}

// Main execution logic
if (watchMode) {
  console.log("🔄 Starting file watcher for automatic index updates...");

  // Initial generation with smart checking
  if (!isIndexUpToDate()) {
    generateIndex();
  }

  // Watch for changes
  const watcher = chokidar.watch(
    [
      path.join(dictionaryPath, "**/*.png"),
      path.join(dictionaryPath, "**/"), // Watch for new folders
    ],
    {
      ignored: /(^|[/\\])\../, // Ignore dotfiles
      persistent: true,
      ignoreInitial: true,
    }
  );

  let timeout;
  const debounceTime = 2000; // Wait 2 seconds after last change

  watcher.on("all", (event, path) => {
    console.log(`📁 Dictionary change detected: ${event} ${path}`);

    // Debounce: wait for multiple changes to settle
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      console.log("🔄 Regenerating sequence index...");
      generateIndex();
    }, debounceTime);
  });

  console.log("👀 Watching dictionary for changes... Press Ctrl+C to stop");
} else {
  // Single run with smart checking
  if (!isIndexUpToDate()) {
    generateIndex();
  }
}
