/**
 * Strip fallbacks from color tokens
 *
 * Converts: var(--theme-accent, #6366f1)
 * To:       var(--theme-accent)
 *
 * Converts: var(--theme-stroke, rgba(255, 255, 255, 0.1))
 * To:       var(--theme-stroke)
 *
 * This makes missing tokens fail visibly instead of silently falling back.
 */

const fs = require("fs");
const path = require("path");

// Patterns to strip fallbacks from
const FALLBACK_PATTERNS = [
  // Hex color fallbacks: var(--token-name, #xxxxxx)
  {
    pattern: /var\((--(?:theme|semantic|prop)-[a-z-]+),\s*#[0-9a-fA-F]{3,6}\)/g,
    replace: (match, tokenName) => `var(${tokenName})`,
  },
  // RGBA fallbacks: var(--token-name, rgba(...))
  {
    pattern: /var\((--(?:theme|semantic|prop)-[a-z-]+),\s*rgba\([^)]+\)\)/g,
    replace: (match, tokenName) => `var(${tokenName})`,
  },
  // RGB fallbacks: var(--token-name, rgb(...))
  {
    pattern: /var\((--(?:theme|semantic|prop)-[a-z-]+),\s*rgb\([^)]+\)\)/g,
    replace: (match, tokenName) => `var(${tokenName})`,
  },
];

function getAllSvelteAndCssFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules"
      ) {
        walk(fullPath);
      } else if (
        entry.isFile() &&
        (entry.name.endsWith(".svelte") || entry.name.endsWith(".css"))
      ) {
        // Skip app.css - that's where tokens are defined
        if (entry.name !== "app.css") {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let totalChanges = 0;

  for (const { pattern, replace } of FALLBACK_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    const matches = content.match(regex);
    if (matches) {
      totalChanges += matches.length;
      content = content.replace(regex, replace);
    }
  }

  if (totalChanges > 0) {
    fs.writeFileSync(filePath, content, "utf8");
    return { filePath, totalChanges };
  }

  return null;
}

function main() {
  const srcDir = path.join(__dirname, "..", "src");

  console.log("🔧 Stripping color token fallbacks...\n");

  const files = getAllSvelteAndCssFiles(srcDir);
  const results = [];
  let grandTotal = 0;

  for (const file of files) {
    const result = processFile(file);
    if (result) {
      results.push(result);
      grandTotal += result.totalChanges;
    }
  }

  console.log("📝 Files modified:\n");

  results.sort((a, b) => b.totalChanges - a.totalChanges);

  for (const { filePath, totalChanges } of results.slice(0, 30)) {
    const relativePath = path.relative(path.join(__dirname, ".."), filePath);
    console.log(
      `  ${totalChanges.toString().padStart(3)} stripped: ${relativePath}`
    );
  }

  if (results.length > 30) {
    console.log(`  ... and ${results.length - 30} more files`);
  }

  console.log(
    `\n✅ Removed ${grandTotal} fallbacks across ${results.length} files`
  );
  console.log(
    "\n⚠️  Run the app now - if anything looks broken, a token is missing"
  );
}

main();
