#!/usr/bin/env node

/**
 * Fix Injectable Imports Script
 * 
 * Adds missing "import { injectable } from 'inversify';" to files that have @injectable() decorator
 */

import fs from 'fs/promises';
import path from 'path';

const FILES_TO_FIX = [
  'src/lib/services/implementations/data/CSVParserService.ts',
  'src/lib/services/implementations/data/DataTransformationService.ts',
  'src/lib/services/implementations/data/LetterQueryService.ts',
  'src/lib/services/implementations/data/MotionQueryService.ts',
  'src/lib/services/implementations/domain/GridModeDeriver.ts',
  'src/lib/services/implementations/domain/LetterDeriver.ts',
  'src/lib/services/implementations/domain/PictographValidatorService.ts',
  'src/lib/services/implementations/domain/PositionPatternService.ts',
  'src/lib/services/implementations/rendering/SvgConfiguration.ts',
  'src/lib/services/implementations/image-export/FilenameGeneratorService.ts',
  'src/lib/services/implementations/image-export/ExportOptionsValidator.ts'
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
      console.log(`❌ No import statements found in ${filePath}`);
      return false;
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
