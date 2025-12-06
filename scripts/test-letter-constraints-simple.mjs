/**
 * Standalone test for letter constraint generation
 * Run with: node scripts/test-letter-constraints-simple.mjs
 */

import 'reflect-metadata';
import { Container } from 'inversify';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock browser environment minimally
global.window = {
  csvData: null,
  matchMedia: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
};

// Preload CSV data
const diamondCsvPath = resolve(__dirname, '../static/DiamondPictographDataframe.csv');
const boxCsvPath = resolve(__dirname, '../static/BoxPictographDataframe.csv');

try {
  const diamondData = readFileSync(diamondCsvPath, 'utf-8');
  const boxData = readFileSync(boxCsvPath, 'utf-8');
  global.window.csvData = { diamondData, boxData };
  console.log('✅ Loaded CSV data');
} catch (error) {
  console.error('❌ Failed to load CSV data:', error.message);
  process.exit(1);
}

// Import modules
const { TYPES } = await import('../src/lib/shared/inversify/types.js');
const { Letter } = await import('../src/lib/shared/foundation/domain/models/Letter.js');
const { GridMode } = await import('../src/lib/shared/pictograph/grid/domain/enums/grid-enums.js');
const { PropType } = await import('../src/lib/shared/pictograph/prop/domain/enums/PropType.js');
const { DifficultyLevel } = await import('../src/lib/features/create/generate/shared/domain/models/generate-models.js');

// Import all the service modules we need
const { coreModule } = await import('../src/lib/shared/inversify/modules/core.module.js');
const { dataModule } = await import('../src/lib/shared/inversify/modules/data.module.js');
const { renderModule } = await import('../src/lib/shared/inversify/modules/render.module.js');
const { pictographModule } = await import('../src/lib/shared/inversify/modules/pictograph.module.js');
const { createModule } = await import('../src/lib/shared/inversify/modules/build.module.js');

// Create container and load modules
const container = new Container();

console.log('⏳ Loading modules...');
await container.load(
  coreModule,
  dataModule,
  renderModule,
  pictographModule,
  createModule
);
console.log('✅ Modules loaded');

// Get the orchestration service
const orchestrationService = container.get(TYPES.IGenerationOrchestrationService);
console.log('✅ Got GenerationOrchestrationService');

// Test configuration
const TEST_LETTERS = [
  { letter: Letter.A, name: 'A (Type 1)' },
  { letter: Letter.W, name: 'W (Type 2)' },
  { letter: Letter.W_DASH, name: "W' (Type 3)" },
  { letter: Letter.PHI, name: 'Φ (Type 4)' },
  { letter: Letter.ALPHA, name: 'α (Type 6)' },
];

console.log('\n' + '='.repeat(70));
console.log('  LETTER CONSTRAINT GENERATION TEST');
console.log('='.repeat(70));
console.log('');

const results = [];

// Test each letter
for (const { letter, name } of TEST_LETTERS) {
  console.log(`Testing: ${name}`);
  console.log('-'.repeat(70));

  const startTime = Date.now();

  try {
    const sequence = await orchestrationService.generateSequence({
      mode: 'freeform',
      length: 16,
      gridMode: GridMode.DIAMOND,
      propType: PropType.FAN,
      difficulty: DifficultyLevel.INTERMEDIATE,
      mustContainLetters: [letter],
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    const word = sequence.word || '';
    const letterStr = letter.toString();
    const contains = word.includes(letterStr);

    results.push({
      letter: name,
      success: true,
      word,
      duration,
      contains,
    });

    console.log(`  ✓ Generated: "${word}" (${duration}ms)`);
    console.log(`  Contains '${letterStr}': ${contains ? '✅ YES' : '❌ NO'}`);
    if (!contains) {
      console.log(`  ⚠️  WARNING: Word does not contain required letter!`);
    }
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    results.push({
      letter: name,
      success: false,
      error: error.message,
      duration,
    });

    console.log(`  ✗ FAILED: ${error.message}`);
    console.log(`  Duration: ${duration}ms`);
  }

  console.log('');
}

// Calculate and display summary
console.log('='.repeat(70));
console.log('  SUMMARY');
console.log('='.repeat(70));

const successful = results.filter(r => r.success && r.contains);
const failed = results.filter(r => !r.success || !r.contains);
const avgDuration = successful.reduce((sum, r) => sum + r.duration, 0) / successful.length;
const maxDuration = Math.max(...successful.map(r => r.duration));
const minDuration = Math.min(...successful.map(r => r.duration));

console.log(`Total tests: ${results.length}`);
console.log(`Successful: ${successful.length} (${((successful.length / results.length) * 100).toFixed(1)}%)`);
console.log(`Failed: ${failed.length}`);
console.log('');
console.log(`Average duration: ${avgDuration.toFixed(0)}ms`);
console.log(`Min duration: ${minDuration}ms`);
console.log(`Max duration: ${maxDuration}ms`);
console.log('');

const allCorrect = successful.length === results.length;
console.log(`All sequences contain required letter: ${allCorrect ? '✅ YES' : '❌ NO'}`);

if (failed.length > 0) {
  console.log('');
  console.log('Failed tests:');
  failed.forEach(f => {
    console.log(`  - ${f.letter}: ${f.error || 'Missing required letter'}`);
  });
}

console.log('='.repeat(70));

// Exit with appropriate code
process.exit(failed.length > 0 ? 1 : 0);
