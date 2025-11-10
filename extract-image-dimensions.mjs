/**
 * Extract image dimensions and add them to sequence-index.json
 *
 * This script:
 * 1. Reads sequence-index.json
 * 2. For each sequence, finds its first thumbnail image
 * 3. Extracts the image dimensions
 * 4. Adds width/height to the sequence metadata
 * 5. Saves the updated sequence-index.json
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function extractImageDimensions() {
  console.log('📊 Extracting image dimensions...\n');

  // Read sequence-index.json
  const indexPath = path.join(__dirname, 'static', 'sequence-index.json');
  const indexData = JSON.parse(await fs.readFile(indexPath, 'utf8'));

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  // Process each sequence
  for (const sequence of indexData.sequences) {
    try {
      // Get first thumbnail path
      const thumbnailPath = sequence.thumbnails?.[0];
      if (!thumbnailPath) {
        console.log(`⚠️  No thumbnail for ${sequence.word}`);
        skipped++;
        continue;
      }

      // Resolve absolute path (thumbnails may start with /Explore/ or /gallery/)
      // Map /Explore/ to /gallery/
      const normalizedPath = thumbnailPath.replace('/Explore/', '/gallery/');
      const absolutePath = path.join(__dirname, 'static', normalizedPath);

      // Check if file exists
      try {
        await fs.access(absolutePath);
      } catch {
        console.log(`⚠️  File not found: ${thumbnailPath}`);
        skipped++;
        continue;
      }

      // Get image dimensions using sharp
      const image = sharp(absolutePath);
      const metadata = await image.metadata();
      const dimensions = { width: metadata.width, height: metadata.height };

      // Add dimensions to metadata
      if (!sequence.metadata) {
        sequence.metadata = {};
      }
      sequence.metadata.width = dimensions.width;
      sequence.metadata.height = dimensions.height;
      sequence.metadata.aspectRatio = (dimensions.width / dimensions.height).toFixed(3);

      console.log(`✅ ${sequence.word}: ${dimensions.width}x${dimensions.height} (${sequence.metadata.aspectRatio})`);
      updated++;

    } catch (error) {
      console.error(`❌ Error processing ${sequence.word}:`, error.message);
      errors++;
    }
  }

  // Save updated index
  await fs.writeFile(indexPath, JSON.stringify(indexData, null, 2), 'utf8');

  console.log(`\n📝 Summary:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`\n✅ Updated sequence-index.json with image dimensions`);
}

extractImageDimensions().catch(console.error);
