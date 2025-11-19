#!/usr/bin/env node

/**
 * Auto-fix script for noPropertyAccessFromIndexSignature errors
 * Converts dot notation to bracket notation for index signature properties
 */

import fs from 'fs';
import path from 'path';

// List of files with index signature errors (from typescript-errors-latest.txt)
const filesToFix = [
  'src/lib/shared/pictograph/grid/utils/grid-data-utils.ts',
  'src/lib/shared/background/shared/services/implementations/BackgroundConfigurationService.ts',
];

// Property patterns to fix (extracted from error messages)
const propertyReplacements = {
  'src/lib/shared/pictograph/grid/utils/grid-data-utils.ts': [
    'gridMode',
    'centerX',
    'centerY',
    'radius',
    'gridPoints',
  ],
  'src/lib/shared/background/shared/services/implementations/BackgroundConfigurationService.ts': [
    'density',
    'maxSize',
  ],
};

function fixIndexSignatureAccess(content, properties) {
  let fixed = content;

  for (const prop of properties) {
    // Pattern 1: data.property
    // Replace with: data["property"]
    const dotPattern = new RegExp(`\\b(\\w+)\\.${prop}\\b`, 'g');
    fixed = fixed.replace(dotPattern, `$1["${prop}"]`);
  }

  return fixed;
}

function processFile(filePath, properties) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return { success: false, changes: 0 };
  }

  const originalContent = fs.readFileSync(fullPath, 'utf-8');
  const fixedContent = fixIndexSignatureAccess(originalContent, properties);

  if (originalContent === fixedContent) {
    console.log(`ℹ️  No changes needed: ${filePath}`);
    return { success: true, changes: 0 };
  }

  // Count the number of replacements
  const changes = (fixedContent.match(/\["/g) || []).length - (originalContent.match(/\["/g) || []).length;

  fs.writeFileSync(fullPath, fixedContent, 'utf-8');
  console.log(`✅ Fixed ${changes} occurrences in: ${filePath}`);

  return { success: true, changes };
}

console.log('🔧 Auto-fixing index signature errors...\n');

let totalChanges = 0;
let filesProcessed = 0;

for (const filePath of filesToFix) {
  const properties = propertyReplacements[filePath];
  if (!properties) {
    console.log(`⚠️  No properties defined for: ${filePath}`);
    continue;
  }

  const result = processFile(filePath, properties);
  if (result.success) {
    filesProcessed++;
    totalChanges += result.changes;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Files processed: ${filesProcessed}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\n✨ Done! Run 'npm run check' to verify fixes.`);
