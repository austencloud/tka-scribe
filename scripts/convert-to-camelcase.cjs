/**
 * Convert sequence-index.json from snake_case to camelCase
 * Also fixes legacy paths, removes cruft, and normalizes data.
 *
 * This migrates legacy desktop app data format to modern JS/TS conventions.
 *
 * Usage: node scripts/convert-to-camelcase.cjs
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '..', 'static', 'data', 'sequence-index.json');
const OUTPUT_FILE = INPUT_FILE; // Overwrite in place
const BACKUP_FILE = path.join(__dirname, '..', 'static', 'data', 'sequence-index.backup.json');

/**
 * Fix legacy paths in string values
 */
function fixLegacyPaths(value) {
  if (typeof value !== 'string') return value;

  // Fix /Explore/ paths to /gallery/
  if (value.startsWith('/Explore/')) {
    return value.replace(/^\/Explore\//, '/gallery/');
  }

  return value;
}

/**
 * Convert snake_case string to camelCase
 */
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Fields that should remain snake_case (if any)
 * Currently none - we want full conversion
 */
const PRESERVE_KEYS = new Set([
  // Add any keys that should stay snake_case here
]);

/**
 * Keys to remove entirely from top-level sequence objects
 */
const REMOVE_TOP_LEVEL_KEYS = new Set([
  'originalPath',       // Legacy desktop app path, not useful
  'difficultyLevel',    // Legacy string format, use numeric 'level' instead
  'startingPosition',   // Hallucinated "center" value, not real
  'propType',           // Unreliable at top level, use originalPropType if needed
]);

/**
 * Keys to remove from metadata object
 */
const REMOVE_METADATA_KEYS = new Set([
  'source',       // "tka_dictionary" - not useful
  'realSequence', // Boolean flag we don't use
  'aspectRatio',  // Redundant when we have width/height
]);

/**
 * Keys to remove from fullMetadata.sequence[0] (legacy CAP flags)
 */
const REMOVE_SEQUENCE_META_KEYS = new Set([
  'isPermutable',
  'isStrictlyRotationalPermutation',
  'isStrictlyMirroredPermutation',
  'isStrictlyColorswappedPermutation',
  'isMirroredColorSwappedPermutation',
  'isRotationalColorswappedPermutation',
  // Additional legacy CAP flags (snake_case format)
  'isStrictRotated_CAP',
  'isStrictMirrored_CAP',
  'isStrictSwapped_CAP',
  'isMirroredSwapped_CAP',
  'isRotatedSwapped_CAP',
  'canBe_CAP',
]);

/**
 * Placeholder tags to remove
 */
const PLACEHOLDER_TAGS = new Set(['flow', 'practice']);

/**
 * Value transformations for specific fields
 */
const VALUE_TRANSFORMS = {
  // propRotDir: "no_rot" → "noRotation"
  'propRotDir': (value) => value === 'no_rot' ? 'noRotation' : value,
  // Author: "TKA Explore" → "Austen Cloud"
  'author': (value) => value === 'TKA Explore' ? 'Austen Cloud' : value,
};

/**
 * Convert with selective preservation, path fixing, key removal, and value transforms
 */
function convertKeysSelective(obj, context = 'root') {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item, i) => convertKeysSelective(item, context));
  }

  if (typeof obj === 'object') {
    const converted = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip keys that should be removed based on context
      if (context === 'sequence' && REMOVE_TOP_LEVEL_KEYS.has(key)) {
        continue;
      }
      if (context === 'metadata' && REMOVE_METADATA_KEYS.has(key)) {
        continue;
      }
      if (context === 'sequenceMeta' && REMOVE_SEQUENCE_META_KEYS.has(key)) {
        continue;
      }

      const newKey = PRESERVE_KEYS.has(key) ? key : snakeToCamel(key);

      // Determine context for nested objects
      let childContext = context;
      if (key === 'metadata') childContext = 'metadata';
      else if (key === 'fullMetadata') childContext = 'fullMetadata';
      else if (context === 'fullMetadata' && key === 'sequence') childContext = 'sequenceArray';

      // First item in sequence array is metadata, rest are beats
      let processedValue;
      if (context === 'sequenceArray' && typeof value === 'object' && !Array.isArray(value)) {
        processedValue = convertKeysSelective(value, 'sequenceMeta');
      } else if (Array.isArray(value) && key === 'sequence') {
        // Process sequence array - first item is metadata, rest are beats
        processedValue = value.map((item, i) =>
          convertKeysSelective(item, i === 0 ? 'sequenceMeta' : 'beat')
        );
      } else {
        processedValue = convertKeysSelective(value, childContext);
      }

      // Apply value transformations
      if (VALUE_TRANSFORMS[key] && typeof processedValue === 'string') {
        processedValue = VALUE_TRANSFORMS[key](processedValue);
      }

      converted[newKey] = processedValue;
    }
    return converted;
  }

  // Fix string values (legacy paths)
  if (typeof obj === 'string') {
    return fixLegacyPaths(obj);
  }

  return obj;
}

