/**
 * Migrate hardcoded colors to CSS tokens
 *
 * Phase 1: Safe, high-impact replacements
 * - Semantic colors (error, success, warning, info)
 * - Accent colors (theme-accent, theme-accent-strong)
 * - Common rgba patterns for theme variables
 */

const fs = require("fs");
const path = require("path");

// =============================================================================
// MIGRATION RULES
// =============================================================================

const MIGRATIONS = [
  // Semantic Colors - These are constants, safe to replace everywhere
  {
    name: "semantic-error",
    pattern: /#ef4444\b/gi,
    replacement: "var(--semantic-error)",
    contexts: ["color", "background", "border", "fill", "stroke", "box-shadow"],
  },
  {
    name: "semantic-error-light",
    pattern: /#f87171\b/gi,
    replacement: "var(--semantic-error)", // Light variant, map to same token
    contexts: ["color", "background", "border", "fill", "stroke"],
  },
  {
    name: "semantic-error-dark",
    pattern: /#dc2626\b/gi,
    replacement: "var(--semantic-error)",
    contexts: ["color", "background", "border", "fill", "stroke"],
  },
  {
    name: "semantic-success",
    pattern: /#22c55e\b/gi,
    replacement: "var(--semantic-success)",
    contexts: ["color", "background", "border", "fill", "stroke"],
  },
  {
    name: "semantic-success-alt",
    pattern: /#10b981\b/gi,
    replacement: "var(--semantic-success)",
    contexts: ["color", "background", "border", "fill", "stroke"],
  },
  {
    name: "semantic-warning",
    pattern: /#f59e0b\b/gi,
    replacement: "var(--semantic-warning)",
    contexts: ["color", "background", "border", "fill", "stroke"],
  },
  {
    name: "semantic-warning-alt",
    pattern: /#fbbf24\b/gi,
    replacement: "var(--semantic-warning)",
    contexts: ["color", "background", "border", "fill", "stroke"],
  },
  {
    name: "semantic-info",
    pattern: /#3b82f6\b/gi,
    replacement: "var(--semantic-info)",
    contexts: ["color", "background", "border", "fill", "stroke"],
  },
  {
    name: "semantic-info-light",
    pattern: /#60a5fa\b/gi,
    replacement: "var(--semantic-info)",
    contexts: ["color", "background", "border", "fill", "stroke"],
  },

  // Accent Colors - Theme-adaptive
  {
    name: "theme-accent",
    pattern: /#6366f1\b/gi,
    replacement: "var(--theme-accent, #6366f1)",
    contexts: ["color", "background", "border", "fill", "stroke", "box-shadow"],
  },
  {
    name: "theme-accent-strong",
    pattern: /#8b5cf6\b/gi,
    replacement: "var(--theme-accent-strong, #8b5cf6)",
    contexts: ["color", "background", "border", "fill", "stroke", "box-shadow"],
  },

  // RGBA White patterns - Theme-adaptive (most impactful)
  {
    name: "theme-stroke",
    pattern: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.1\s*\)/gi,
    replacement: "var(--theme-stroke, rgba(255, 255, 255, 0.1))",
    contexts: ["border", "outline", "box-shadow"],
  },
  {
    name: "theme-stroke-strong",
    pattern: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.15\s*\)/gi,
    replacement: "var(--theme-stroke-strong, rgba(255, 255, 255, 0.15))",
    contexts: ["border", "outline"],
  },
  {
    name: "theme-card-bg-08",
    pattern: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.08\s*\)/gi,
    replacement: "var(--theme-card-bg, rgba(255, 255, 255, 0.08))",
    contexts: ["background"],
  },
  {
    name: "theme-card-bg-05",
    pattern: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.05\s*\)/gi,
    replacement: "var(--theme-card-bg, rgba(255, 255, 255, 0.05))",
    contexts: ["background"],
  },
  {
    name: "theme-card-hover-bg",
    pattern: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.12\s*\)/gi,
    replacement: "var(--theme-card-hover-bg, rgba(255, 255, 255, 0.12))",
    contexts: ["background"],
  },
  {
    name: "theme-text",
    pattern: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.9\s*\)/gi,
    replacement: "var(--theme-text, rgba(255, 255, 255, 0.9))",
    contexts: ["color"],
  },
  {
    name: "theme-text-dim-07",
    pattern: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.7\s*\)/gi,
    replacement: "var(--theme-text-dim, rgba(255, 255, 255, 0.7))",
    contexts: ["color"],
  },
  {
    name: "theme-text-dim-06",
    pattern: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.6\s*\)/gi,
    replacement: "var(--theme-text-dim, rgba(255, 255, 255, 0.6))",
    contexts: ["color"],
  },
  {
    name: "theme-text-dim-05",
    pattern: /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.5\s*\)/gi,
    replacement: "var(--theme-text-dim, rgba(255, 255, 255, 0.5))",
    contexts: ["color"],
  },

  // Shadow patterns
  {
    name: "theme-shadow-03",
    pattern: /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.3\s*\)/gi,
    replacement: "var(--theme-shadow, rgba(0, 0, 0, 0.3))",
    contexts: ["box-shadow"],
  },
  {
    name: "theme-shadow-02",
    pattern: /rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\.2\s*\)/gi,
    replacement: "var(--theme-shadow, rgba(0, 0, 0, 0.2))",
    contexts: ["box-shadow"],
  },
];

