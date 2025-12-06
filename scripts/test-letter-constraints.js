/**
 * Test script for letter constraint generation
 * Tests rejection sampling across different letters to verify:
 * 1. Reliability (success rate)
 * 2. Performance (time to generate)
 * 3. Correctness (word contains required letter)
 */

import 'reflect-metadata';
import { container } from '../src/lib/shared/inversify/container.js';
import { TYPES } from '../src/lib/shared/inversify/types.js';
import { Letter } from '../src/lib/shared/foundation/domain/models/Letter.js';
import { GridMode } from '../src/lib/shared/pictograph/grid/domain/enums/grid-enums.js';
import { PropType } from '../src/lib/shared/pictograph/prop/domain/enums/PropType.js';
import { DifficultyLevel } from '../src/lib/features/create/generate/shared/domain/models/generate-models.js';

// Test letters from different types
const TEST_LETTERS = [
  Letter.A,      // Type 1: Common dual-shift
  Letter.W,      // Type 2: Shift
  Letter.W_DASH, // Type 3: Cross-shift
  Letter.PHI,    // Type 4: Dash
  Letter.ALPHA,  // Type 6: Static
];

async function testLetterConstraint(letter, mode = 'freeform', length = 16) {
  const service = container.get(TYPES.IGenerationOrchestrationService);

  const options = {
    mode,
    length,
    gridMode: GridMode.DIAMOND,
    propType: PropType.FAN,
    difficulty: DifficultyLevel.INTERMEDIATE,
    mustContainLetters: [letter],
  };

  const startTime = Date.now();

  try {
    const sequence = await service.generateSequence(options);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const word = sequence.word || '';
    const letterStr = letter.toString();
    const contains = word.includes(letterStr);

    return {
      success: true,
      letter: letterStr,
      word,
      contains,
      duration,
      beatCount: sequence.beats?.length || 0,
    };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
      success: false,
      letter: letter.toString(),
      error: error.message,
      duration,
    };
  }
}

async function runTests() {
  console.log('='.repeat(70));
  console.log('  LETTER CONSTRAINT GENERATION TEST');
  console.log('='.repeat(70));
  console.log('');

  const results = [];

  for (const letter of TEST_LETTERS) {
    console.log(`Testing letter: ${letter.toString()}`);
    console.log('-'.repeat(70));

    // Test freeform mode
    const freeformResult = await testLetterConstraint(letter, 'freeform', 16);
    results.push({ ...freeformResult, mode: 'freeform' });

    if (freeformResult.success) {
      console.log(`  ✓ Freeform: ${freeformResult.word} (${freeformResult.duration}ms)`);
      console.log(`    Contains '${freeformResult.letter}': ${freeformResult.contains ? 'YES' : 'NO'}`);
    } else {
      console.log(`  ✗ Freeform: FAILED - ${freeformResult.error}`);
      console.log(`    Duration: ${freeformResult.duration}ms`);
    }

    // Test circular mode
    const circularResult = await testLetterConstraint(letter, 'circular', 16);
    results.push({ ...circularResult, mode: 'circular' });

    if (circularResult.success) {
      console.log(`  ✓ Circular: ${circularResult.word} (${circularResult.duration}ms)`);
      console.log(`    Contains '${circularResult.letter}': ${circularResult.contains ? 'YES' : 'NO'}`);
    } else {
      console.log(`  ✗ Circular: FAILED - ${circularResult.error}`);
      console.log(`    Duration: ${circularResult.duration}ms`);
    }

    console.log('');
  }

  // Summary statistics
  console.log('='.repeat(70));
  console.log('  SUMMARY');
  console.log('='.repeat(70));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
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

  // Verify all successful ones actually contain the letter
  const allCorrect = successful.every(r => r.contains);
  console.log(`All successful sequences contain required letter: ${allCorrect ? 'YES ✓' : 'NO ✗'}`);

  if (failed.length > 0) {
    console.log('');
    console.log('Failed tests:');
    failed.forEach(f => {
      console.log(`  - ${f.letter} (${f.mode}): ${f.error}`);
    });
  }

  console.log('='.repeat(70));
}

runTests().catch(console.error);
