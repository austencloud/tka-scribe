#!/usr/bin/env node

/**
 * Update sequence-index.json to reference WebP files instead of PNG files
 * This fixes the 404 errors caused by trying to load PNG files that were converted to WebP
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateSequenceIndex() {
  const indexPath = path.join(__dirname, '..', 'static', 'sequence-index.json');
  
  try {
    console.log('📖 Reading sequence-index.json...');
    const content = await fs.readFile(indexPath, 'utf8');
    
    console.log('🔄 Converting PNG references to WebP...');
    // Replace all .png references with .webp
    const updatedContent = content.replace(/\.png/g, '.webp');
    
    console.log('💾 Writing updated sequence-index.json...');
    await fs.writeFile(indexPath, updatedContent, 'utf8');
    
    console.log('✅ Successfully updated sequence-index.json to use WebP files!');
    
    // Count the number of changes made
    const pngMatches = content.match(/\.png/g);
    const changeCount = pngMatches ? pngMatches.length : 0;
    console.log(`🔢 Updated ${changeCount} PNG references to WebP`);
    
  } catch (error) {
    console.error('❌ Error updating sequence-index.json:', error);
    process.exit(1);
  }
}

updateSequenceIndex();