// =============================================================================
// HELPERS
// =============================================================================

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

/**
 * Check if a match is within a relevant CSS context
 */
function isInRelevantContext(content, matchIndex, contexts) {
  // Look backwards for the CSS property name
  const beforeMatch = content.substring(
    Math.max(0, matchIndex - 100),
    matchIndex
  );

  // Find the most recent property declaration
  const propertyMatch = beforeMatch.match(/([a-z-]+)\s*:\s*[^;]*$/i);
  if (!propertyMatch) return true; // If we can't determine, allow it

  const property = propertyMatch[1].toLowerCase();

  // Check if property matches any of the allowed contexts
  for (const ctx of contexts) {
    if (property.includes(ctx)) return true;
  }

  // Special cases
  if (contexts.includes("background") && property === "background") return true;
  if (contexts.includes("color") && property === "color") return true;
  if (
    contexts.includes("border") &&
    (property.startsWith("border") || property === "outline")
  )
    return true;
  if (contexts.includes("box-shadow") && property === "box-shadow") return true;
  if (contexts.includes("fill") && property === "fill") return true;
  if (contexts.includes("stroke") && property === "stroke") return true;

  return false;
}

/**
 * Skip if already wrapped in var()
 */
function isAlreadyTokenized(content, matchIndex) {
  const beforeMatch = content.substring(
    Math.max(0, matchIndex - 10),
    matchIndex
  );
  return beforeMatch.includes("var(");
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let totalChanges = 0;
  const changesPerRule = {};

  for (const migration of MIGRATIONS) {
    let match;
    const regex = new RegExp(migration.pattern.source, migration.pattern.flags);
    let newContent = content;
    let offset = 0;

    // Reset regex
    regex.lastIndex = 0;

    // We need to iterate manually to check context
    const matches = [];
    while ((match = regex.exec(content)) !== null) {
      matches.push({ index: match.index, match: match[0] });
    }

    // Process matches in reverse order to preserve indices
    for (let i = matches.length - 1; i >= 0; i--) {
      const { index, match: matchStr } = matches[i];

      // Skip if already tokenized
      if (isAlreadyTokenized(content, index)) continue;

      // For semantic colors, always replace (they're constants)
      // For theme colors, check context
      const isSemantic = migration.name.startsWith("semantic");

      if (
        isSemantic ||
        isInRelevantContext(content, index, migration.contexts)
      ) {
        newContent =
          newContent.substring(0, index) +
          migration.replacement +
          newContent.substring(index + matchStr.length);
        changesPerRule[migration.name] =
          (changesPerRule[migration.name] || 0) + 1;
        totalChanges++;
      }
    }

    content = newContent;
  }

  if (totalChanges > 0) {
    fs.writeFileSync(filePath, content, "utf8");
  }

  return { totalChanges, changesPerRule };
}

// =============================================================================
// MAIN
// =============================================================================

function main() {
  const srcDir = path.join(__dirname, "..", "src");

  console.log("🎨 Migrating hardcoded colors to CSS tokens...\n");

  const files = getAllSvelteAndCssFiles(srcDir);
  const results = [];
  let grandTotal = 0;
  const globalRuleCounts = {};

  for (const file of files) {
    const { totalChanges, changesPerRule } = processFile(file);
    if (totalChanges > 0) {
      results.push({ filePath: file, totalChanges, changesPerRule });
      grandTotal += totalChanges;

      for (const [rule, count] of Object.entries(changesPerRule)) {
        globalRuleCounts[rule] = (globalRuleCounts[rule] || 0) + count;
      }
    }
  }

  // Summary by rule
  console.log("📊 Migrations by token:\n");
  const sortedRules = Object.entries(globalRuleCounts).sort(
    (a, b) => b[1] - a[1]
  );
  for (const [rule, count] of sortedRules) {
    console.log(`  ${count.toString().padStart(5)} → ${rule}`);
  }

  console.log("\n📝 Files modified:\n");
  results.sort((a, b) => b.totalChanges - a.totalChanges);

  for (const { filePath, totalChanges } of results.slice(0, 30)) {
    const relativePath = path.relative(path.join(__dirname, ".."), filePath);
    console.log(
      `  ${totalChanges.toString().padStart(4)} changes: ${relativePath}`
    );
  }

  if (results.length > 30) {
    console.log(`  ... and ${results.length - 30} more files`);
  }

  console.log(
    `\n✅ Migrated ${grandTotal} color values across ${results.length} files`
  );
  console.log(
    "\n⚠️  Review changes - some edge cases may need manual adjustment"
  );
}

main();
