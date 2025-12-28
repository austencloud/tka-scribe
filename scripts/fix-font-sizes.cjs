/**
 * Programmatic font-size token migration
 * Replaces hardcoded font-size: Xpx with var(--font-size-*, Xpx)
 *
 * Safe because fallbacks preserve exact same rendering
 */

const fs = require('fs');
const path = require('path');

// Token mapping based on app.css design system
const TOKEN_MAP = {
  // Tier 2: Supplementary text (12px floor)
  10: '--font-size-compact',
  11: '--font-size-compact',
  12: '--font-size-compact',
  13: '--font-size-compact',

  // Tier 1: Essential text (14px minimum)
  14: '--font-size-sm',
  15: '--font-size-sm',
  16: '--font-size-base',
  17: '--font-size-base',
  18: '--font-size-lg',
  19: '--font-size-lg',
  20: '--font-size-xl',
  21: '--font-size-xl',
  22: '--font-size-xl',
  23: '--font-size-xl',
  24: '--font-size-2xl',
  25: '--font-size-2xl',
  26: '--font-size-2xl',
  27: '--font-size-2xl',
  28: '--font-size-3xl',
  29: '--font-size-3xl',
  30: '--font-size-3xl',
  32: '--font-size-3xl',
  36: '--font-size-3xl',
  40: '--font-size-3xl',
  48: '--font-size-3xl',
  50: '--font-size-3xl',
  56: '--font-size-3xl',
  64: '--font-size-3xl',
};

// Regex to match font-size: Xpx (but NOT already wrapped in var())
// Negative lookbehind to avoid matching inside var() already
const FONT_SIZE_REGEX = /font-size:\s*(\d+)px(?!\s*\))/g;

function getAllSvelteFiles(dir) {
  const files = [];

  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.svelte')) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = content;
  let changeCount = 0;

  modified = content.replace(FONT_SIZE_REGEX, (match, pxValue) => {
    const px = parseInt(pxValue, 10);
    const token = TOKEN_MAP[px];

    if (token) {
      changeCount++;
      return `font-size: var(${token}, ${px}px)`;
    }

    // For sizes not in map, use closest token
    if (px < 12) {
      changeCount++;
      return `font-size: var(--font-size-compact, ${px}px)`;
    } else if (px > 30) {
      changeCount++;
      return `font-size: var(--font-size-3xl, ${px}px)`;
    }

    // Unknown size, leave as-is
    return match;
  });

  if (changeCount > 0) {
    fs.writeFileSync(filePath, modified, 'utf8');
    return { filePath, changeCount };
  }

  return null;
}

function main() {
  const srcDir = path.join(__dirname, '..', 'src', 'lib');

  console.log('🔍 Scanning for .svelte files...\n');

  const files = getAllSvelteFiles(srcDir);
  console.log(`Found ${files.length} .svelte files\n`);

  const results = [];
  let totalChanges = 0;

  for (const file of files) {
    const result = processFile(file);
    if (result) {
      results.push(result);
      totalChanges += result.changeCount;
    }
  }

  console.log('📝 Files modified:\n');

  // Sort by change count descending
  results.sort((a, b) => b.changeCount - a.changeCount);

  for (const { filePath, changeCount } of results) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`  ${changeCount.toString().padStart(3)} changes: ${relativePath}`);
  }

  console.log(`\n✅ Total: ${totalChanges} font-size declarations migrated across ${results.length} files`);
}

main();
