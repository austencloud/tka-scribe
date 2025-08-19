#!/usr/bin/env node

/**
 * TKA Web App - Architecture Validation Script
 *
 * This script validates the project architecture and patterns to ensure
 * compliance with TKA's architectural guidelines.
 *
 * Architecture Rules:
 * 1. Svelte 5 runes only - no stores
 * 2. Business logic in services, not components
 * 3. DI container for service resolution
 * 4. Clean separation of concerns
 * 5. No runes in service classes
 * 6. Proper file organization
 */

import { readdir, readFile, stat } from "fs/promises";
import { join, extname, relative, sep } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// Colors for output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

// Architecture validation rules
const validationRules = [
  {
    name: "No Svelte Stores",
    description: "Ensure no Svelte stores are used (should use runes instead)",
    check: checkNoSvelteStores,
    severity: "error",
  },
  {
    name: "Service Layer Separation",
    description: "Ensure business logic is in services, not components",
    check: checkServiceLayerSeparation,
    severity: "warning",
  },
  {
    name: "Proper File Organization",
    description: "Validate file organization follows TKA patterns",
    check: checkFileOrganization,
    severity: "warning",
  },
  {
    name: "DI Container Usage",
    description: "Ensure services use dependency injection",
    check: checkDIContainerUsage,
    severity: "warning",
  },
  {
    name: "No Runes in Pure Services",
    description:
      "Ensure pure service classes (.ts) don't use Svelte runes (.svelte.ts files are allowed)",
    check: checkNoRunesInServices,
    severity: "error",
  },
];

/**
 * Get all files recursively from a directory
 */
