#!/usr/bin/env node

/**
 * Fix Missing Injectable Imports Script
 * 
 * Adds missing "import { injectable } from 'inversify';" to files that have @injectable() decorator
 */

import fs from 'fs/promises';

const FILES_TO_FIX = [
  'src/lib/services/implementations/image-export/ExportMemoryCalculator.ts',
  'src/lib/services/implementations/rendering/BeatGridService.ts',
  'src/lib/services/implementations/image-export/ExportConfigurationManager.ts'
];

async function fixInjectableImport(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Check if already has injectable import
    if (content.includes('import { injectable }')) {
      console.log(`✅ ${filePath} already has injectable import`);
      return false;
    }
    
    // Check if has @injectable() decorator
    if (!content.includes('@injectable()')) {
      console.log(`⚠️ ${filePath} doesn't have @injectable() decorator`);
      return false;
    }
    
    // Find the first import statement and add inversify import after it
    const importRegex = /^import.*from.*['"];$/m;
    const match = content.match(importRegex);
    
    if (match) {
      const insertIndex = content.indexOf(match[0]) + match[0].length;
      const updatedContent = content.slice(0, insertIndex) + 
        '\nimport { injectable } from "inversify";' + 
        content.slice(insertIndex);
      
      await fs.writeFile(filePath, updatedContent, 'utf-8');
      console.log(`✅ Added injectable import to ${filePath}`);
      return true;
    } else {
      // No imports found, add at the top
      const updatedContent = 'import { injectable } from "inversify";\n\n' + content;
      await fs.writeFile(filePath, updatedContent, 'utf-8');
      console.log(`✅ Added injectable import at top of ${filePath}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Failed to fix ${filePath}:`, error.message);
    return false;
  }
}

async function fixAllImports() {
  console.log('🔧 Fixing missing injectable imports...');
  
  let fixedCount = 0;
  
  for (const filePath of FILES_TO_FIX) {
    const success = await fixInjectableImport(filePath);
    if (success) {
      fixedCount++;
    }
  }
  
  console.log(`\n🎉 Fixed ${fixedCount}/${FILES_TO_FIX.length} files`);
}

fixAllImports().catch(console.error);