/**
 * Post-process sequences to fix/normalize data
 * - Copy level from metadata to top level
 * - Remove placeholder tags
 * - Copy propType to originalPropType if we want to preserve the original intent
 */
function postProcessSequences(data) {
  if (!data.sequences) return data;

  let levelsCopied = 0;
  let tagsRemoved = 0;
  let authorsFixed = 0;
  let propRotDirFixed = 0;

  for (const seq of data.sequences) {
    // Copy level from fullMetadata.sequence[0].level to top level if not present
    if (seq.level === undefined && seq.fullMetadata?.sequence?.[0]?.level !== undefined) {
      seq.level = seq.fullMetadata.sequence[0].level;
      levelsCopied++;
    }

    // Remove placeholder tags
    if (Array.isArray(seq.tags)) {
      const originalLength = seq.tags.length;
      seq.tags = seq.tags.filter(tag => !PLACEHOLDER_TAGS.has(tag));
      if (seq.tags.length < originalLength) {
        tagsRemoved++;
      }
      // If all tags were placeholders, remove the tags array entirely
      if (seq.tags.length === 0) {
        delete seq.tags;
      }
    }

    // Fix author at top level
    if (seq.author === 'TKA Explore') {
      seq.author = 'Austen Cloud';
      authorsFixed++;
    }

    // Fix propRotDir in beat data
    seq.fullMetadata?.sequence?.forEach((beat, i) => {
      if (i === 0) return; // Skip metadata
      if (beat.blueAttributes?.propRotDir === 'no_rot') {
        beat.blueAttributes.propRotDir = 'noRotation';
        propRotDirFixed++;
      }
      if (beat.redAttributes?.propRotDir === 'no_rot') {
        beat.redAttributes.propRotDir = 'noRotation';
        propRotDirFixed++;
      }
    });
  }

  console.log(`Post-processing results:`);
  console.log(`  - Copied ${levelsCopied} level values to top level`);
  console.log(`  - Removed placeholder tags from ${tagsRemoved} sequences`);
  console.log(`  - Fixed ${authorsFixed} "TKA Explore" authors to "Austen Cloud"`);
  console.log(`  - Fixed ${propRotDirFixed} "no_rot" → "noRotation" conversions`);
  console.log('');

  return data;
}

/**
 * Collect statistics before conversion
 */
function collectStats(data) {
  const stats = {
    snakeCaseKeys: new Map(),
    tkaExploreAuthors: 0,
    centerPositions: 0,
    placeholderTags: 0,
    metadataSource: 0,
    realSequence: 0,
    aspectRatio: 0,
    legacyCAPFlags: 0,
    noRotValues: 0,
    propTypeAtTop: 0,
  };

  function walk(obj, path = '') {
    if (obj === null || obj === undefined || typeof obj !== 'object') return;

    if (Array.isArray(obj)) {
      obj.forEach((item, i) => walk(item, `${path}[${i}]`));
      return;
    }

    for (const [key, value] of Object.entries(obj)) {
      // Track snake_case keys
      if (key.includes('_')) {
        const camelKey = snakeToCamel(key);
        const statKey = `${key} → ${camelKey}`;
        stats.snakeCaseKeys.set(statKey, (stats.snakeCaseKeys.get(statKey) || 0) + 1);
      }

      // Track specific issues
      if (key === 'author' && value === 'TKA Explore') stats.tkaExploreAuthors++;
      if (key === 'startingPosition' && value === 'center') stats.centerPositions++;
      if (key === 'tags' && Array.isArray(value)) {
        if (value.some(t => PLACEHOLDER_TAGS.has(t))) stats.placeholderTags++;
      }
      if (key === 'source' && value === 'tka_dictionary') stats.metadataSource++;
      if (key === 'realSequence') stats.realSequence++;
      if (key === 'aspectRatio') stats.aspectRatio++;
      if (REMOVE_SEQUENCE_META_KEYS.has(key)) stats.legacyCAPFlags++;
      if (key === 'propRotDir' && value === 'no_rot') stats.noRotValues++;
      if (path.match(/sequences\[\d+\]$/) && key === 'propType') stats.propTypeAtTop++;

      walk(value, `${path}.${key}`);
    }
  }

  walk(data);
  return stats;
}