async function getAllFiles(dir, extensions = [".ts", ".js", ".svelte"]) {
  const files = [];

  async function traverse(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other irrelevant directories
        if (
          !["node_modules", ".git", "build", "dist", ".svelte-kit"].includes(
            entry.name
          )
        ) {
          await traverse(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  await traverse(dir);
  return files;
}

/**
 * Read file content safely
 */
async function readFileContent(filePath) {
  try {
    return await readFile(filePath, "utf-8");
  } catch (error) {
    return null;
  }
}

/**
 * Check for Svelte stores usage
 */
async function checkNoSvelteStores() {
  const issues = [];
  const files = await getAllFiles(join(projectRoot, "src"));

  for (const file of files) {
    const content = await readFileContent(file);
    if (!content) continue;

    const relativePath = relative(projectRoot, file);

    // Check for store imports
    if (
      content.includes("from 'svelte/store'") ||
      content.includes('from "svelte/store"')
    ) {
      issues.push({
        file: relativePath,
        line:
          content
            .split("\n")
            .findIndex((line) => line.includes("svelte/store")) + 1,
        message: "Svelte store import detected - should use runes instead",
      });
    }

    // Check for actual store creation functions (not runes)
    // Only flag these if they're NOT preceded by $ (which would be runes)
    const storePatterns = [
      /(?<!\$)\b(writable|readable)\s*\(/g, // writable() and readable() but not $writable
      /\$\w+\.set\(/g, // store.set() calls
      /\$\w+\.update\(/g, // store.update() calls
    ];

    // Special handling for derived() and get() - only flag if imported from svelte/store
    const hasStoreImport =
      content.includes("from 'svelte/store'") ||
      content.includes('from "svelte/store"');

    if (hasStoreImport) {
      // If svelte/store is imported, then derived() and get() are store usage
      const legacyStorePatterns = [
        /(?<!\$)\bderived\s*\(/g, // derived() but not $derived
        /(?<!\$)\bget\s*\(/g, // get() but not $get (though $get doesn't exist)
      ];
      storePatterns.push(...legacyStorePatterns);
    }

    for (const pattern of storePatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const lineNumber = content.substring(0, match.index).split("\n").length;
        issues.push({
          file: relativePath,
          line: lineNumber,
          message: `Store usage detected: ${match[0]} - should use runes instead`,
        });
      }
    }
  }

  return issues;
}

/**
 * Check service layer separation
 */
async function checkServiceLayerSeparation() {
  const issues = [];
  const componentFiles = await getAllFiles(
    join(projectRoot, "src/lib/components")
  );

  for (const file of componentFiles) {
    if (!file.endsWith(".svelte")) continue;

    const content = await readFileContent(file);
    if (!content) continue;

    const relativePath = relative(projectRoot, file);

    // Check for business logic patterns in components
    const businessLogicPatterns = [
      /async\s+function\s+\w+.*\{[\s\S]*?fetch\(/g,
      /const\s+\w+\s*=\s*async\s*\(.*\)\s*=>\s*\{[\s\S]*?fetch\(/g,
      /\.\s*then\s*\(/g,
      /await\s+fetch\(/g,
    ];

    for (const pattern of businessLogicPatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const lineNumber = content.substring(0, match.index).split("\n").length;
        issues.push({
          file: relativePath,
          line: lineNumber,
          message:
            "Business logic detected in component - should be in service layer",
        });
      }
    }
  }

  return issues;
}

/**
 * Check file organization
 */
async function checkFileOrganization() {
  const issues = [];
  const srcDir = join(projectRoot, "src");

  // Expected directory structure
  const expectedDirs = [
    "lib/components",
    "lib/services",
    "lib/state",
    "lib/domain",
    "routes",
  ];

  for (const dir of expectedDirs) {
    const fullPath = join(srcDir, dir);
    try {
      const stats = await stat(fullPath);
      if (!stats.isDirectory()) {
        issues.push({
          file: dir,
          line: 0,
          message: `Expected directory not found: ${dir}`,
        });
      }
    } catch (error) {
      issues.push({
        file: dir,
        line: 0,
        message: `Expected directory not found: ${dir}`,
      });
    }
  }

  return issues;
}

/**
 * Check DI container usage
 */
async function checkDIContainerUsage() {
  const issues = [];
  const serviceFiles = await getAllFiles(join(projectRoot, "src/lib/services"));

  for (const file of serviceFiles) {
    if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

    const content = await readFileContent(file);
    if (!content) continue;

    const relativePath = relative(projectRoot, file);

    // Skip files that SHOULD instantiate services directly
    const shouldSkip =
      file.includes(".test.") || // Test files
      file.includes(".spec.") || // Spec files
      file.includes("Factory.ts") || // Factory pattern files
      file.includes("ServiceContainer.ts") || // DI container itself
      file.includes(sep + "di" + sep + "registration" + sep) || // DI registration files
      file.includes("service-registry.ts") || // Service registry
      file.includes("bootstrap.ts"); // Bootstrap files

    if (shouldSkip) {
      continue;
    }

    // Check for direct service instantiation instead of DI
    if (content.includes("new ") && content.includes("Service")) {
      const lines = content.split("\n");
      lines.forEach((line, index) => {
        if (
          line.includes("new ") &&
          line.includes("Service") &&
          !line.includes("//")
        ) {
          issues.push({
            file: relativePath,
            line: index + 1,
            message:
              "Direct service instantiation detected - consider using DI container",
          });
        }
      });
    }
  }

  return issues;
}

/**
 * Check for runes in services
 */
async function checkNoRunesInServices() {
  const issues = [];
  const serviceFiles = await getAllFiles(join(projectRoot, "src/lib/services"));

  for (const file of serviceFiles) {
    if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

    // Skip .svelte.ts files - these are state management files that SHOULD use runes
    if (file.endsWith(".svelte.ts")) {
      continue;
    }

    const content = await readFileContent(file);
    if (!content) continue;

    const relativePath = relative(projectRoot, file);

    // Check for rune usage in services
    const runePatterns = [
      /\$state\s*\(/g,
      /\$derived\s*\(/g,
      /\$effect\s*\(/g,
      /\$props\s*\(/g,
    ];

    for (const pattern of runePatterns) {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const lineNumber = content.substring(0, match.index).split("\n").length;
        issues.push({
          file: relativePath,
          line: lineNumber,
          message: `Rune usage detected in pure service: ${match[0]} - pure services should be TypeScript only`,
        });
      }
    }
  }

  return issues;
}

/**
 * Run all validation rules
 */
async function runValidation() {
  console.log(
    `${colors.cyan}${colors.bright}TKA Architecture Validation${colors.reset}\n`
  );

  let totalIssues = 0;
  let errorCount = 0;
  let warningCount = 0;

  for (const rule of validationRules) {
    console.log(`${colors.blue}Checking: ${rule.name}${colors.reset}`);
    console.log(`${colors.yellow}${rule.description}${colors.reset}`);

    try {
      const issues = await rule.check();

      if (issues.length === 0) {
        console.log(`${colors.green}✅ PASSED${colors.reset}\n`);
      } else {
        const severity = rule.severity === "error" ? colors.red : colors.yellow;
        const icon = rule.severity === "error" ? "❌" : "⚠️";

        console.log(
          `${severity}${icon} ${issues.length} issue(s) found${colors.reset}`
        );

        issues.forEach((issue) => {
          console.log(
            `  ${severity}• ${issue.file}:${issue.line} - ${issue.message}${colors.reset}`
          );
        });

        console.log();

        totalIssues += issues.length;
        if (rule.severity === "error") {
          errorCount += issues.length;
        } else {
          warningCount += issues.length;
        }
      }
    } catch (error) {
      console.log(`${colors.red}❌ ERROR: ${error.message}${colors.reset}\n`);
      errorCount++;
      totalIssues++;
    }
  }

  // Summary
  console.log(
    `${colors.cyan}${colors.bright}Architecture Validation Summary${colors.reset}`
  );
  console.log(`Total Issues: ${totalIssues}`);
  console.log(`${colors.red}Errors: ${errorCount}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${warningCount}${colors.reset}`);

  if (totalIssues === 0) {
    console.log(
      `\n${colors.green}${colors.bright}🎉 Architecture validation passed!${colors.reset}`
    );
    process.exit(0);
  } else if (errorCount === 0) {
    console.log(
      `\n${colors.yellow}Architecture validation completed with warnings.${colors.reset}`
    );
    process.exit(0);
  } else {
    console.log(
      `\n${colors.red}Architecture validation failed with errors.${colors.reset}`
    );
    process.exit(1);
  }
}

// Run validation
runValidation().catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
