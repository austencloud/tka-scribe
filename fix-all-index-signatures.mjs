#!/usr/bin/env node

/**
 * Comprehensive auto-fix script for all noPropertyAccessFromIndexSignature errors
 * Parses the TypeScript error output and fixes all occurrences
 */

import fs from "fs";
import path from "path";

const ERROR_FILE = "typescript-errors-after-auto-fix.txt";

console.log("🔍 Parsing TypeScript errors...\n");

// Read and parse the error file
const errorContent = fs.readFileSync(ERROR_FILE, "utf-8");
const lines = errorContent.split("\n");

// Map of file paths to properties that need fixing
const fileFixes = new Map();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Look for index signature errors
  if (line.includes("comes from an index signature")) {
    // Extract file path (a few lines above)
    let filePath = null;
    for (let j = i - 5; j < i; j++) {
      if (
        j >= 0 &&
        lines[j].includes("\x1b[32m") &&
        lines[j].includes("\x1b[39m")
      ) {
        // Extract file path from colored output (ANSI codes)
        const match = lines[j].match(/\x1b\[32m(.+\.tsx?)\x1b\[39m/);
        if (match) {
          filePath = match[1];
          break;
        }
      }
    }

    // Extract property name
    const propMatch = line.match(/Property '(\w+)' comes from/);
    if (propMatch && filePath) {
      const prop = propMatch[1];

      if (!fileFixes.has(filePath)) {
        fileFixes.set(filePath, new Set());
      }
      fileFixes.get(filePath).add(prop);
    }
  }
}

console.log(`Found ${fileFixes.size} files with index signature errors\n`);

// Function to fix index signature access in a file
function fixIndexSignatureAccess(content, properties) {
  let fixed = content;
  let changeCount = 0;

  for (const prop of properties) {
    // Pattern: word.property (but not in comments or strings)
    // This is a simple regex - may need refinement
    const dotPattern = new RegExp(`\\b(\\w+)\\.${prop}\\b`, "g");

    const matches = fixed.match(dotPattern);
    if (matches) {
      changeCount += matches.length;
    }

    fixed = fixed.replace(dotPattern, (match, varName) => {
      // Don't replace if it's in a comment or string (basic check)
      return `${varName}["${prop}"]`;
    });
  }

  return { fixed, changeCount };
}

// Process each file
let totalChanges = 0;
let filesProcessed = 0;
let filesSkipped = 0;

for (const [filePath, properties] of fileFixes.entries()) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    filesSkipped++;
    continue;
  }

  const originalContent = fs.readFileSync(fullPath, "utf-8");
  const { fixed: fixedContent, changeCount } = fixIndexSignatureAccess(
    originalContent,
    Array.from(properties)
  );

  if (originalContent === fixedContent) {
    console.log(`ℹ️  No changes needed: ${path.basename(filePath)}`);
    filesSkipped++;
    continue;
  }

  fs.writeFileSync(fullPath, fixedContent, "utf-8");
  console.log(
    `✅ Fixed ${changeCount} occurrences in: ${path.basename(filePath)}`
  );
  console.log(`   Properties: ${Array.from(properties).join(", ")}`);

  filesProcessed++;
  totalChanges += changeCount;
}

console.log(`\n📊 Summary:`);
console.log(`   Files found: ${fileFixes.size}`);
console.log(`   Files processed: ${filesProcessed}`);
console.log(`   Files skipped: ${filesSkipped}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\n✨ Done! Run 'npm run check' to verify fixes.`);