function main() {
  console.log('='.repeat(60));
  console.log('Sequence Data Cleanup & Conversion');
  console.log('='.repeat(60));
  console.log('');

  // Read input file
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Error: Input file not found: ${INPUT_FILE}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
  const data = JSON.parse(rawData);

  // Create backup
  console.log(`Creating backup at: ${BACKUP_FILE}`);
  fs.writeFileSync(BACKUP_FILE, rawData);

  // Count sequences
  const sequenceCount = data.sequences?.length ?? 0;
  console.log(`Found ${sequenceCount} sequences to process\n`);

  // Collect and display stats
  const stats = collectStats(data);

  console.log('Issues to fix:');
  console.log(`  - "TKA Explore" authors: ${stats.tkaExploreAuthors}`);
  console.log(`  - Hallucinated "center" positions: ${stats.centerPositions}`);
  console.log(`  - Placeholder tags ["flow", "practice"]: ${stats.placeholderTags}`);
  console.log(`  - "source: tka_dictionary" in metadata: ${stats.metadataSource}`);
  console.log(`  - "realSequence" flags: ${stats.realSequence}`);
  console.log(`  - Redundant "aspectRatio": ${stats.aspectRatio}`);
  console.log(`  - Legacy CAP flags (isPermutable, etc.): ${stats.legacyCAPFlags}`);
  console.log(`  - "no_rot" propRotDir values: ${stats.noRotValues}`);
  console.log(`  - Unreliable top-level propType: ${stats.propTypeAtTop}`);
  console.log('');

  if (stats.snakeCaseKeys.size > 0) {
    console.log('snake_case keys to convert:');
    const sortedStats = Array.from(stats.snakeCaseKeys.entries()).sort((a, b) => b[1] - a[1]);
    for (const [conversion, count] of sortedStats) {
      console.log(`  ${conversion} (${count} occurrences)`);
    }
    console.log('');
  }

  // Convert the data
  console.log('Converting data...\n');
  let convertedData = { sequences: [] };

  for (const seq of data.sequences) {
    const converted = convertKeysSelective(seq, 'sequence');
    convertedData.sequences.push(converted);
  }

  // Post-process to normalize data
  convertedData = postProcessSequences(convertedData);

  // Write output
  console.log(`Writing converted data to: ${OUTPUT_FILE}`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(convertedData, null, 2));

  // Verify results
  console.log('\n' + '='.repeat(60));
  console.log('Verification');
  console.log('='.repeat(60));

  const verifyData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8'));
  const verifyStats = collectStats(verifyData);

  console.log('Remaining issues (should all be 0):');
  console.log(`  - "TKA Explore" authors: ${verifyStats.tkaExploreAuthors}`);
  console.log(`  - Hallucinated "center" positions: ${verifyStats.centerPositions}`);
  console.log(`  - Placeholder tags: ${verifyStats.placeholderTags}`);
  console.log(`  - "source: tka_dictionary": ${verifyStats.metadataSource}`);
  console.log(`  - "realSequence" flags: ${verifyStats.realSequence}`);
  console.log(`  - Redundant "aspectRatio": ${verifyStats.aspectRatio}`);
  console.log(`  - Legacy CAP flags: ${verifyStats.legacyCAPFlags}`);
  console.log(`  - "no_rot" propRotDir values: ${verifyStats.noRotValues}`);
  console.log(`  - Top-level propType: ${verifyStats.propTypeAtTop}`);
  console.log(`  - snake_case keys remaining: ${verifyStats.snakeCaseKeys.size}`);

  console.log('\n✅ Conversion complete!');
  console.log(`  - Backup saved to: ${BACKUP_FILE}`);
}

main();
