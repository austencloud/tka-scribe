/**
 * Strip fallbacks from font-size tokens
 *
 * Converts: font-size: var(--font-size-sm, 14px)
 * To:       font-size: var(--font-size-sm)
 *
 * This makes missing tokens fail visibly instead of silently falling back.
 */

const fs = require('fs');
const path = require('path');

// Pattern: var(--font-size-XXX, Ypx) -> var(--font-size-XXX)
const FALLBACK_PATTERN = /var\((--font-size-[a-z0-9]+),\s*\d+px\)/g;

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
  let changeCount = 0;

  const modified = content.replace(FALLBACK_PATTERN, (match, tokenName) => {
    changeCount++;
    return `var(${tokenName})`;
  });

  if (changeCount > 0) {
    fs.writeFileSync(filePath, modified, 'utf8');
    return { filePath, changeCount };
  }

  return null;
}

function main() {
  const srcDir = path.join(__dirname, '..', 'src', 'lib');

  console.log('🔧 Stripping font-size fallbacks...\n');

  const files = getAllSvelteFiles(srcDir);
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

  results.sort((a, b) => b.changeCount - a.changeCount);

  for (const { filePath, changeCount } of results) {
    const relativePath = path.relative(path.join(__dirname, '..'), filePath);
    console.log(`  ${changeCount.toString().padStart(3)} stripped: ${relativePath}`);
  }

  console.log(`\n✅ Removed ${totalChanges} fallbacks across ${results.length} files`);
  console.log('\n⚠️  Run the app now - if anything looks broken, a token is missing from app.css');
}

main();
