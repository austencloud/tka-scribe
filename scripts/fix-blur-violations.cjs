/**
 * Blur/Glassmorphism Violation Fixer
 *
 * Per CLAUDE.md: blur should ONLY be on modal backdrops.
 * This script removes backdrop-filter from content panels.
 *
 * SAFE: Keeps blur on elements with dark overlay backgrounds (rgba(0,0,0,x))
 * REMOVES: Blur on content panels (--theme-*, solid backgrounds)
 */

const fs = require('fs');
const path = require('path');

// Files with blur that should be KEPT (modal overlays verified manually)
const WHITELIST = new Set([
  // These use blur correctly on modal/overlay backdrops
  'ErrorModal.svelte', // Line 230 - overlay class
  'ConfirmDialog.svelte', // Modal backdrop
  'MigrationModal.svelte', // Modal backdrop
  'VideoRecordSettingsSheet.svelte', // Sheet overlay
  'ShortcutsHelp.svelte', // Help modal overlay (but not the panel inside)
  'MobileFullscreenPrompt.svelte', // Fullscreen prompt overlay
  // Scrollbar decorative blur (low priority, not content)
  'SimpleGlassScroll.svelte',
]);

// Pattern: backdrop-filter: blur(Xpx) including webkit prefix
const BLUR_PATTERN = /^\s*(backdrop-filter:\s*blur\([^)]+\);?|-webkit-backdrop-filter:\s*blur\([^)]+\);?)\s*$/gm;

// Pattern to detect if this is likely a content panel (has theme vars in nearby lines)
const CONTENT_PANEL_INDICATORS = [
  /var\(--theme-/,
  /var\(--settings-/,
  /background:\s*linear-gradient/,
];

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

function analyzeAndFixFile(filePath) {
  const fileName = path.basename(filePath);

  // Skip whitelisted files
  if (WHITELIST.has(fileName)) {
    return { skipped: true, reason: 'whitelisted' };
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Check if file has blur
  if (!content.includes('backdrop-filter')) {
    return { skipped: true, reason: 'no blur' };
  }

  // Split into lines for analysis
  const lines = content.split('\n');
  const removedLines = [];
  let modified = false;

  const newLines = lines.filter((line, index) => {
    // Check if this line has blur
    if (BLUR_PATTERN.test(line)) {
      // Look at surrounding context (10 lines before and after)
      const contextStart = Math.max(0, index - 10);
      const contextEnd = Math.min(lines.length, index + 10);
      const context = lines.slice(contextStart, contextEnd).join('\n');

      // If context has theme variables, this is likely a content panel - remove blur
      const isContentPanel = CONTENT_PANEL_INDICATORS.some((pattern) =>
        pattern.test(context)
      );

      // If context has overlay/dark background pattern, keep blur
      const isOverlay =
        /background:\s*rgba\(0,\s*0,\s*0/.test(context) ||
        /\.overlay\b/.test(context) ||
        /\.backdrop\b/.test(context);

      // Remove blur from content panels, keep on overlays
      if (isContentPanel && !isOverlay) {
        removedLines.push({
          lineNum: index + 1,
          content: line.trim(),
        });
        modified = true;
        return false; // Remove this line
      }
    }
    return true; // Keep line
  });

  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    return { modified: true, removedLines };
  }

  return { skipped: true, reason: 'blur appears to be on overlays (kept)' };
}

function main() {
  const srcDir = path.join(__dirname, '..', 'src', 'lib');

  console.log('🔍 Scanning for blur violations...\n');

  const files = getAllSvelteFiles(srcDir);
  const results = {
    modified: [],
    skipped: [],
    whitelisted: [],
  };

  for (const file of files) {
    const result = analyzeAndFixFile(file);
    const relativePath = path.relative(path.join(__dirname, '..'), file);

    if (result.modified) {
      results.modified.push({
        file: relativePath,
        removedLines: result.removedLines,
      });
    } else if (result.reason === 'whitelisted') {
      results.whitelisted.push(relativePath);
    } else {
      results.skipped.push({ file: relativePath, reason: result.reason });
    }
  }

  // Report
  console.log('📝 BLUR VIOLATIONS FIXED:\n');

  if (results.modified.length === 0) {
    console.log('  No violations found that could be auto-fixed.\n');
  } else {
    for (const { file, removedLines } of results.modified) {
      console.log(`  ${file}:`);
      for (const { lineNum, content } of removedLines) {
        console.log(`    L${lineNum}: ${content.substring(0, 60)}...`);
      }
      console.log('');
    }
  }

  console.log('\n⏭️  WHITELISTED (kept blur - modal overlays):');
  for (const file of results.whitelisted) {
    console.log(`  ✓ ${file}`);
  }

  console.log(`\n✅ Summary:`);
  console.log(`   ${results.modified.length} files fixed`);
  console.log(`   ${results.whitelisted.length} files whitelisted`);
  console.log(
    `   ${results.skipped.filter((s) => s.reason === 'blur appears to be on overlays (kept)').length} files with blur kept (overlay context)`
  );
}

main();
